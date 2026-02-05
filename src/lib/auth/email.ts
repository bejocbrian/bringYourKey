import { isDisposableEmail } from './disposable-domains'

export function validateEmail(email: string): { valid: boolean; error?: string } {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  // Check for disposable email domains
  if (isDisposableEmail(email)) {
    return { 
      valid: false, 
      error: 'Disposable email addresses are not allowed. Please use a permanent email address.' 
    }
  }

  return { valid: true }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }

  // Check for at least one uppercase, one lowercase, one number
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return { 
      valid: false, 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    }
  }

  return { valid: true }
}
