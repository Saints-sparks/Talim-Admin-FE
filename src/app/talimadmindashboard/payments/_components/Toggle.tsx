/**
 * The on/off switch for a provider.
 *
 * @param props - The switch state and handler.
 * @param props.checked - Whether the provider is enabled.
 * @param props.onChange - Toggles it.
 * @param props.disabled - Disables the control.
 * @param props.label - Accessible name.
 * @returns The switch element.
 */
export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#003366]/30 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-[#003366]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
