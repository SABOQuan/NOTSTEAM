import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getFeaturedGames, getGames, getWishlist } from '../services/api';
import LazyImage from '../components/LazyImage';
import SEO from '../components/SEO';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { user, logout, cart } = useContext(AuthContext);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [gridGames, setGridGames] = useState([]);
  const [allGames, setAllGames] = useState([]); // Store original games
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [sortBy, setSortBy] = useState('default'); // default, price-asc, price-desc, name-asc, name-desc
  const itemsToShow = 3; // Show 3 games at a time

  useEffect(() => {
    loadGames();
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadGames = async () => {
    try {
      const [featured, all] = await Promise.all([
        getFeaturedGames(),
        getGames()
      ]);
      setFeaturedGames(featured);
      setAllGames(all);
      setGridGames(all.slice(0, 16));
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  // Sort games when sortBy changes
  useEffect(() => {
    if (allGames.length === 0) return;

    let sorted = [...allGames];

    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => parseFloat(a.discounted_price) - parseFloat(b.discounted_price));
        break;
      case 'price-desc':
        sorted.sort((a, b) => parseFloat(b.discounted_price) - parseFloat(a.discounted_price));
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // Keep original order
        break;
    }

    setGridGames(sorted.slice(0, 16));
  }, [sortBy, allGames]);

  const loadWishlist = async () => {
    try {
      const wishlist = await getWishlist();
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < featuredGames.length - itemsToShow) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleGameClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="home-page">
      <SEO
        title="NotSteam - Buy PC Games, Game Keys & Digital Downloads"
        description="Discover and buy thousands of PC games with instant delivery. Browse featured games, bestsellers, and special offers. Download games instantly to your library."
        keywords="pc games, digital games, game store, buy games online, steam alternative, game downloads, gaming store, video games, game deals, cheap games"
        url="https://notsteam.com/"
      />

      {/* Main Navbar */}
      <div className="main-navbar">
        <div className="nav-left">
          <div className="nav-logo">
            <span className="logo-icon">⚙</span>
            <span className="logo-text">NOTSTEAM</span>
          </div>
          <nav className="main-links">
            <Link to="/">STORE</Link>
            {user && <Link to="/library">LIBRARY</Link>}
            {user ? (
              <>
                <Link to="/profile">PROFILE</Link>
                <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>LOGOUT</a>
              </>
            ) : (
              <>
                <Link to="/login">LOGIN</Link>
                <Link to="/register">REGISTER</Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Sub Navbar - Simplified */}
      <div className="sub-navbar">
        <div className="sub-left">
          <span className="browse-text">Browse All Games</span>
        </div>
        <div className="search-wrapper">
          <input type="text" placeholder="Search games..." className="store-search" />
          {user && (
            <>
              <Link to="/wishlist" className="wishlist-btn">
                Wishlist ({wishlistCount})
              </Link>
              <Link to="/checkout" className="wishlist-btn">
                Cart ({cart.length})
              </Link>
            </>
          )}
        </div>
      </div>

     {/* Banner */}
<div className="banner">
  <img src="https://res.cloudinary.com/dfnnxpc5n/image/upload/v1761884872/sswd_wuwa3a.png" alt="Banner" />
</div>

      {/* SEO H1 - Visually hidden but accessible for search engines */}
      <h1 style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
        NotSteam - Buy PC Games and Digital Downloads
      </h1>

      {/* Game Grid */}
      <div className="game-grid-section">
        <div className="section-header">
          <h2 className="section-title">All Games</h2>
          <div className="filter-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
        <div className="game-grid">
          {gridGames.map((game) => (
            <div
              key={game.id}
              className="grid-item"
              onClick={() => handleGameClick(game.id)}
            >
              <div className="grid-image-wrapper">
                <LazyImage
                  src={game.image || '/placeholder-game.jpg'}
                  alt={game.title}
                  preset="CARD"
                  style={{ width: '100%', height: '180px' }}
                />
                {game.discount_percentage > 0 && (
                  <div className="grid-discount-badge">-{game.discount_percentage}%</div>
                )}
              </div>
              <div className="grid-item-info">
                <div className="grid-item-title">{game.title}</div>
                <div className="grid-price-box">
                  <div className="grid-prices">
                    {game.discount_percentage > 0 && (
                      <span className="grid-price-old">${game.price}</span>
                    )}
                    <span className="grid-price-new">${game.discounted_price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-bottom">
          <div className="footer-logo">
            <span className="logo-text">NotSteam</span>
            <p>© 2025 NotSteam. All rights reserved.</p>
            <p>Developed by NotHuman</p>
            <p>All game images and names are trademarks of their respective owners.</p>
          </div>

          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Support</a>
            <a href="#">Developers</a>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;