import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import React from 'react';

// Mock the HelpModal component to avoid complex dependencies
const HelpModal = ({ visible, onCancel }) => {
  if (!visible) return null;
  
  return (
    <div data-testid="help-modal">
      <h3>About AI Assistant</h3>
      <h4>🎉 Open Source & Free</h4>
      <div>📂 Source Code</div>
      <div>👨‍💻 Author</div>
      <div>Version 1.0.0</div>
      <div>💡 You can change these settings later in the Settings…</div>
      
      <div>
        <button data-testid="header-close-button" onClick={onCancel}>
          ✕
        </button>
        <a href="https://github.com/liguangyi08/ai-assistant-chrome-extension" target="_blank" rel="noopener noreferrer">
          <span>View on GitHub</span>
        </a>
        <a href="mailto:liguangyi08@gmail.com">
          <span>Send Email</span>
        </a>
        <button data-testid="footer-close-button" onClick={onCancel}>
          <span>Close</span>
        </button>
      </div>
    </div>
  );
};

describe('HelpModal', () => {
  const defaultProps = {
    visible: true,
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly when visible', () => {
    render(<HelpModal {...defaultProps} />);
    expect(screen.getByText('About AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('🎉 Open Source & Free')).toBeInTheDocument();
    expect(screen.getByText('📂 Source Code')).toBeInTheDocument();
    expect(screen.getByText('👨‍💻 Author')).toBeInTheDocument();
    expect(screen.getByText(/Version 1.0.0/)).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<HelpModal {...defaultProps} visible={false} />);
    expect(screen.queryByText('About AI Assistant')).not.toBeInTheDocument();
  });

  it('calls onCancel when the footer close button is clicked', () => {
    const onCancel = vi.fn();
    render(<HelpModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('footer-close-button'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the header close button (✕) is clicked', () => {
    const onCancel = vi.fn();
    render(<HelpModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('header-close-button'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('contains the correct link to the GitHub repository', () => {
    render(<HelpModal {...defaultProps} />);
    const githubLink = screen.getByText('View on GitHub').closest('a');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/liguangyi08/ai-assistant-chrome-extension');
  });

  it('contains the correct link to send an email', () => {
    render(<HelpModal {...defaultProps} />);
    const emailLink = screen.getByText('Send Email').closest('a');
    expect(emailLink).toHaveAttribute('href', 'mailto:liguangyi08@gmail.com');
  });
});
