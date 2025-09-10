import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import HelpModal from '../../components/HelpModal';
import React from 'react';

describe('HelpModal', () => {
  const defaultProps = {
    visible: true,
    onCancel: vi.fn(),
  };

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
    fireEvent.click(screen.getByText('Close'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the header close button (✕) is clicked', () => {
    const onCancel = vi.fn();
    render(<HelpModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('✕'));
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
