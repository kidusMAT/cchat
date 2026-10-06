from django.core.management.base import BaseCommand

from chat.models import Message
from chat.search import index_message


class Command(BaseCommand):
    help = 'Build or refresh the CCHAT hybrid message search index.'

    def handle(self, *args, **options):
        total = 0
        for message in Message.objects.select_related('conversation', 'sender').iterator():
            index_message(message)
            total += 1
        self.stdout.write(self.style.SUCCESS(f'Indexed {total} messages.'))
