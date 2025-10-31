import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../App';
import { getGameById, addToWishlist, addToCart, createReview, getGameReviews } from '../services/api';
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
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState('positive');
  const [hoursPlayed, setHoursPlayed] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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
      loadReviews();
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await getGameReviews(id);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!reviewText.trim()) {
      alert('Please write a review');
      return;
    }

    setSubmittingReview(true);
    try {
      await createReview({
        game: id,
        rating: reviewRating,
        review_text: reviewText,
        hours_played: parseFloat(hoursPlayed) || 0
      });

      setReviewText('');
      setHoursPlayed('');
      loadReviews();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. You may have already reviewed this game.');
    } finally {
      setSubmittingReview(false);
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
          <div className="nav-logo">
            <span className="logo-icon">⚙</span>
            <span className="logo-text">NOTSTEAM</span>
          </div>
          <nav className="main-links">
            <Link to="/">STORE</Link>
            <Link to="/library">LIBRARY</Link>
            <Link to="/profile">PROFILE</Link>
            <button onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }} className="logout-link">LOGOUT</button>
          </nav>
        </div>
      </div>

      <div className="game-page-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">All Games</Link> &gt; {game.title}
        </div>

        {/* Hero Section - Full Width Image */}
        <div className="game-hero-section">
          <div className="game-hero-image">
            <img src={game.image || '/placeholder-game.jpg'} alt={game.title} />
          </div>
        </div>

        {/* Info Section - Below Image */}
        <div className="game-hero-info">
          <h1 className="game-page-title">{game.title}</h1>

          <p className="game-short-desc">{game.short_description || game.description}</p>

          {/* Meta and Purchase Grid */}
          <div className="game-meta-section">
            <div className="game-meta-grid">
              <div className="meta-item">
                <div className="meta-label">All Reviews:</div>
                <div className="meta-value">0% Positive</div>
              </div>

              <div className="meta-item">
                <div className="meta-label">Release Date:</div>
                <div className="meta-value">{game.release_date || '2025-10-28'}</div>
              </div>

              <div className="meta-item">
                <div className="meta-label">Developer:</div>
                <div className="meta-value meta-link">{game.developer || 'Developer'}</div>
              </div>

              <div className="meta-item">
                <div className="meta-label">Publisher:</div>
                <div className="meta-value meta-link">{game.publisher || game.developer || 'Publisher'}</div>
              </div>

              <div className="meta-item">
                <div className="meta-label">Genre:</div>
                <div className="meta-value">
                  {game.genres && game.genres.length > 0
                    ? game.genres.map(g => g.name).join(', ')
                    : game.genre || 'N/A'}
                </div>
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
          </div>

          <div className="game-tags">
            {game.tags && game.tags.slice(0, 5).map(tag => (
              <span key={tag.id} className="tag">{tag.name}</span>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="game-content-section">
          <div className="game-description-box">
            <h2>About This Game</h2>
            <p>{game.description}</p>

            {/* Review Section */}
            <div className="review-section">
              <h3>Leave a Review</h3>
              {user ? (
                <form onSubmit={handleSubmitReview} className="review-form">
                  <div className="review-rating">
                    <label>
                      <input
                        type="radio"
                        name="rating"
                        value="positive"
                        checked={reviewRating === 'positive'}
                        onChange={(e) => setReviewRating(e.target.value)}
                      />
                      👍 Recommend
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="rating"
                        value="negative"
                        checked={reviewRating === 'negative'}
                        onChange={(e) => setReviewRating(e.target.value)}
                      />
                      👎 Not Recommend
                    </label>
                  </div>

                  <div className="review-hours">
                    <label>
                      Hours Played:
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={hoursPlayed}
                        onChange={(e) => setHoursPlayed(e.target.value)}
                        placeholder="0.0"
                        className="hours-input"
                      />
                    </label>
                  </div>

                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review here..."
                    className="review-textarea"
                    rows="5"
                    required
                  />

                  <button
                    type="submit"
                    className="submit-review-btn"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <p className="review-login-prompt">
                  <Link to="/login">Login</Link> to leave a review
                </p>
              )}

              {/* Display Reviews */}
              {reviews.length > 0 && (
                <div className="reviews-list">
                  <h3>User Reviews ({reviews.length})</h3>
                  {reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <span className="review-user">{review.user.username}</span>
                        <span className={`review-rating ${review.rating}`}>
                          {review.rating === 'positive' ? '👍 Recommended' : '👎 Not Recommended'}
                        </span>
                      </div>
                      <p className="review-text">{review.review_text}</p>
                      <div className="review-meta">
                        <span>{review.hours_played} hrs on record</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
