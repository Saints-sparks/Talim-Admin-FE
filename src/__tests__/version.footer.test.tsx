/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import packageJson from '../../package.json';
import { AppFooter } from '@/components/layout/AppFooter';
import AppShell from '@/components/layout/AppShell';
import { APP_VERSION, versionLabel } from '@/lib/version';

let pathname = '/talimadmindashboard';

jest.mock('next/navigation', () => ({ usePathname: () => pathname }));
jest.mock('@/app/context/AuthContext', () => ({ useAuthContext: () => ({ isAuthenticated: true }) }));
jest.mock('@/components/auth/RouteGuard', () => ({ RouteGuard: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
jest.mock('@/components/TalimSidebar/Sidebar', () => ({ __esModule: true, default: () => <nav aria-label="Sidebar" /> }));

describe('version 1.5.0', () => {
  it('is the package version', () => {
    expect(packageJson.version).toBe('1.5.0');
    expect(APP_VERSION).toBe(packageJson.version);
    expect(versionLabel()).toBe('Version 1.5.0');
  });

  it('shows "Version 1.5.0" in the footer, read from package.json', () => {
    render(<AppFooter />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Talim Admin');
    expect(screen.getByTestId('app-version')).toHaveTextContent(`Version ${packageJson.version}`);
  });

  it('ends every page of the shell, signed in or on the sign-in screen', () => {
    const { unmount } = render(
      <AppShell>
        <h1>Dashboard</h1>
      </AppShell>,
    );
    expect(screen.getByRole('navigation', { name: 'Sidebar' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Version 1.5.0');
    unmount();

    pathname = '/talimadminlogin';
    render(
      <AppShell>
        <h1>Sign in</h1>
      </AppShell>,
    );
    expect(screen.queryByRole('navigation', { name: 'Sidebar' })).toBeNull();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Version 1.5.0');
  });
});
