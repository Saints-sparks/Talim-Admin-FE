/** @jest-environment jsdom */
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { ProviderCard } from '@/app/talimadmindashboard/payments/_components/ProviderCard';
import type { PlatformProviderConfig } from '@/app/services/payments.service';

const configured: PlatformProviderConfig = {
  providerName: 'paystack',
  isEnabled: false,
  isDefault: false,
  publicKey: 'pk_test_1',
  environment: 'test',
  supportedChannels: ['card'],
  currency: 'NGN',
  merchantId: '',
  platformFeePercent: 2,
};

function setup(config: PlatformProviderConfig | null, providerName: 'paystack' | 'opay' = 'paystack') {
  const props = {
    providerName,
    config,
    isSaving: false,
    isToggling: false,
    onSave: jest.fn(),
    onToggle: jest.fn(),
    onInvalid: jest.fn(),
  };
  render(<ProviderCard {...props} />);
  return props;
}

describe('ProviderCard', () => {
  it('shows an unconfigured provider with a prompt and its switch disabled', () => {
    setup(null);
    expect(screen.getByText('Not configured')).toBeInTheDocument();
    expect(screen.getByText('Configure API keys to enable this provider.')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Enable Paystack' })).toBeDisabled();
  });

  it('switches a configured provider on', async () => {
    const props = setup(configured);
    expect(screen.getByText('Configured')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('switch', { name: 'Enable Paystack' }));
    expect(props.onToggle).toHaveBeenCalledWith('paystack', true);
  });

  it('expands to the credential form and refuses an empty public key', async () => {
    const props = setup(null);
    await userEvent.click(screen.getByRole('button', { name: 'Show Paystack configuration' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save Configuration' }));
    expect(props.onInvalid).toHaveBeenCalledWith('A public key is required.');
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('saves the typed configuration without blank secrets, then blanks the secret box', async () => {
    const props = setup(configured);
    await userEvent.click(screen.getByRole('button', { name: 'Show Paystack configuration' }));
    const secret = screen.getByLabelText(/Secret Key/);
    await userEvent.type(secret, 'sk_test_9');
    await userEvent.selectOptions(screen.getByLabelText('Environment'), 'live');
    await userEvent.click(screen.getByRole('button', { name: 'Save Configuration' }));

    expect(props.onSave).toHaveBeenCalledWith('paystack', {
      environment: 'live',
      supportedChannels: ['card'],
      platformFeePercent: 2,
      publicKey: 'pk_test_1',
      secretKey: 'sk_test_9',
    });
    expect(secret).toHaveValue('');
  });

  it('reveals and hides a secret, and only OPay asks for a merchant id', async () => {
    setup(configured, 'opay');
    await userEvent.click(screen.getByRole('button', { name: 'Show OPay configuration' }));
    expect(screen.getByLabelText('Merchant ID')).toBeInTheDocument();
    const secret = screen.getByLabelText(/Secret Key/);
    expect(secret).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Show secret key' }));
    expect(secret).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByRole('button', { name: 'Hide secret key' }));
    expect(secret).toHaveAttribute('type', 'password');
  });

  it('toggles channels and refuses to save with none selected', async () => {
    const props = setup(configured);
    await userEvent.click(screen.getByRole('button', { name: 'Show Paystack configuration' }));
    const card = screen.getByRole('button', { name: 'Card' });
    expect(card).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(card);
    expect(card).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Save Configuration' }));
    expect(props.onInvalid).toHaveBeenCalledWith('Select at least one payment channel.');
  });
});
