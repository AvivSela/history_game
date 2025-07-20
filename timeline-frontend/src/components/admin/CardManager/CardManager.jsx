import React, { useState, useEffect, useCallback } from 'react';
import { gameAPI } from '@utils/api';
import './CardManager.css';

/**
 * CardManager - Admin component for managing timeline game cards
 *
 * This component provides a comprehensive interface for creating, editing,
 * and deleting historical event cards used in the timeline game.
 *
 * @component
 * @example
 * ```jsx
 * <CardManager />
 * ```
 *
 * @returns {JSX.Element} The card manager component
 */
const CardManager = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Form state for creating/editing cards
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateOccurred: '',
    category: '',
    difficulty: 2
  });

  const categories = [
    'History', 'Technology', 'Science', 'Space', 'Aviation', 
    'Cultural', 'Military', 'Political', 'Disaster'
  ];

  const difficulties = [1, 2, 3, 4, 5];

  /**
   * Load cards from the API
   */
  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        ...filters
      });

      const response = await gameAPI.getAdminCards(params.toString());
      const data = response.data;

      setCards(data.cards);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total
      }));
    } catch (err) {
      setError('Failed to load cards: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Reset form data
   */
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dateOccurred: '',
      category: '',
      difficulty: 2
    });
    setSelectedCard(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  /**
   * Create a new card
   */
  const handleCreateCard = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      await gameAPI.createAdminCard(formData);
      
      resetForm();
      loadCards();
    } catch (err) {
      setError('Failed to create card: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing card
   */
  const handleUpdateCard = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      await gameAPI.updateAdminCard(selectedCard.id, formData);
      
      resetForm();
      loadCards();
    } catch (err) {
      setError('Failed to update card: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a card
   */
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await gameAPI.deleteAdminCard(cardId);
      loadCards();
    } catch (err) {
      setError('Failed to delete card: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start editing a card
   */
  const handleEditCard = (card) => {
    setSelectedCard(card);
    setFormData({
      title: card.title,
      description: card.description || '',
      dateOccurred: card.dateOccurred,
      category: card.category,
      difficulty: card.difficulty
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  /**
   * Start creating a new card
   */
  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(false);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Load cards on component mount and when dependencies change
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return (
    <div className="card-manager">
      <div className="card-manager-header">
        <h1>Card Manager</h1>
        <button 
          className="btn btn-primary"
          onClick={handleStartCreate}
          disabled={loading}
        >
          Add New Card
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className="card-manager-filters">
        <div className="filter-group">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search cards..."
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
          >
            <option value="">All Difficulties</option>
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff} Star{diff !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <div className="card-form-overlay">
          <div className="card-form">
            <h2>{isCreating ? 'Create New Card' : 'Edit Card'}</h2>
            
            <form onSubmit={isCreating ? handleCreateCard : handleUpdateCard}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={255}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOccurred">Date *</label>
                  <input
                    type="date"
                    id="dateOccurred"
                    name="dateOccurred"
                    value={formData.dateOccurred}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty *</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff} Star{diff !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isCreating ? 'Create Card' : 'Update Card')}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cards List */}
      <div className="cards-list">
        {loading ? (
          <div className="loading">Loading cards...</div>
        ) : cards.length === 0 ? (
          <div className="no-cards">No cards found</div>
        ) : (
          <>
            <div className="cards-grid">
              {cards.map(card => (
                <div key={card.id} className="card-item">
                  <div className="card-header">
                    <h3>{card.title}</h3>
                    <div className="card-meta">
                      <span className="category">{card.category}</span>
                      <span className="difficulty">
                        {'★'.repeat(card.difficulty)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <p className="date">
                      {new Date(card.dateOccurred).toLocaleDateString()}
                    </p>
                    {card.description && (
                      <p className="description">{card.description}</p>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn btn-small btn-secondary"
                      onClick={() => handleEditCard(card)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="pagination">
                <button
                  className="btn btn-small"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                
                <span className="page-info">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                
                <button
                  className="btn btn-small"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardManager; 