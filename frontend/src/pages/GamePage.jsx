import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../App';
import { getGameById, addToWishlist, addToCart } from '../services/api';
import SEO from '../components/SEO';
import './GamePage.css';

function GamePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, cart, setCart } = useContext(AuthContext);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    loadGame();
  }, [id]);

  useEffect(() => {
    if (game && cart) {
      setInCart(cart.some(g => g.id === game.id));
    }
  }, [game, cart]);

  const loadGame = async () => {
    try {
      const data = await getGameById(id);
      setGame(data);
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(game.id);
      setCart([...cart, game]);
      setInCart(true);
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToWishlist(game.id);
      setInWishlist(true);
      alert('Added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return <div className="loading">Loading game...</div>;
  }

  if (!game) {
    return <div className="error">Game not found</div>;
  }

  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (!game) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": game.title,
      "description": game.description,
      "image": game.image,
      "brand": {
        "@type": "Brand",
        "name": game.developer
      },
      "offers": {
        "@type": "Offer",
        "price": game.discounted_price,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": `https://notsteam.com/game/${game.id}`
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": "100"
      }
    };
  };

  return (
    <div className="game-page">
      {game && (
        <>
          <SEO
            title={`${game.title} - Buy & Download | NotSteam`}
            description={game.description || `Buy ${game.title} for PC. ${game.title} developed by ${game.developer}. Instant digital download.`}
            keywords={`${game.title}, ${game.developer}, ${game.genre || 'pc game'}, buy ${game.title}, download ${game.title}`}
            url={`https://notsteam.com/game/${game.id}`}
            ogImage={game.image}
            type="product"
          />
          <Helmet>
            <script type="application/ld+json">
              {JSON.stringify(generateStructuredData())}
            </script>
          </Helmet>
        </>
      )}

      {/* Navbar */}
      <div className="main-navbar">
        <div className="nav-left">
          <div className="nav-logo">NotSteam</div>
          <nav className="main-links">
            <Link to="/">STORE</Link>
            <a href="#">COMMUNITY</a>
            {user && <Link to="/profile">PROFILE</Link>}
          </nav>
        </div>
      </div>

      <div className="game-page-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">All Games</Link> &gt; {game.title}
        </div>

        {/* Hero Section */}
        <div className="game-hero-section">
          <div className="game-hero-image">
            <img src={game.image || '/placeholder-game.jpg'} alt={game.title} />
          </div>
          
          <div className="game-hero-info">
            <div className="game-category-badges">
              <span>ALL GAMES</span>
              <span>&gt;</span>
              <span>RPG GAMES</span>
              <span>&gt;</span>
              <span>{game.title.toUpperCase()}</span>
            </div>

            <h1 className="game-page-title">{game.title}</h1>

            <p className="game-short-desc">{game.short_description || game.description}</p>

            <div className="game-meta-grid">
              <div className="meta-item">
                <span className="meta-label">ALL REVIEWS:</span>
                <span className="meta-value">{game.positive_reviews}% POSITIVE</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">RELEASE DATE:</span>
                <span className="meta-value">{game.release_date}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">DEVELOPER:</span>
                <span className="meta-value meta-link">{game.developer}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">PUBLISHER:</span>
                <span className="meta-value meta-link">{game.publisher}</span>
              </div>
            </div>

            <div className="game-purchase-section">
              <div className="purchase-price">
                {game.discount_percentage > 0 && (
                  <span className="purchase-discount">-{game.discount_percentage}%</span>
                )}
                <span className="purchase-new">${game.discounted_price}</span>
                {game.discount_percentage > 0 && (
                  <span className="purchase-old">${game.price}</span>
                )}
              </div>
              <button 
                className="buy-now-btn"
                onClick={inCart ? handleCheckout : handleAddToCart}
              >
                {inCart ? 'Checkout' : 'Buy Now'}
              </button>
            </div>

            <div className="game-tags">
              {game.tags && game.tags.slice(0, 5).map(tag => (
                <span key={tag.id} className="tag">{tag.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="game-content-section">
          <div className="game-description-box">
            <h2>About This Game</h2>
            <p>{game.description}</p>
          </div>

          <div className="game-sidebar">
            <div className="sidebar-box">
              <h3>Features</h3>
              <div className="game-features">
                <div className="feature-item">
                  Single-player
                </div>
                <div className="feature-item">
                  Online Co-op
                </div>
                <div className="feature-item">
                  Cloud Saves
                </div>
              </div>
            </div>

            <div className="sidebar-box">
              <h3>Actions</h3>
              <div className="game-actions">
                <button 
                  className="action-btn"
                  onClick={inCart ? handleCheckout : handleAddToCart}
                >
                  {inCart ? 'Go to Checkout' : 'Add to Cart'}
                </button>
                <button 
                  className="action-btn"
                  onClick={handleAddToWishlist}
                  disabled={inWishlist}
                >
                  {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
                <button className="action-btn">Follow</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;