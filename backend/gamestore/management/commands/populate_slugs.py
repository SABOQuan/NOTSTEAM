from django.core.management.base import BaseCommand
from django.utils.text import slugify
from gamestore.models import Game


class Command(BaseCommand):
    help = 'Populate slug fields for all games that are missing them'

    def handle(self, *args, **options):
        self.stdout.write('Starting slug population...\n')
        
        games = Game.objects.all()
        updated_count = 0
        
        for game in games:
            if not game.slug or game.slug == 'None':
                # Generate base slug from title
                base_slug = slugify(game.title)
                slug = base_slug
                counter = 1
                
                # Handle duplicates by adding counter
                while Game.objects.filter(slug=slug).exclude(id=game.id).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                # Save the slug
                game.slug = slug
                game.save()
                updated_count += 1
                
                self.stdout.write(
                    self.style.SUCCESS(f'✓ {game.title} → {slug}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Done! Updated {updated_count} games')
        )