/**
 * Security utilities for preventing XSS and other injection attacks
 */

/**
 * Escapes HTML characters to prevent XSS attacks
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') {
    return String(unsafe || '');
  }
  
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    // Also escape control characters that could be problematic
    .replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Sanitizes strings for Excel export to prevent formula injection
 */
export function sanitizeForExcel(value: string): string {
  if (typeof value !== 'string') {
    return String(value || '');
  }
  
  // Check if the string starts with potentially dangerous characters
  if (/^[=+\-@]/.test(value)) {
    // Prefix with a single quote to make it a literal string
    return "'" + value;
  }
  
  return value;
}