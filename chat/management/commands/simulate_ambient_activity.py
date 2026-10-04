"""Run separately from the web server as a long-lived ambient activity process."""

import random
import time

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.cache import cache
from django.core.management.base import BaseCommand

from chat.ambient import AMBIENT_GROUP, AMBIENT_REACTION_EMOJIS


class Command(BaseCommand):
    help = 'Broadcast low-volume synthetic ambient reaction activity.'

    def handle(self, *args, **options):
        if not settings.AMBIENT_SIMULATION_ENABLED:
            self.stdout.write('Ambient simulation disabled by AMBIENT_SIMULATION_ENABLED.')
            return

        channel_layer = get_channel_layer()
        emojis = tuple(AMBIENT_REACTION_EMOJIS.values())
        self.stdout.write('Ambient simulation running.')
        try:
            while True:
                time.sleep(random.uniform(4, 12))
                last_real_event = cache.get('ambient:last_real_event_at')
                if last_real_event and time.time() - last_real_event < 30:
                    continue
                async_to_sync(channel_layer.group_send)(
                    AMBIENT_GROUP,
                    {'type': 'ambient.event', 'emoji': random.choice(emojis)},
                )
        except KeyboardInterrupt:
            self.stdout.write('Ambient simulation stopped.')
