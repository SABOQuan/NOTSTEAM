# Generated migration to populate empty slugs before adding unique constraint

from django.db import migrations
from django.utils.text import slugify
import uuid


def populate_empty_slugs(apps, schema_editor):
    """Fill in empty slugs for existing games"""
    Game = apps.get_model('gamestore', 'Game')

    # Get all games with empty or null slugs
    games_without_slugs = Game.objects.filter(slug__in=['', None])

    for game in games_without_slugs:
        # Generate slug from title
        base_slug = slugify(game.title) if game.title else str(uuid.uuid4())[:8]
        slug = base_slug
        counter = 1

        # Ensure slug is unique
        while Game.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        game.slug = slug
        game.save()


def reverse_populate_empty_slugs(apps, schema_editor):
    """Reverse migration - no action needed"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('gamestore', '0003_genre_game_genres'),
    ]

    operations = [
        migrations.RunPython(populate_empty_slugs, reverse_populate_empty_slugs),
    ]
