from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('chat', '0010_profile_verification_reviewed_at_and_more')]

    operations = [
        migrations.CreateModel(
            name='ConversationBookmark',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookmarks', to='chat.conversation')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversation_bookmarks', to='auth.user')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddConstraint(
            model_name='conversationbookmark',
            constraint=models.UniqueConstraint(fields=('user', 'conversation'), name='unique_conversation_bookmark'),
        ),
    ]
