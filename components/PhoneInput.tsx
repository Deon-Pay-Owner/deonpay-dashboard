'use client'

import PhoneInputWithCountry from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  defaultCountry?: string
  disabled?: boolean
}

export default function PhoneInput({
  value,
  onChange,
  error,
  defaultCountry = 'MX',
  disabled = false,
}: PhoneInputProps) {
  return (
    <div>
      <PhoneInputWithCountry
        international
        defaultCountry={defaultCountry as any}
        value={value}
        onChange={(val) => onChange(val || '')}
        className="phone-input-custom"
        disabled={disabled}
        numberInputProps={{
          className: 'input-field',
          disabled,
        }}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      <style jsx global>{`
        .phone-input-custom {
          display: flex;
          gap: 0.5rem;
        }
        .phone-input-custom .PhoneInputCountry {
          padding: 0.625rem;
          border: 1px solid var(--color-border);
          border-radius: 0.5rem;
          background: var(--color-background);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .phone-input-custom .PhoneInputCountrySelect {
          background: transparent;
          border: none;
          font-size: 0.875rem;
          cursor: pointer;
          color: var(--color-textPrimary);
        }
        .phone-input-custom .PhoneInputCountryIcon {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 0.125rem;
          overflow: hidden;
        }
        .phone-input-custom .PhoneInputCountryIcon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .phone-input-custom input[type="tel"] {
          flex: 1;
        }
      `}</style>
    </div>
  )
}
