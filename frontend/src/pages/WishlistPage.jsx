import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getWishlist, removeFromWishlist, addToCart } from '../services/api';
import './WishlistPage.css';

function WishlistPage() {
  const navigate = useNavigate();
  const { user, setCart } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, [user, navigate]);

  const loadWishlist = async () => {
    try {
      const items = await getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (gameId) => {
    try {
      await removeFromWishlist(gameId);
      setWishlistItems(wishlistItems.filter(game => game.id !== gameId));
      alert('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (game) => {
    try {
      await addToCart(game.id);
      setCart(prevCart => [...prevCart, game]);
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const handleGameClick = (game) => {
    const identifier = game.slug || game.id;
    navigate(`/game/${identifier}`);
  };

  if (loading) {
    return <div className="loading">Loading wishlist...</div>;
  }

  return (
    <div className="wishlist-page">
      {/* Navbar */}
      <div className="main-navbar">
        <div className="nav-left">
          <div className="nav-logo">NotSteam</div>
          <nav className="main-links">
            <Link to="/">STORE</Link>
            <Link to="/profile">PROFILE</Link>
            <Link to="/wishlist" className="active">WISHLIST</Link>
          </nav>
        </div>
      </div>

      <div className="wishlist-container">
        <h1 className="wishlist-title">My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <h2>Your wishlist is empty</h2>
            <p>Add games to your wishlist to keep track of what you want!</p>
            <Link to="/" className="continue-shopping-btn">Browse Games</Link>
          </div>
        ) : (
          <div className="wishlist-items">
            <p className="wishlist-count">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist</p>

            <div className="wishlist-grid">
              {wishlistItems.map((game) => (
                <div key={game.id} className="wishlist-item">
                  <div className="wishlist-item-image" onClick={() => handleGameClick(game)}>
                    <img
                      src={game.image || '/placeholder-game.jpg'}
                      alt={game.title}
                    />
                    {game.discount_percentage > 0 && (
                      <div className="wishlist-discount-badge">-{game.discount_percentage}%</div>
                    )}
                  </div>

                  <div className="wishlist-item-content">
                    <h3 className="wishlist-item-title" onClick={() => handleGameClick(game)}>
                      {game.title}
                    </h3>
                    <p className="wishlist-item-desc">{game.short_description}</p>

                    <div className="wishlist-item-footer">
                      <div className="wishlist-item-price">
                        {game.discount_percentage > 0 && (
                          <span className="wishlist-price-old">${game.price}</span>
                        )}
                        <span className="wishlist-price-new">${game.discounted_price}</span>
                      </div>

                      <div className="wishlist-item-actions">
                        <button
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(game)}
                        >
                          Add to Cart
                        </button>
                        <button
                          className="remove-from-wishlist-btn"
                          onClick={() => handleRemoveFromWishlist(game.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;
