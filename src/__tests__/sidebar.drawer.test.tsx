/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Sidebartalim from '@/components/TalimSidebar/Sidebar';

let pathname = '/talimsupport';
jest.mock('next/navigation', () => ({ usePathname: () => pathname }));
jest.mock('@/app/context/AuthContext', () => ({
  useAuthContext: () => ({ user: { firstName: 'Paula', lastName: 'Platform', email: 'platform@e2e.talim.test' }, logout: jest.fn() }),
}));
jest.mock('@/app/context/NavigationLoadingContext', () => ({ useNavigationLoading: () => ({ setIsNavigating: jest.fn() }) }));

/** The drawer element (its classes say whether it is on screen below lg). */
const drawer = () => document.getElementById('talim-sidebar')!;

describe('the sidebar on a phone', () => {
  it('starts closed, so the page is not covered, and the labelled menu button opens and closes it', () => {
    render(<Sidebartalim />);
    expect(drawer().className).toContain('-translate-x-full');
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'talim-sidebar');
    fireEvent.click(toggle);
    expect(drawer().className).not.toContain('-translate-x-full');
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes after a navigation', () => {
    const { rerender } = render(<Sidebartalim />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(drawer().className).not.toContain('-translate-x-full');
    pathname = '/talimschool';
    act(() => rerender(<Sidebartalim />));
    expect(drawer().className).toContain('-translate-x-full');
  });
});
