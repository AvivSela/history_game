import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Settings from './Settings';

// Mock the settings context
const mockSettings = {
  difficulty: 'medium',
  cardCount: 5,
  categories: ['history', 'science'],
  soundEffects: true,
  animations: true,
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderSupport: false,
  autoSave: true,
  performanceMode: false
};

const mockUpdateSetting = vi.fn();
const mockUpdateSettings = vi.fn();
const mockResetSettings = vi.fn();
const mockExportSettings = vi.fn(() => ({ success: true, data: mockSettings }));
const mockImportSettings = vi.fn(() => ({ success: true }));
const mockHasUnsavedChanges = vi.fn(() => false);
const mockGetSettingsDiff = vi.fn(() => ({}));
const mockClearAllErrors = vi.fn();
const mockIsReady = vi.fn(() => true);
const mockHasError = vi.fn(() => false);
const mockHasValidationErrors = vi.fn(() => false);
const mockGetValidationError = vi.fn(() => null);

// Mock the useSettingsEnhanced hook
vi.mock('../hooks/useSettings', () => ({
  useSettingsEnhanced: vi.fn(() => ({
    settings: mockSettings,
    isLoading: false,
    error: null,
    validationErrors: {},
    updateSetting: mockUpdateSetting,
    updateSettings: mockUpdateSettings,
    resetSettings: mockResetSettings,
    exportSettings: mockExportSettings,
    importSettings: mockImportSettings,
    hasUnsavedChanges: mockHasUnsavedChanges,
    getSettingsDiff: mockGetSettingsDiff,
    clearAllErrors: mockClearAllErrors,
    isReady: mockIsReady,
    hasError: mockHasError,
    hasValidationErrors: mockHasValidationErrors,
    getValidationError: mockGetValidationError
  }))
}));

// Mock the settings components
vi.mock('../components/settings/SettingsSection', () => ({
  default: ({ children, title }) => (
    <div data-testid="settings-section">
      <h3>{title}</h3>
      {children}
    </div>
  )
}));

vi.mock('../components/settings/DifficultySelector', () => ({
  default: ({ value, onChange }) => (
    <div data-testid="difficulty-selector">
      <label>Difficulty</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  )
}));

vi.mock('../components/settings/CardCountSlider', () => ({
  default: ({ value, onChange, label }) => (
    <div data-testid="card-count-slider">
      <label>{label}</label>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        min="3"
        max="10"
      />
      <span>{value}</span>
    </div>
  )
}));

vi.mock('../components/settings/CategorySelector', () => ({
  default: ({ value, categories, onChange }) => (
    <div data-testid="category-selector">
      <label>Categories</label>
      <select
        multiple
        value={value}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, option => option.value);
          onChange(selected);
        }}
      >
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
    </div>
  )
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Settings Page', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock successful categories API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: ['History', 'Science', 'Technology', 'Space', 'Aviation']
      })
    });
  });

  const renderSettings = () => {
    return render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );
  };

  describe('Page Rendering', () => {
    it('should render the settings page with correct title', async () => {
      renderSettings();
      
      await waitFor(() => {
        expect(screen.getByText('⚙️ Game Settings')).toBeInTheDocument();
      });
    });

    it('should render settings sections', async () => {
      renderSettings();
      
      await waitFor(() => {
        expect(screen.getByText('🎮 Game Settings')).toBeInTheDocument();
        expect(screen.getByText('♿ Accessibility')).toBeInTheDocument();
        expect(screen.getByText('⚡ Performance')).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      renderSettings();
      
      await waitFor(() => {
        expect(screen.getByText('💾 Save Settings')).toBeInTheDocument();
        expect(screen.getByText('🔄 Reset to Defaults')).toBeInTheDocument();
        expect(screen.getByText('📤 Export Settings')).toBeInTheDocument();
        expect(screen.getByText('📥 Import Settings')).toBeInTheDocument();
        expect(screen.getByText('🎮 Start Game')).toBeInTheDocument();
      });
    });

    it('should render settings preview', async () => {
      renderSettings();
      
      await waitFor(() => {
        expect(screen.getByText('⚡ Current Settings')).toBeInTheDocument();
        expect(screen.getByText('Difficulty:')).toBeInTheDocument();
        expect(screen.getByText('Cards:')).toBeInTheDocument();
        expect(screen.getByText('Categories:')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should not show loading state when ready', async () => {
      renderSettings();
      
      await waitFor(() => {
        expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Categories Loading', () => {
    it('should load categories from API', async () => {
      renderSettings();
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/categories');
      });
    });

    it('should handle API failure gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      renderSettings();
      
      await waitFor(() => {
        expect(screen.getByText('⚙️ Game Settings')).toBeInTheDocument();
      });
    });

    it('should handle API response error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500
      });
      
      renderSettings();
      
      await waitFor(() => {
        expect(screen.getByText('⚙️ Game Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('should handle save settings', async () => {
      renderSettings();
      
      await waitFor(() => {
        const saveButton = screen.getByText('💾 Save Settings');
        fireEvent.click(saveButton);
      });
      
      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('Settings saved successfully!')).toBeInTheDocument();
      });
    });



  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      renderSettings();
      
      await waitFor(() => {
        // Check for main heading
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        
        // Check for section headings
        expect(screen.getByRole('heading', { name: '🎮 Game Settings' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '♿ Accessibility' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '⚡ Performance' })).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render properly on mobile viewport', async () => {
      // Mock viewport for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderSettings();
      
      await waitFor(() => {
        expect(screen.getByText('⚙️ Game Settings')).toBeInTheDocument();
      });
    });
  });
}); 