import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { getUserProfile, getLibrary, getRecentGames } from '../services/api';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [library, setLibrary] = useState([]);
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [profileData, libraryData, recentData] = await Promise.all([
        getUserProfile(),
        getLibrary(),
        getRecentGames()
      ]);

      setProfile(profileData);
      setLibrary(libraryData);
      setRecentGames(recentData.slice(0, 3)); // Get top 3 recent games
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const calculateTotalHours = () => {
    return library.reduce((total, item) => total + parseFloat(item.hours_played || 0), 0).toFixed(1);
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="profile-page">
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
            <Link to="/profile" className="active">PROFILE</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); navigate('/'); }}>
              LOGOUT
            </a>
          </nav>
        </div>
      </div>

      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-left">
            <img 
              src={profile.profile_picture || '/caleb.jpg'} 
              alt="Profile" 
              className="profile-pic" 
            />
            <div className="profile-info">
              <h1 className="profile-name">{user.user.username}</h1>
              <p className="profile-status">
                {profile.status_message || '(｀∀´)Ψ Welcome to my profile!'}
              </p>
            </div>
          </div>
          
          <div className="profile-right">
            <div className="profile-level">
              <span>Level</span>
              <span className="level-badge">{profile.level || 1}</span>
            </div>
            <div className="profile-badge">
              <div className="badge-icon">{library.length}+</div>
              <div className="badge-text">
                <div>Game Collector</div>
                <div>{profile.xp || 0} XP</div>
              </div>
            </div>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          <div className="profile-main">
            <div className="activity-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
                <span className="activity-time">{calculateTotalHours()} hours past 2 weeks</span>
              </div>

              {recentGames.length > 0 ? (
                recentGames.map((item, index) => (
                  <div key={item.id}>
                    <div className="activity-item" onClick={() => navigate(`/game/${item.game.id}`)}>
                      <img 
                        src={item.game.image || '/placeholder-game.jpg'} 
                        alt={item.game.title} 
                        className="activity-game-img" 
                      />
                      <div className="activity-details">
                        <h3>{item.game.title}</h3>
                        <div className="activity-stats">
                          <span>{parseFloat(item.hours_played).toFixed(1)} hrs on record</span>
                          <span>
                            last played on {new Date(item.last_played).toLocaleDateString('en-US', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Achievement Progress for first game */}
                    {index === 0 && (
                      <div className="achievement-progress">
                        <div className="progress-header">
                          <span>Achievement Progress</span>
                          <span className="progress-count">0 of 0</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: '0%' }}></div>
                        </div>
                        <div className="achievement-icons">
                          <span className="more-achievements">Coming Soon</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <p>No recent activity</p>
                  <Link to="/" className="browse-games-btn">Browse Games</Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title currently-online">Currently Online</h3>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-title">
                Badges <span className="badge-count">1</span>
              </h3>
              <div className="badge-list">
                <div className="badge-item">{library.length}+</div>
              </div>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-title">
                Games <span className="game-count">{library.length}</span>
              </h3>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-link" onClick={() => alert('Coming soon!')}>
                Inventory
              </h3>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-link" onClick={() => alert('Coming soon!')}>
                Screenshots
              </h3>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-link" onClick={() => alert('Coming soon!')}>
                Videos
              </h3>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-link" onClick={() => alert('Coming soon!')}>
                Workshop Items
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;