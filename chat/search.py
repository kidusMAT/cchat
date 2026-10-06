"""Hybrid message search: lexical exactness plus lightweight semantic matching.

The service intentionally has no network dependency. It expands common
conversational concepts ("sad"/"feeling down", etc.) before scoring, which
keeps short messages useful in development and provides a deterministic
fallback for deployments that have not enabled an embedding provider yet.
"""
import re
from collections import Counter

from django.db.models import Q
from django.utils import timezone

from .models import SearchDocument

TOKEN_RE = re.compile(r"[\w']+", re.UNICODE)
STOP_WORDS = {'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'for', 'from', 'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was', 'we', 'what', 'with', 'you', 'your'}
CONCEPTS = {
    'sad': {'sad', 'down', 'depressed', 'unhappy', 'low', 'blue', 'heartbroken', 'upset'},
    'happy': {'happy', 'glad', 'joyful', 'cheerful', 'excited', 'content'},
    'angry': {'angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated'},
    'tired': {'tired', 'exhausted', 'sleepy', 'drained', 'burned', 'burnout'},
    'work': {'work', 'job', 'career', 'office', 'project', 'meeting'},
    'help': {'help', 'advice', 'support', 'guidance', 'assist', 'stuck'},
    'relationship': {'relationship', 'partner', 'dating', 'love', 'breakup', 'friendship'},
}
def stem(token):
    """Small English stemmer for chat-sized documents; keeps short words intact."""
    if len(token) <= 4:
        return token
    for suffix in ('ingly', 'edly', 'ing', 'ers', 'ies', 'ed', 'es', 'ly', 's'):
        if token.endswith(suffix) and len(token) - len(suffix) >= 3:
            return token[:-len(suffix)] + ('y' if suffix == 'ies' else '')
    return token


def tokenize(value):
    return [stem(token.lower()) for token in TOKEN_RE.findall(value or '') if token.lower() not in STOP_WORDS]


TERM_TO_CONCEPT = {
    variant: concept
    for concept, terms in CONCEPTS.items()
    for term in terms
    for variant in (term, stem(term) if len(term) > 4 else term)
}


def semantic_tokens(value):
    result = set(tokenize(value))
    for token in list(result):
        if token in TERM_TO_CONCEPT:
            result.add(TERM_TO_CONCEPT[token])
    return result


def index_message(message):
    if message.is_removed:
        SearchDocument.objects.filter(message=message).delete()
        return
    SearchDocument.objects.update_or_create(
        message=message,
        defaults={
            'conversation_id': message.conversation_id,
            'sender_id': message.sender_id,
            'text': message.text,
            'normalized_text': ' '.join(tokenize(message.text)),
            'semantic_terms': ' '.join(sorted(semantic_tokens(message.text))),
            'message_timestamp': message.timestamp,
        },
    )


def accessible_documents(user):
    public = Q(conversation__visibilities__is_public=True, conversation__visibilities__user__is_active=True)
    if user and user.is_authenticated:
        private = Q(conversation__participants=user)
        blocked = set()
        from .models import Block
        blocked = set(Block.objects.filter(Q(blocker=user) | Q(blocked=user)).values_list('blocker_id', 'blocked_id'))
        blocked = {blocked_id if blocker_id == user.id else blocker_id for blocker_id, blocked_id in blocked}
        return SearchDocument.objects.filter(Q(public | private), conversation__is_removed=False).exclude(conversation__participants__id__in=blocked).distinct()
    return SearchDocument.objects.filter(public, conversation__is_removed=False).distinct()


def hybrid_search(query, user, limit=30):
    query = query.strip()
    query_terms = tokenize(query)
    if not query_terms:
        return []
    semantic_query = semantic_tokens(query)
    documents = accessible_documents(user).select_related('message', 'conversation', 'sender').prefetch_related('conversation__participants')
    results = []
    phrase = ' '.join(query_terms)
    for document in documents.iterator():
        lexical_terms = tokenize(document.text)
        lexical = Counter(lexical_terms)
        exact_hits = sum(min(lexical[term], 3) for term in query_terms)
        phrase_boost = 2.5 if phrase in document.text.lower() else 0
        semantic_hits = len(semantic_query.intersection(set(document.semantic_terms.split())))
        if not exact_hits and not semantic_hits:
            continue
        lexical_score = exact_hits / max(len(query_terms), 1)
        semantic_score = semantic_hits / max(len(semantic_query), 1)
        age_days = max((timezone.now() - document.message_timestamp).total_seconds(), 0) / 86400
        recency = 1 / (1 + age_days)
        score = (0.65 * lexical_score) + (0.35 * semantic_score) + phrase_boost + (0.01 * recency)
        results.append((score, document))
    results.sort(key=lambda item: (item[0], item[1].message_timestamp), reverse=True)
    return results[:limit]
