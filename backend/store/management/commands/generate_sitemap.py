from django.core.management.base import BaseCommand
from django.utils import timezone
from store.models import Game
import os


class Command(BaseCommand):
    help = 'Generate sitemap.xml for SEO'

    def handle(self, *args, **kwargs):
        # Get all games
        games = Game.objects.all()

        # Start sitemap XML
        sitemap = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Homepage -->
  <url>
    <loc>https://notsteam.com/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Library -->
  <url>
    <loc>https://notsteam.com/library</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Profile -->
  <url>
    <loc>https://notsteam.com/profile</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Wishlist -->
  <url>
    <loc>https://notsteam.com/wishlist</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

'''.format(today=timezone.now().strftime('%Y-%m-%d'))

        # Add all game pages
        for game in games:
            sitemap += f'''  <!-- {game.title} -->
  <url>
    <loc>https://notsteam.com/game/{game.id}</loc>
    <lastmod>{timezone.now().strftime('%Y-%m-%d')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

'''

        sitemap += '</urlset>'

        # Write to file
        output_path = os.path.join('frontend', 'public', 'sitemap.xml')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(sitemap)

        self.stdout.write(self.style.SUCCESS(f'Successfully generated sitemap with {games.count()} games'))
