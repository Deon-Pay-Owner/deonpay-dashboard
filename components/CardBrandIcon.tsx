export default function CardBrandIcon({ brand, size = 24 }: { brand?: string; size?: number }) {
  const brandLower = brand?.toLowerCase() || ''

  // Visa
  if (brandLower === 'visa') {
    return (
      <svg width={size} height={size * 0.625} viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="30" rx="4" fill="#1A1F71"/>
        <path d="M19.7 19.8L21.8 10.2H24.9L22.8 19.8H19.7ZM34.2 10.5C33.6 10.3 32.6 10 31.3 10C28.3 10 26.1 11.5 26.1 13.7C26.1 15.3 27.6 16.2 28.7 16.7C29.9 17.3 30.3 17.7 30.3 18.2C30.3 19 29.4 19.4 28.5 19.4C27.3 19.4 26.6 19.2 25.7 18.8L25.3 18.6L24.9 21.2C25.6 21.5 27 21.8 28.4 21.8C31.6 21.8 33.8 20.3 33.8 18C33.8 16.7 32.9 15.7 30.9 14.9C29.9 14.4 29.4 14.1 29.4 13.5C29.4 13 30 12.4 31.4 12.4C32.5 12.4 33.3 12.6 34 13L34.3 13.1L34.7 10.5H34.2ZM41.1 10.2H38.7C37.9 10.2 37.3 10.4 37 11.1L32.5 19.8H35.7L36.3 18.3H40.2L40.5 19.8H43.3L41.1 10.2ZM37.1 16.1L38.7 12.2L39.7 16.1H37.1ZM16.5 10.2L13.5 16.6L13.2 15.1L12.2 10.7C12.1 10.4 11.7 10.2 11.3 10.2H6.70001L6.60001 10.6C7.60001 10.8 8.50001 11.1 9.30001 11.5L12 19.8H15.2L20 10.2H16.5Z" fill="white"/>
      </svg>
    )
  }

  // Mastercard
  if (brandLower === 'mastercard' || brandLower === 'master') {
    return (
      <svg width={size} height={size * 0.625} viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="30" rx="4" fill="#EB001B"/>
        <circle cx="18" cy="15" r="9" fill="#FF5F00"/>
        <circle cx="30" cy="15" r="9" fill="#F79E1B"/>
        <path d="M24 8.18182C25.7273 9.63636 26.8182 11.7273 26.8182 14.0909C26.8182 16.4545 25.7273 18.5455 24 20C22.2727 18.5455 21.1818 16.4545 21.1818 14.0909C21.1818 11.7273 22.2727 9.63636 24 8.18182Z" fill="#FF5F00"/>
      </svg>
    )
  }

  // American Express
  if (brandLower === 'amex' || brandLower === 'american express') {
    return (
      <svg width={size} height={size * 0.625} viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="30" rx="4" fill="#006FCF"/>
        <path d="M10.5 11.5H13.2L14.4 14.3L15.6 11.5H18.3V17.5H16.5V13.5L15.1 16.5H13.7L12.3 13.5V17.5H10.5V11.5ZM19.5 11.5H24.3V13H21.3V13.8H24.2V15.3H21.3V16H24.3V17.5H19.5V11.5ZM25.5 17.5L28.5 14.5L25.5 11.5H27.8L29.4 13.3L31 11.5H33.3L30.3 14.5L33.3 17.5H31L29.4 15.7L27.8 17.5H25.5Z" fill="white"/>
      </svg>
    )
  }

  // Discover
  if (brandLower === 'discover') {
    return (
      <svg width={size} height={size * 0.625} viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="30" rx="4" fill="#FF6000"/>
        <circle cx="38" cy="15" r="10" fill="#F79E1B"/>
        <path d="M8 11H11.5C13.5 11 14.5 12 14.5 13.5C14.5 15 13.5 16 11.5 16H9.5V19H8V11ZM9.5 12.5V14.5H11.3C12.2 14.5 12.8 14 12.8 13.5C12.8 13 12.2 12.5 11.3 12.5H9.5Z" fill="white"/>
      </svg>
    )
  }

  // Cartes Bancaires
  if (brandLower === 'cartes_bancaires' || brandLower === 'cartes bancaires') {
    return (
      <svg width={size} height={size * 0.625} viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="30" rx="4" fill="#005AB9"/>
        <path d="M16 15C16 18.866 19.134 22 23 22C26.866 22 30 18.866 30 15C30 11.134 26.866 8 23 8C19.134 8 16 11.134 16 15Z" fill="white"/>
      </svg>
    )
  }

  // Default generic card icon
  return (
    <svg width={size} height={size * 0.625} viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="30" rx="4" fill="#6B7280"/>
      <rect x="6" y="10" width="36" height="4" rx="1" fill="white" opacity="0.3"/>
      <rect x="6" y="17" width="12" height="3" rx="1" fill="white" opacity="0.5"/>
      <rect x="22" y="17" width="8" height="3" rx="1" fill="white" opacity="0.5"/>
    </svg>
  )
}
