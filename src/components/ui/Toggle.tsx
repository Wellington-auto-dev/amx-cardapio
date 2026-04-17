interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export function Toggle({ checked, onChange, label, disabled, ariaLabel }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-surface-3)',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
      {label && (
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
      )}
    </label>
  );
}
