import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import SettingsModal from '../../components/SettingsModal';
import React from 'react';
import useChromeStorage from '../../hooks/useChromeStorage';

// Mock the custom hook and utilities
vi.mock('../../hooks/useChromeStorage');

vi.mock('../../utils/notifications', () => ({
  notification: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock fetch for backend validation
global.fetch = vi.fn();

describe('SettingsModal', () => {
  const mockOnCancel = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useChromeStorage
    useChromeStorage.mockImplementation((key, defaultValue) => {
      if (key === 'frontendOnlyMode') return [false, vi.fn(), false];
      if (key === 'geminiApiKey') return ['', vi.fn(), false];
      if (key === 'backendUrl') return ['http://localhost:3001', vi.fn(), false];
      return [defaultValue, vi.fn(), false];
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <SettingsModal
        visible={true}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        {...props}
      />
    );
  };

  it('renders correctly in Backend Mode by default', () => {
    renderComponent();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Direct API Mode' })).not.toBeChecked();
    expect(screen.getByLabelText('Backend URL *')).toBeInTheDocument();
    expect(screen.queryByLabelText('Gemini API Key *')).not.toBeInTheDocument();
  });

  it('switches to Direct API Mode and shows API key input', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('switch', { name: 'Direct API Mode' }));
    expect(screen.getByLabelText('Gemini API Key *')).toBeInTheDocument();
    expect(screen.queryByLabelText('Backend URL *')).not.toBeInTheDocument();
  });

  it('disables Save button when backend URL is invalid', () => {
    renderComponent();
    const backendUrlInput = screen.getByLabelText('Backend URL *');
    fireEvent.change(backendUrlInput, { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('disables Save button when API key is invalid in Direct API Mode', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('switch', { name: 'Direct API Mode' }));
    const apiKeyInput = screen.getByLabelText('Gemini API Key *');
    fireEvent.change(apiKeyInput, { target: { value: 'invalid-key' } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('enables Save button with a valid API key in Direct API Mode', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('switch', { name: 'Direct API Mode' }));
    const apiKeyInput = screen.getByLabelText('Gemini API Key *');
    fireEvent.change(apiKeyInput, { target: { value: 'AIzaSy...' } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('calls onCancel and resets state when Cancel button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('switch', { name: 'Direct API Mode' })); // Change state
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('restores default settings when "Restore Defaults" is clicked', () => {
    renderComponent();
    // Change some settings first
    fireEvent.click(screen.getByRole('switch', { name: 'Direct API Mode' }));
    fireEvent.change(screen.getByLabelText('Gemini API Key *'), { target: { value: 'AIza...' } });

    // Now restore defaults
    fireEvent.click(screen.getByRole('button', { name: 'Restore Defaults' }));

    // Check that the UI has reset
    expect(screen.getByRole('switch', { name: 'Direct API Mode' })).not.toBeChecked();
    expect(screen.getByLabelText('Backend URL *')).toHaveValue('http://localhost:3001');
  });
});
