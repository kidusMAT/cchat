import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cchat_backend.settings')
django.setup()

from django.contrib.auth.models import User
from apps.accounts.models import UserProfile
from apps.conversations.models import Conversation, Message
from apps.publications.models import Topic, PublicExcerpt, MessageReaction, SavedExcerpt
from apps.sponsorship.models import SponsorPlacement, SponsorMenuItem, SponsorTrack

def seed():
    print("Seeding database...")

    # 1. Users
    users_data = [
        {'username': 'maya', 'handle': '@mayamaybe', 'display_name': 'Maya Chen', 'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', 'bio': 'A little less posting. A lot more plot.'},
        {'username': 'jules', 'handle': '@julespark', 'display_name': 'Jules Park', 'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', 'bio': 'Roommate lore and coffee'},
        {'username': 'nina', 'handle': '@ninapatel', 'display_name': 'Nina Patel', 'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', 'bio': 'One drink, allegedly'},
        {'username': 'leo', 'handle': '@leomartinez', 'display_name': 'Leo Martinez', 'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', 'bio': 'Slide deck survivor'},
        {'username': 'anon', 'handle': '@anonymous', 'display_name': 'Anonymous', 'avatar': '', 'bio': 'Mystery participant'},
    ]

    profiles = {}
    for ud in users_data:
        user, _ = User.objects.get_or_create(username=ud['username'], defaults={'email': f"{ud['username']}@example.com"})
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'handle': ud['handle'],
                'display_name': ud['display_name'],
                'avatar_url': ud['avatar'],
                'bio': ud['bio']
            }
        )
        profiles[ud['username']] = profile

    maya = profiles['maya']
    maya.following.add(profiles['jules'], profiles['nina'], profiles['leo'])

    # 2. Topics
    topics_data = [
        {'tag': '#roommatelore', 'name': 'The fridge is a sovereign state', 'chats': 1400},
        {'tag': '#dating', 'name': 'First dates, second thoughts', 'chats': 2800},
        {'tag': '#theplotthickens', 'name': 'One drink, allegedly', 'chats': 3100},
        {'tag': '#workbesties', 'name': 'This could have been an email', 'chats': 986},
    ]

    topics = {}
    for td in topics_data:
        t, _ = Topic.objects.get_or_create(tag=td['tag'], defaults={'name': td['name'], 'chats_count': td['chats']})
        topics[td['tag']] = t

    # 3. Conversations & Messages
    # Conversation 1: The apartment
    c_apt, _ = Conversation.objects.get_or_create(
        title='The apartment',
        defaults={'initials': 'JP', 'tag': '2 UNREAD'}
    )
    c_apt.participants.set([maya, profiles['jules']])

    apt_msgs = [
        (profiles['jules'], 'who adopted a raccoon', True),
        (maya, 'nobody adopted him. he chose us.', True),
        (profiles['jules'], 'the rent is due. the raccoon is not on the lease.', True),
        (maya, 'he has a tiny hand. he can sign.', True),
        (profiles['jules'], 'he is washing a grape in my coffee mug', True),
        (maya, "more dishes than you've done all week.", True),
        (maya, 'he is now asleep on the chore chart. symbolic.', False),
    ]
    created_apt_msgs = []
    for sender, text, eligible in apt_msgs:
        m, _ = Message.objects.get_or_create(conversation=c_apt, sender=sender, text=text, defaults={'is_excerpt_eligible': eligible})
        created_apt_msgs.append(m)

    # Excerpt for apartment
    exc_apt, _ = PublicExcerpt.objects.get_or_create(
        conversation=c_apt,
        defaults={
            'title': 'the rent is due. the raccoon is not on the lease.',
            'topic': topics['#roommatelore'],
            'reads_count': 6200,
        }
    )
    exc_apt.publishers.set([maya])
    exc_apt.messages.set(created_apt_msgs[:6])

    # Conversation 2: Friday plans
    c_fri, _ = Conversation.objects.get_or_create(
        title='Friday plans',
        defaults={'initials': 'NP', 'tag': 'PRIVATE'}
    )
    c_fri.participants.set([maya, profiles['nina']])

    fri_msgs = [
        (profiles['nina'], 'we said one drink', True),
        (maya, 'this is still the same evening', True),
        (profiles['nina'], 'it is saturday', True),
        (maya, 'a technicality', True),
        (profiles['nina'], 'why is there a karaoke receipt', True),
        (maya, 'because we invested in the arts.', True),
    ]
    for sender, text, eligible in fri_msgs:
        Message.objects.get_or_create(conversation=c_fri, sender=sender, text=text, defaults={'is_excerpt_eligible': eligible})

    # Conversation 3: Work bestie
    c_work, _ = Conversation.objects.get_or_create(
        title='Work bestie',
        defaults={'initials': 'LM', 'tag': 'PUBLISHED'}
    )
    c_work.participants.set([maya, profiles['leo']])

    work_msgs = [
        (profiles['leo'], 'the deck has 94 slides', True),
        (maya, 'is the presentation a hostage situation', True),
        (profiles['leo'], 'slide 62 just says "to be continued"', True),
        (maya, 'we are in the extended universe of Q3', True),
        (profiles['leo'], 'the appendix has an appendix', True),
        (maya, 'this meeting could be a chat. this chat could be a nap.', True),
        (maya, 'i’m logging off. the slides can raise themselves.', False),
    ]
    created_work_msgs = []
    for sender, text, eligible in work_msgs:
        m, _ = Message.objects.get_or_create(conversation=c_work, sender=sender, text=text, defaults={'is_excerpt_eligible': eligible})
        created_work_msgs.append(m)

    # Excerpt for work bestie
    exc_work, _ = PublicExcerpt.objects.get_or_create(
        conversation=c_work,
        defaults={
            'title': 'the deck has 94 slides.',
            'topic': topics['#workbesties'],
            'reads_count': 9100,
        }
    )
    exc_work.publishers.set([maya])
    exc_work.messages.set(created_work_msgs[:6])

    # Conversation 4: The interview
    c_int, _ = Conversation.objects.get_or_create(
        title='The interview',
        defaults={'initials': 'AN', 'tag': 'PRIVATE'}
    )
    c_int.participants.set([maya, profiles['anon']])

    int_msgs = [
        (profiles['anon'], 'i brought a résumé to the date.', True),
        (maya, 'please tell me this is a metaphor', True),
        (profiles['anon'], 'two pages. references available on request.', True),
        (maya, 'did you at least get the position?', True),
        (profiles['anon'], 'second interview on friday. benefits include pasta.', True),
        (maya, 'honestly? hired.', True),
    ]
    created_int_msgs = []
    for sender, text, eligible in int_msgs:
        m, _ = Message.objects.get_or_create(conversation=c_int, sender=sender, text=text, defaults={'is_excerpt_eligible': eligible})
        created_int_msgs.append(m)

    exc_int, _ = PublicExcerpt.objects.get_or_create(
        conversation=c_int,
        defaults={
            'title': 'he brought a résumé to a first date.',
            'topic': topics['#dating'],
            'reads_count': 18400,
        }
    )
    exc_int.publishers.set([maya])
    exc_int.messages.set(created_int_msgs[:6])

    # 4. Message Reactions
    # React on some messages
    reaction_types = ['heart', 'cap', 'skull', 'fire']
    for idx, msg in enumerate(created_apt_msgs[:6]):
        rt = reaction_types[idx % 4]
        MessageReaction.objects.get_or_create(message=msg, user=maya, reaction_type=rt)

    # 5. Sponsorship (After Hours)
    sponsor, _ = SponsorPlacement.objects.get_or_create(
        brand_name='After Hours',
        defaults={
            'headline': 'Fuel your next conversation.',
            'tagline': "Late-night coffee, fresh playlists, better conversations. For the stories that aren't ready to call it a night.",
            'image_url': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
            'is_active': True,
        }
    )

    menu_items_data = [
        {'name': 'Nightcap espresso', 'desc': 'Short, bold, no unnecessary small talk.', 'order': 1},
        {'name': 'Midnight oat latte', 'desc': 'Soft edges. Extra room for a good story.', 'order': 2},
        {'name': 'Decaf after dark', 'desc': 'Keep the ritual. Skip the late-night buzz.', 'order': 3},
    ]
    for mi in menu_items_data:
        SponsorMenuItem.objects.get_or_create(sponsor=sponsor, name=mi['name'], defaults={'description': mi['desc'], 'order': mi['order']})

    track_items_data = [
        {'title': 'Window seat', 'desc': 'Soft keys · 03:12', 'order': 1},
        {'title': 'Last train home', 'desc': 'Downtempo · 04:06', 'order': 2},
        {'title': 'One more story', 'desc': 'Warm instrumental · 02:48', 'order': 3},
        {'title': 'Lights still on', 'desc': 'Lo-fi rhythm · 03:35', 'order': 4},
    ]
    for trk in track_items_data:
        SponsorTrack.objects.get_or_create(sponsor=sponsor, title=trk['title'], defaults={'description': trk['desc'], 'order': trk['order']})

    print("Seeding complete! Successfully created users, topics, conversations, excerpts, and sponsor data.")

if __name__ == '__main__':
    seed()
