/**
 * Official DeonPay Logo Component
 * Minimalist and modern design following brand guidelines
 */

interface DeonPayLogoProps {
  className?: string
  variant?: 'full' | 'icon' | 'text'
  size?: number
}

export function DeonPayLogo({ className = '', variant = 'icon', size = 40 }: DeonPayLogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Modern "D" with payment icon integration */}
        <rect width="40" height="40" rx="8" fill="url(#gradient)" />

        {/* Stylized D + Payment Card */}
        <path
          d="M12 10H18C23.5 10 28 14.5 28 20C28 25.5 23.5 30 18 30H12V10Z"
          fill="white"
          opacity="0.95"
        />
        <path
          d="M14 14H18C21.3 14 24 16.7 24 20C24 23.3 21.3 26 18 26H14V14Z"
          fill="url(#gradient)"
        />

        {/* Payment chip element */}
        <rect x="16" y="17" width="4" height="3" rx="0.5" fill="white" opacity="0.9" />

        {/* Modern stripe pattern */}
        <rect x="14" y="22" width="8" height="1" rx="0.5" fill="white" opacity="0.7" />

        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#005FFF" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  if (variant === 'text') {
    return (
      <svg
        width={size * 3}
        height={size}
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <text
          x="2"
          y="28"
          fontFamily="Poppins, sans-serif"
          fontSize="24"
          fontWeight="700"
          fill="currentColor"
        >
          DeonPay
        </text>
      </svg>
    )
  }

  // Full variant (icon + text)
  return (
    <svg
      width={size * 4}
      height={size}
      viewBox="0 0 160 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Icon part */}
      <rect width="40" height="40" rx="8" fill="url(#gradient-full)" />
      <path
        d="M12 10H18C23.5 10 28 14.5 28 20C28 25.5 23.5 30 18 30H12V10Z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M14 14H18C21.3 14 24 16.7 24 20C24 23.3 21.3 26 18 26H14V14Z"
        fill="url(#gradient-full)"
      />
      <rect x="16" y="17" width="4" height="3" rx="0.5" fill="white" opacity="0.9" />
      <rect x="14" y="22" width="8" height="1" rx="0.5" fill="white" opacity="0.7" />

      {/* Text part */}
      <text
        x="50"
        y="28"
        fontFamily="Poppins, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="currentColor"
      >
        DeonPay
      </text>

      <defs>
        <linearGradient id="gradient-full" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#005FFF" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * Simple icon-only version for smaller spaces
 */
export function DeonPayIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="5" fill="url(#icon-gradient)" />
      <path
        d="M7 6H11C14.3 6 17 8.7 17 12C17 15.3 14.3 18 11 18H7V6Z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M8.5 8.5H11C12.9 8.5 14.5 10.1 14.5 12C14.5 13.9 12.9 15.5 11 15.5H8.5V8.5Z"
        fill="url(#icon-gradient)"
      />
      <rect x="10" y="10.5" width="2.5" height="1.8" rx="0.3" fill="white" opacity="0.9" />
      <rect x="8.5" y="13.5" width="5" height="0.6" rx="0.3" fill="white" opacity="0.7" />

      <defs>
        <linearGradient id="icon-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#005FFF" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
