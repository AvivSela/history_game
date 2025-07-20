import React, { useState, useEffect } from 'react';
import { gameAPI, extractData, handleAPIError } from '../utils/api';
import './Admin.css';

/**
 * Admin Page Component
 * @description Provides card management interface for administrators
 * @returns {JSX.Element} Admin page with card management functionality
 */
const Admin = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    sortBy: 'date_occurred',
    sortOrder: 'ASC'
  });
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0
  });

  /**
   * Fetch cards from the API with current filters and pagination
   */
  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('limit', pagination.limit);
      params.append('offset', pagination.offset);

      const response = await gameAPI.getAdminCards(params.toString());
      const data = extractData(response);
      
      setCards(data.cards);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total
      }));
    } catch (err) {
      setError(handleAPIError(err, 'Failed to fetch cards'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new card
   */
  const createCard = async (cardData) => {
    try {
      await gameAPI.createAdminCard(cardData);
      await fetchCards();
      setIsModalOpen(false);
      setSelectedCard(null);
    } catch (err) {
      setError(handleAPIError(err, 'Failed to create card'));
    }
  };

  /**
   * Update an existing card
   */
  const updateCard = async (cardId, cardData) => {
    try {
      await gameAPI.updateAdminCard(cardId, cardData);
      await fetchCards();
      setIsModalOpen(false);
      setSelectedCard(null);
    } catch (err) {
      setError(handleAPIError(err, 'Failed to update card'));
    }
  };

  /**
   * Delete a card
   */
  const deleteCard = async (cardId) => {
    try {
      await gameAPI.deleteAdminCard(cardId);
      await fetchCards();
      setIsDeleteModalOpen(false);
      setSelectedCard(null);
    } catch (err) {
      setError(handleAPIError(err, 'Failed to delete card'));
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  /**
   * Handle pagination changes
   */
  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };

  /**
   * Open modal for creating/editing card
   */
  const openCardModal = (card = null) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  /**
   * Open delete confirmation modal
   */
  const openDeleteModal = (card) => {
    setSelectedCard(card);
    setIsDeleteModalOpen(true);
  };

  // Fetch cards on component mount and when filters/pagination change
  useEffect(() => {
    fetchCards();
  }, [filters, pagination.offset]);

  if (loading && cards.length === 0) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading cards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Card Management</h1>
          <p>Manage historical cards for the Timeline game</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <div className="admin-controls">
          <div className="filters">
            <input
              type="text"
              placeholder="Search cards..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Technology">Technology</option>
              <option value="Arts">Arts</option>
              <option value="Politics">Politics</option>
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="filter-select"
            >
              <option value="">All Difficulties</option>
              <option value="1">Easy (1)</option>
              <option value="2">Medium (2)</option>
              <option value="3">Hard (3)</option>
              <option value="4">Expert (4)</option>
              <option value="5">Master (5)</option>
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="date_occurred">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
              <option value="difficulty">Sort by Difficulty</option>
            </select>
            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              className="sort-button"
            >
              {filters.sortOrder === 'ASC' ? '↑' : '↓'}
            </button>
          </div>
          
          <button
            onClick={() => openCardModal()}
            className="add-card-button"
          >
            + Add New Card
          </button>
        </div>

        <div className="cards-table-container">
          <table className="cards-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id}>
                  <td className="card-title">{card.title}</td>
                  <td className="card-date">{new Date(card.dateOccurred).toLocaleDateString()}</td>
                  <td className="card-category">
                    <span className={`category-badge category-${card.category.toLowerCase()}`}>
                      {card.category}
                    </span>
                  </td>
                  <td className="card-difficulty">
                    <span className={`difficulty-badge difficulty-${card.difficulty}`}>
                      {card.difficulty}
                    </span>
                  </td>
                  <td className="card-description">
                    {card.description ? (
                      card.description.length > 50 
                        ? `${card.description.substring(0, 50)}...` 
                        : card.description
                    ) : (
                      <span className="no-description">No description</span>
                    )}
                  </td>
                  <td className="card-actions">
                    <button
                      onClick={() => openCardModal(card)}
                      className="edit-button"
                      title="Edit card"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteModal(card)}
                      className="delete-button"
                      title="Delete card"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cards.length === 0 && !loading && (
          <div className="no-cards">
            <p>No cards found matching your criteria.</p>
            <button onClick={() => openCardModal()} className="add-first-card-button">
              Add Your First Card
            </button>
          </div>
        )}

        {pagination.total > pagination.limit && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
              disabled={pagination.offset === 0}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {Math.floor(pagination.offset / pagination.limit) + 1} of{' '}
              {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => handlePageChange(pagination.offset + pagination.limit)}
              disabled={pagination.offset + pagination.limit >= pagination.total}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        )}

        {/* Card Modal */}
        {isModalOpen && (
          <CardModal
            card={selectedCard}
            onSave={selectedCard ? updateCard : createCard}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCard(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedCard && (
          <DeleteModal
            card={selectedCard}
            onConfirm={deleteCard}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setSelectedCard(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Card Modal Component
 * @param {Object} props - Component props
 * @param {Object} props.card - Card data (null for new card)
 * @param {Function} props.onSave - Save handler
 * @param {Function} props.onClose - Close handler
 * @returns {JSX.Element} Modal for creating/editing cards
 */
const CardModal = ({ card, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: card?.title || '',
    description: card?.description || '',
    dateOccurred: card?.dateOccurred ? card.dateOccurred.split('T')[0] : '',
    category: card?.category || 'History',
    difficulty: card?.difficulty || 1
  });
  const [errors, setErrors] = useState({});

  /**
   * Handle form input changes
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.dateOccurred) {
      newErrors.dateOccurred = 'Date is required';
    } else {
      const date = new Date(formData.dateOccurred);
      if (isNaN(date.getTime())) {
        newErrors.dateOccurred = 'Invalid date format';
      }
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.difficulty < 1 || formData.difficulty > 5) {
      newErrors.difficulty = 'Difficulty must be between 1 and 5';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const cardData = {
      ...formData,
      difficulty: parseInt(formData.difficulty)
    };
    
    if (card) {
      onSave(card.id, cardData);
    } else {
      onSave(cardData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{card ? 'Edit Card' : 'Add New Card'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'error' : ''}
              placeholder="Enter card title"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dateOccurred">Date Occurred *</label>
            <input
              type="date"
              id="dateOccurred"
              value={formData.dateOccurred}
              onChange={(e) => handleInputChange('dateOccurred', e.target.value)}
              className={errors.dateOccurred ? 'error' : ''}
            />
            {errors.dateOccurred && <span className="error-message">{errors.dateOccurred}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={errors.category ? 'error' : ''}
              >
                <option value="History">History</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="Arts">Arts</option>
                <option value="Politics">Politics</option>
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty *</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className={errors.difficulty ? 'error' : ''}
              >
                <option value={1}>Easy (1)</option>
                <option value={2}>Medium (2)</option>
                <option value={3}>Hard (3)</option>
                <option value={4}>Expert (4)</option>
                <option value={5}>Master (5)</option>
              </select>
              {errors.difficulty && <span className="error-message">{errors.difficulty}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter card description (optional)"
              rows={4}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              {card ? 'Update Card' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Delete Confirmation Modal Component
 * @param {Object} props - Component props
 * @param {Object} props.card - Card to delete
 * @param {Function} props.onConfirm - Confirm deletion handler
 * @param {Function} props.onCancel - Cancel handler
 * @returns {JSX.Element} Delete confirmation modal
 */
const DeleteModal = ({ card, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Card</h2>
          <button onClick={onCancel} className="close-button">×</button>
        </div>
        
        <div className="delete-content">
          <p>Are you sure you want to delete this card?</p>
          <div className="card-preview">
            <h3>{card.title}</h3>
            <p><strong>Date:</strong> {new Date(card.dateOccurred).toLocaleDateString()}</p>
            <p><strong>Category:</strong> {card.category}</p>
            <p><strong>Difficulty:</strong> {card.difficulty}</p>
          </div>
          <p className="warning">This action cannot be undone.</p>
        </div>
        
        <div className="form-actions">
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(card.id)} 
            className="delete-confirm-button"
          >
            Delete Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin; 