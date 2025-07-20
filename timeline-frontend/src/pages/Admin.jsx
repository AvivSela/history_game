import React, { useState, useEffect } from 'react';
import './Admin.css';

/**
 * Admin Page
 * 
 * Main admin interface for managing the timeline game.
 * Currently includes card management functionality.
 * 
 * @component
 * @returns {JSX.Element} The admin page component
 */
const Admin = () => {
  const [activeTab, setActiveTab] = useState('cards');
  const [error, setError] = useState(null);
  const [CardManager, setCardManager] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('Admin page mounted');
    
    // Dynamically import CardManager
    import('../components/admin/CardManager')
      .then(module => {
        console.log('CardManager loaded successfully');
        setCardManager(() => module.default);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load CardManager:', err);
        setError('Failed to load Card Manager: ' + err.message);
        setLoading(false);
      });
  }, []);

  const tabs = [
    { id: 'cards', label: 'Card Management', component: CardManager ? <CardManager /> : <div>Loading Card Manager...</div> },
    // Future tabs can be added here:
    // { id: 'players', label: 'Player Management', component: <PlayerManager /> },
    // { id: 'analytics', label: 'Analytics', component: <Analytics /> },
    // { id: 'system', label: 'System Health', component: <SystemHealth /> },
  ];

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;

  // Loading state
  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">Timeline Game Admin</h1>
          <p className="admin-subtitle">Loading admin interface...</p>
        </div>
        <div className="admin-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5"></div>
            <p>Loading Card Manager component...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error boundary for the component
  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">Timeline Game Admin</h1>
          <p className="admin-subtitle">Error loading admin interface</p>
        </div>
        <div className="admin-content">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Reload Page</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Timeline Game Admin</h1>
        <p className="admin-subtitle">Manage game content and monitor system performance</p>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeComponent}
      </div>
    </div>
  );
};

export default Admin; 