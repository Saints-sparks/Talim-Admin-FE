/** @jest-environment jsdom */
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/components/talimloginform/Form';
import { ApiError } from '@/lib/apiError';

const replace = jest.fn();
const login = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace, push: jest.fn() }) }));
jest.mock('@/app/context/AuthContext', () => ({ useAuthContext: () => ({ login }) }));

/**
 * Fills in and submits the sign-in form.
 *
 * @param email - The email to type.
 * @returns Resolves once the submit click has been dispatched.
 */
async function signIn(email: string): Promise<void> {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email address'), email);
  await user.type(screen.getByLabelText('Password'), 'secret');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
}

beforeEach(() => {
  replace.mockReset();
  login.mockReset();
});

describe('LoginForm', () => {
  it('shows Access denied when admin-login answers 403 FORBIDDEN for a non-admin account', async () => {
    // What auth.service.test.ts shows the client makes of the API's 403 body.
    login.mockRejectedValue(
      new ApiError(
        'FORBIDDEN',
        'Access denied: this portal is restricted to Talim administrators.',
        403,
      ),
    );
    render(<LoginForm />);

    await signIn('teacher@school.test');

    expect(await screen.findByText('Access denied')).toBeInTheDocument();
    expect(screen.getByText('teacher@school.test')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('goes to the dashboard after a successful sign-in', async () => {
    login.mockResolvedValue(undefined);
    render(<LoginForm />);

    await signIn('admin@talim.test');

    expect(login).toHaveBeenCalledWith({ email: 'admin@talim.test', password: 'secret' });
    expect(replace).toHaveBeenCalledWith('/talimadmindashboard');
  });
});
