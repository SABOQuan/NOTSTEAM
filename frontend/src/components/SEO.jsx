import React from 'react';
import { Helmet } from 'react-helmet-async';

function SEO({
  title = 'NotSteam - Buy PC Games, Game Keys & Digital Downloads',
  description = 'Discover and buy thousands of PC games with instant delivery. Browse featured games, bestsellers, and special offers. Download games instantly to your library.',
  keywords = 'pc games, digital games, game store, buy games online, steam alternative, game downloads, gaming store, video games, game deals, cheap games',
  ogImage = '/og-image.jpg',
  url = 'https://notsteam.com/',
  type = 'website'
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Canonical */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}

export default SEO;
