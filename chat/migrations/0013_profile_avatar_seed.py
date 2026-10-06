from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('chat', '0012_searchdocument'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='avatar_seed',
            field=models.CharField(default='', max_length=80, blank=True),
        ),
    ]
