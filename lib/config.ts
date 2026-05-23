// Logo configuration - can be changed from admin panel
export const getLogoPath = (): string => {
  // Check if logo path is stored in localStorage
  if (typeof window !== 'undefined') {
    const storedLogo = localStorage.getItem('hotel_logo_path')
    if (storedLogo) {
      return storedLogo
    }
  }
  
  // Default logo path
  return '/hotel-logo.png'
}

export const setLogoPath = (path: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hotel_logo_path', path)
  }
}

// Hotel branding
export const HOTEL_NAME = 'هتل نور حیات'
export const HOTEL_NAME_EN = 'Nour Hayat Hotel'
