"""
Management command to migrate existing local images to Cloudinary

Usage: python manage.py migrate_images_to_cloudinary
"""

from django.core.management.base import BaseCommand
from django.core.files import File
from gamestore.models import Game, UserProfile, Achievement
import cloudinary.uploader
import os


class Command(BaseCommand):
    help = 'Migrate existing local images to Cloudinary'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting image migration to Cloudinary...'))

        # Migrate Game images
        self.migrate_game_images()

        # Migrate UserProfile pictures
        self.migrate_profile_pictures()

        # Migrate Achievement icons
        self.migrate_achievement_icons()

        self.stdout.write(self.style.SUCCESS('✅ Migration completed!'))

    def migrate_game_images(self):
        """Migrate game cover images"""
        self.stdout.write('\n📦 Migrating game images...')
        games = Game.objects.all()
        migrated = 0
        skipped = 0

        for game in games:
            if game.image and hasattr(game.image, 'path'):
                try:
                    # Check if file exists locally
                    if os.path.exists(game.image.path):
                        # Upload to Cloudinary
                        result = cloudinary.uploader.upload(
                            game.image.path,
                            folder='games',
                            public_id=f'game_{game.id}_{game.title[:30]}',
                            overwrite=True,
                            resource_type='image'
                        )

                        # Update image field with Cloudinary URL
                        game.image = result['secure_url']
                        game.save()

                        migrated += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✓ {game.title}: {result["secure_url"]}')
                        )
                    else:
                        skipped += 1
                        self.stdout.write(
                            self.style.WARNING(f'  ⚠ {game.title}: File not found locally')
                        )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ {game.title}: {str(e)}')
                    )
            else:
                skipped += 1

        self.stdout.write(
            self.style.SUCCESS(f'\nGame images: {migrated} migrated, {skipped} skipped')
        )

    def migrate_profile_pictures(self):
        """Migrate user profile pictures"""
        self.stdout.write('\n👤 Migrating profile pictures...')
        profiles = UserProfile.objects.exclude(profile_picture='')
        migrated = 0
        skipped = 0

        for profile in profiles:
            if profile.profile_picture and hasattr(profile.profile_picture, 'path'):
                try:
                    if os.path.exists(profile.profile_picture.path):
                        result = cloudinary.uploader.upload(
                            profile.profile_picture.path,
                            folder='profiles',
                            public_id=f'user_{profile.user.id}_{profile.user.username}',
                            overwrite=True,
                            resource_type='image'
                        )

                        profile.profile_picture = result['secure_url']
                        profile.save()

                        migrated += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✓ {profile.user.username}: {result["secure_url"]}')
                        )
                    else:
                        skipped += 1
                        self.stdout.write(
                            self.style.WARNING(f'  ⚠ {profile.user.username}: File not found')
                        )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ {profile.user.username}: {str(e)}')
                    )
            else:
                skipped += 1

        self.stdout.write(
            self.style.SUCCESS(f'\nProfile pictures: {migrated} migrated, {skipped} skipped')
        )

    def migrate_achievement_icons(self):
        """Migrate achievement icons"""
        self.stdout.write('\n🏆 Migrating achievement icons...')
        achievements = Achievement.objects.exclude(icon='')
        migrated = 0
        skipped = 0

        for achievement in achievements:
            if achievement.icon and hasattr(achievement.icon, 'path'):
                try:
                    if os.path.exists(achievement.icon.path):
                        result = cloudinary.uploader.upload(
                            achievement.icon.path,
                            folder='achievements',
                            public_id=f'achievement_{achievement.id}_{achievement.name[:30]}',
                            overwrite=True,
                            resource_type='image'
                        )

                        achievement.icon = result['secure_url']
                        achievement.save()

                        migrated += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✓ {achievement.name}: {result["secure_url"]}')
                        )
                    else:
                        skipped += 1
                        self.stdout.write(
                            self.style.WARNING(f'  ⚠ {achievement.name}: File not found')
                        )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ {achievement.name}: {str(e)}')
                    )
            else:
                skipped += 1

        self.stdout.write(
            self.style.SUCCESS(f'\nAchievement icons: {migrated} migrated, {skipped} skipped')
        )
