# Generated migration to add unique constraint after populating slugs

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gamestore', '0004_populate_empty_slugs'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='slug',
            field=models.SlugField(blank=True, max_length=250, unique=True),
        ),
    ]
