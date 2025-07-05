import React, { useState, useEffect } from 'react';
import { gameAPI, extractData, handleAPIError } from '../utils/api';

const APITest = () => {
  const [healthStatus, setHealthStatus] = useState('Checking...');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    testAPIConnection();
  }, []);

  const testAPIConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test health check
      console.log('Testing health check...');
      const healthResponse = await gameAPI.healthCheck();
      setHealthStatus(`✅ Connected - ${healthResponse.data.message}`);

      // Test events endpoint
      console.log('Testing events endpoint...');
      const eventsResponse = await gameAPI.getRandomEvents(5);
      const eventsData = extractData(eventsResponse);
      setEvents(eventsData);

      console.log('✅ All API tests passed!');
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      setHealthStatus('❌ Connection failed');
      console.error('API Test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const testRandomEvents = async () => {
    try {
      setLoading(true);
      const response = await gameAPI.getRandomEvents(3);
      const data = extractData(response);
      setEvents(data);
      console.log('New random events loaded:', data);
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && events.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Testing API Connection...</h2>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 API Connection Test</h1>
      
      <div style={{ 
        padding: '15px', 
        margin: '10px 0', 
        backgroundColor: error ? '#ffebee' : '#e8f5e8',
        border: `1px solid ${error ? '#f44336' : '#4caf50'}`,
        borderRadius: '5px'
      }}>
        <h3>Health Status:</h3>
        <p>{healthStatus}</p>
        {error && (
          <div style={{ color: '#f44336', fontWeight: 'bold' }}>
            Error: {error}
          </div>
        )}
      </div>

      {events.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Sample Events ({events.length})</h3>
            <button 
              onClick={testRandomEvents}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Loading...' : 'Get New Random Events'}
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
            {events.map((event) => (
              <div 
                key={event.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                      {event.title}
                    </h4>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
                      {event.description}
                    </p>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      Category: {event.category} | 
                      Difficulty: {'★'.repeat(event.difficulty)} | 
                      Date: {new Date(event.dateOccurred).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h4>API Endpoints Tested:</h4>
        <ul>
          <li>✅ GET /api/health</li>
          <li>✅ GET /api/events/random/5</li>
        </ul>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Open browser developer tools to see detailed API logs.
        </p>
      </div>
    </div>
  );
};

export default APITest;

