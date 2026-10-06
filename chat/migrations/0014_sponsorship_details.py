from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('chat', '0013_profile_avatar_seed')]

    operations = [
        migrations.AddField(
            model_name='sponsorshiprequest',
            name='sponsor_description',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='sponsorshiprequest',
            name='sponsor_logo',
            field=models.FileField(blank=True, null=True, upload_to='sponsor_logos/'),
        ),
        migrations.AddField(
            model_name='sponsorshiprequest',
            name='attached_message',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sponsorship_attachments', to='chat.message'),
        ),
    ]
