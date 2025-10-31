import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getLibrary } from '../services/api';
import './LibraryPage.css';

function LibraryPage() {
  const navigate = useNavigate();
  const { user, logout, cart } = useContext(AuthContext);
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadLibrary();
  }, [user, navigate]);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const data = await getLibrary();
      console.log('Library data:', data); // Debug log
      setLibrary(data);
      if (data.length > 0) {
        setSelectedGame(data[0]);
      }
    } catch (error) {
      console.error('Error loading library:', error);
      alert('Error loading library: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = (libraryItem) => {
    setSelectedGame(libraryItem);
    setViewMode('detail');
  };

  const handlePlayGame = (game) => {
    const identifier = game.slug || game.id;
    navigate(`/game/${identifier}`);
  };

  // Group games by month
  const groupGamesByMonth = () => {
    const grouped = {};
    library.forEach((item) => {
      const date = new Date(item.purchase_date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(item);
    });
    return grouped;
  };

  const groupedGames = groupGamesByMonth();

  if (loading) {
    return <div className="loading" style={{textAlign: 'center', padding: '50px', color: '#fff'}}>Loading library...</div>;
  }

  return (
    <div className="library-page">
      {/* Top Navigation Bar */}
      <nav className="steam-navbar">
        <div className="steam-nav-content">
          <div className="steam-nav-left">
            <div className="steam-logo" onClick={() => navigate('/')}>
              <span className="logo-icon">⚙</span>
              <span className="logo-text">NOTSTEAM</span>
            </div>
            <div className="steam-nav-links">
              <Link to="/" className="nav-link">STORE</Link>
              <Link to="/library" className="nav-link active">LIBRARY</Link>
              <Link to="/profile" className="nav-link">PROFILE</Link>
              <button onClick={logout} className="nav-link logout-link">LOGOUT</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="library-container">
        {/* Left Sidebar */}
        <aside className="steam-sidebar">
          <div className="sidebar-section">
            <button className="sidebar-btn active">Home</button>
          </div>

          <div className="sidebar-section">
            <div className="section-header">
              <span className="section-title">RECENT</span>
              <span className="game-count">({library.slice(0, 6).length})</span>
            </div>
            <div className="recent-games-list">
              {library.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  className={`recent-game-item ${selectedGame?.id === item.id ? 'selected' : ''}`}
                  onClick={() => handleGameClick(item)}
                >
                  {item.game.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Game Display Area */}
        <main className="steam-main-content">
          {viewMode === 'grid' && (
            <div className="games-grid-view">
              <div className="view-header">
                <div className="view-left">
                  <span className="home-text">Home</span>
                  <select className="filter-select">
                    <option>All</option>
                    <option>Recent</option>
                    <option>Installed</option>
                  </select>
                  <button
                    onClick={loadLibrary}
                    className="refresh-btn"
                    style={{marginLeft: '15px', padding: '8px 16px', background: '#5eb3a6', border: 'none', borderRadius: '4px', color: '#0d1f2d', fontWeight: 'bold', cursor: 'pointer'}}
                  >
                    ↻ Refresh
                  </button>
                </div>
              </div>

              <div className="games-section">
                <div className="section-header-main">
                  <span className="section-title-main">RECENT</span>
                  <span className="game-count-main">({library.length})</span>
                </div>
                <div className="games-list-main">
                  {library.map((item) => (
                    <div
                      key={item.id}
                      className="game-card-main"
                      onClick={() => handleGameClick(item)}
                    >
                      <img
                        src={item.game.image || '/placeholder-game.jpg'}
                        alt={item.game.title}
                        className="game-card-image"
                      />
                      <div className="game-card-title">{item.game.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {library.length === 0 && (
                <div className="empty-library">
                  <p>Your library is empty</p>
                  <Link to="/" className="browse-btn">Browse Store</Link>
                </div>
              )}
            </div>
          )}

          {viewMode === 'detail' && selectedGame && (
            <div className="game-detail-view">
              {/* Game Hero */}
              <div className="game-hero-section">
                <img
                  src={selectedGame.game.image || '/placeholder-game.jpg'}
                  alt={selectedGame.game.title}
                  className="hero-background"
                />
                <div className="hero-content">
                  <h1 className="game-title">{selectedGame.game.title}</h1>
                  <button className="play-btn" onClick={() => handlePlayGame(selectedGame.game)}>
                    <span className="play-icon">▶</span> PLAY
                  </button>
                </div>
              </div>

              {/* Game Stats Bar */}
              <div className="game-stats-bar">
                <div className="stat-item">
                  <div className="stat-info">
                    <span className="stat-label">CLOUD STATUS</span>
                    <span className="stat-value">Up to date</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-info">
                    <span className="stat-label">LAST PLAYED</span>
                    <span className="stat-value">
                      {selectedGame.last_played
                        ? new Date(selectedGame.last_played).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-info">
                    <span className="stat-label">PLAY TIME</span>
                    <span className="stat-value">{selectedGame.hours_played || 0} hours</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-info">
                    <span className="stat-label">ACHIEVEMENTS</span>
                    <span className="stat-value">0/0</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="game-tabs">
                <button className="tab-btn active">Store Page</button>
                <button className="tab-btn">Community Hub</button>
                <button className="tab-btn">Discussions</button>
                <button className="tab-btn">Support</button>
              </div>

              {/* Game Details */}
              <div className="game-details-section">
                <div className="details-main">
                  <div className="play-info-box">
                    <p>You've played for {selectedGame.hours_played || 0} hours</p>
                    <p>Would you recommend this game to other players?</p>
                    <div className="recommend-buttons">
                      <button className="recommend-btn yes">Yes</button>
                      <button className="recommend-btn no">No</button>
                      <button className="recommend-btn maybe">Maybe Later</button>
                    </div>
                  </div>

                  <div className="activity-section">
                    <h3>ACTIVITY</h3>
                    <textarea
                      placeholder="Say something about this game to your friends..."
                      className="activity-textarea"
                    />
                  </div>

                  <div className="game-description">
                    <h3>About</h3>
                    <p>{selectedGame.game.description || 'No description available.'}</p>
                    <div className="game-meta">
                      <div className="meta-item">
                        <span className="meta-label">Developer:</span>
                        <span>{selectedGame.game.developer}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Publisher:</span>
                        <span>{selectedGame.game.publisher}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Release Date:</span>
                        <span>
                          {new Date(selectedGame.game.release_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="details-sidebar">
                  <div className="sidebar-widget">
                    <h4>FRIENDS WHO PLAY</h4>
                    <p>0 friends have played previously</p>
                  </div>

                  <div className="sidebar-widget">
                    <h4>ACHIEVEMENTS</h4>
                    <p>You've unlocked 0/0</p>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default LibraryPage;
