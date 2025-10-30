import os
import django
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from gamestore.models import Game

# Sample games
games_data = [
    {
        'title': 'Dark Souls III',
        'description': 'An action RPG with challenging combat and dark fantasy setting.',
        'price': '59.99',
        'discounted_price': '45.47',
        'discount_percentage': 15,
        'developer': 'FromSoftware',
        'publisher': 'Bandai Namco',
        'release_date': '2016-04-12',
        'genre': 'Action RPG',
        'is_featured': True,
    },
    {
        'title': 'Minecraft',
        'description': 'A sandbox game where you can build anything you imagine.',
        'price': '36.30',
        'discounted_price': '35.21',
        'discount_percentage': 3,
        'developer': 'Mojang',
        'publisher': 'Mojang',
        'release_date': '2011-11-18',
        'genre': 'Sandbox',
        'is_featured': True,
    },
    {
        'title': 'Fortnite',
        'description': 'Battle Royale game with building mechanics.',
        'price': '12.50',
        'discounted_price': '12.12',
        'discount_percentage': 3,
        'developer': 'Epic Games',
        'publisher': 'Epic Games',
        'release_date': '2017-07-25',
        'genre': 'Battle Royale',
        'is_featured': True,
    },
    {
        'title': 'Elden Ring',
        'description': 'An open-world action RPG from the creators of Dark Souls.',
        'price': '59.99',
        'discounted_price': '59.99',
        'discount_percentage': 0,
        'developer': 'FromSoftware',
        'publisher': 'Bandai Namco',
        'release_date': '2022-02-25',
        'genre': 'Action RPG',
        'is_featured': False,
    },
    {
        'title': 'Cyberpunk 2077',
        'description': 'Open-world RPG set in Night City.',
        'price': '59.99',
        'discounted_price': '29.99',
        'discount_percentage': 50,
        'developer': 'CD Projekt Red',
        'publisher': 'CD Projekt',
        'release_date': '2020-12-10',
        'genre': 'RPG',
        'is_featured': False,
    },
]

print("Adding sample games...")

for game_data in games_data:
    game, created = Game.objects.get_or_create(
        title=game_data['title'],
        defaults=game_data
    )
    if created:
        print(f"✓ Added: {game.title}")
    else:
        print(f"- Already exists: {game.title}")

print(f"\nDone! Total games in database: {Game.objects.count()}")
