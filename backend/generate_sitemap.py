import os
import django
import sys
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from gamestore.models import Game

# Get all games
games = Game.objects.all()

# Start sitemap XML
sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Homepage -->
  <url>
    <loc>https://notsteam.com/</loc>
    <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Library -->
  <url>
    <loc>https://notsteam.com/library</loc>
    <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Profile -->
  <url>
    <loc>https://notsteam.com/profile</loc>
    <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Wishlist -->
  <url>
    <loc>https://notsteam.com/wishlist</loc>
    <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

'''

# Add all game pages
for game in games:
    sitemap += f'''  <!-- {game.title} -->
  <url>
    <loc>https://notsteam.com/game/{game.id}</loc>
    <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

'''

sitemap += '</urlset>'

# Write to file
output_path = os.path.join('..', 'frontend', 'public', 'sitemap.xml')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(sitemap)

print(f'Successfully generated sitemap with {games.count()} games')
