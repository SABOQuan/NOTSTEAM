from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from gamestore.models import (
    Game, Genre, UserProfile, GameLibrary, Wishlist,
    Review, Achievement, Order, OrderItem, Tag
)
from decimal import Decimal
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Populate database with test data for analytics and testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=10,
            help='Number of test users to create'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing test data before populating'
        )

    def handle(self, *args, **options):
        num_users = options['users']

        if options['clear']:
            self.stdout.write('Clearing existing test data...')
            User.objects.filter(username__startswith='testuser').delete()

        # Create Genres
        self.stdout.write('Creating genres...')
        genres_data = [
            ('Action', 'Fast-paced games with intense combat and action sequences'),
            ('Adventure', 'Story-driven games with exploration and puzzle-solving'),
            ('RPG', 'Role-playing games with character development and deep narratives'),
            ('Strategy', 'Games requiring tactical thinking and planning'),
            ('Shooter', 'First-person and third-person shooting games'),
            ('Sports', 'Sports simulation and competitive sports games'),
            ('Racing', 'Driving and racing simulation games'),
            ('Simulation', 'Realistic simulation of real-world activities'),
            ('Horror', 'Scary games with suspense and psychological elements'),
            ('Puzzle', 'Brain-teasing games with logic and problem-solving'),
            ('Platformer', 'Games featuring jumping and climbing mechanics'),
            ('MMO', 'Massively multiplayer online games'),
            ('Fighting', 'One-on-one combat games'),
            ('Battle Royale', 'Last-player-standing multiplayer games'),
        ]

        for name, description in genres_data:
            Genre.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )

        # Create Tags
        self.stdout.write('Creating tags...')
        tags_list = [
            'Multiplayer', 'Single-player', 'Co-op', 'PvP', 'PvE',
            'Open World', 'Story Rich', 'Indie', 'AAA', 'Retro',
            'Casual', 'Hardcore', 'Realistic', 'Fantasy', 'Sci-Fi',
            'Medieval', 'Post-Apocalyptic', 'Survival', 'Sandbox',
        ]

        for tag_name in tags_list:
            Tag.objects.get_or_create(name=tag_name)

        # Create Test Users
        self.stdout.write(f'Creating {num_users} test users...')
        test_users = []
        for i in range(1, num_users + 1):
            username = f'testuser{i}'
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@test.com',
                    'first_name': f'Test',
                    'last_name': f'User{i}'
                }
            )
            if created:
                user.set_password('testpass123')
                user.save()
                UserProfile.objects.create(
                    user=user,
                    level=random.randint(1, 50),
                    xp=random.randint(0, 10000),
                    status_message=f'Test user {i}'
                )
            test_users.append(user)

        # Get all games and genres
        games = list(Game.objects.all())
        genres = list(Genre.objects.all())
        tags = list(Tag.objects.all())

        if not games:
            self.stdout.write(self.style.WARNING('No games found. Please add games first.'))
            return

        # Assign genres to games
        self.stdout.write('Assigning genres to games...')
        for game in games:
            if not game.genres.exists():
                # Assign 1-3 random genres
                num_genres = random.randint(1, min(3, len(genres)))
                game.genres.set(random.sample(genres, num_genres))

        # Assign tags to games
        self.stdout.write('Assigning tags to games...')
        for game in games:
            num_tags = random.randint(3, 7)
            selected_tags = random.sample(tags, min(num_tags, len(tags)))
            for tag in selected_tags:
                tag.games.add(game)

        # Create test purchases and reviews
        self.stdout.write('Creating test purchases and reviews...')
        for user in test_users:
            # Each user buys 2-5 games
            num_purchases = random.randint(2, min(5, len(games)))
            purchased_games = random.sample(games, num_purchases)

            for game in purchased_games:
                # Create library entry
                library, created = GameLibrary.objects.get_or_create(
                    user=user,
                    game=game,
                    defaults={
                        'hours_played': Decimal(random.uniform(0.5, 200)),
                        'last_played': datetime.now() - timedelta(days=random.randint(0, 30))
                    }
                )

                # Create order
                order = Order.objects.create(
                    user=user,
                    total_amount=game.discounted_price,
                    status='completed',
                    payment_method='card',
                    stripe_payment_id=f'pi_test_{random.randint(100000, 999999)}',
                    completed_at=datetime.now() - timedelta(days=random.randint(1, 60))
                )

                OrderItem.objects.create(
                    order=order,
                    game=game,
                    price=game.price,
                    discount_applied=game.price - game.discounted_price
                )

                # 70% chance to leave a review
                if random.random() < 0.7:
                    rating = 'positive' if random.random() < 0.8 else 'negative'
                    review_texts = {
                        'positive': [
                            "Great game! Really enjoyed it.",
                            "Amazing graphics and gameplay!",
                            "Best game I've played in years!",
                            "Highly recommended to everyone!",
                            "Worth every penny. 10/10!",
                        ],
                        'negative': [
                            "Not what I expected. Disappointed.",
                            "Too many bugs and glitches.",
                            "Boring gameplay, repetitive.",
                            "Not worth the price.",
                            "Could be better. Needs improvements.",
                        ]
                    }

                    Review.objects.get_or_create(
                        user=user,
                        game=game,
                        defaults={
                            'rating': rating,
                            'review_text': random.choice(review_texts[rating]),
                            'hours_played': library.hours_played,
                            'helpful_count': random.randint(0, 50)
                        }
                    )

            # Add 1-3 games to wishlist
            remaining_games = [g for g in games if g not in purchased_games]
            if remaining_games:
                num_wishlist = random.randint(1, min(3, len(remaining_games)))
                for game in random.sample(remaining_games, num_wishlist):
                    Wishlist.objects.get_or_create(
                        user=user,
                        game=game
                    )

        self.stdout.write(self.style.SUCCESS(f'Successfully created test data!'))
        self.stdout.write(f'- {num_users} test users')
        self.stdout.write(f'- {len(genres)} genres')
        self.stdout.write(f'- {len(tags)} tags')
        self.stdout.write(f'Test users: testuser1 - testuser{num_users}')
        self.stdout.write('Password for all test users: testpass123')
