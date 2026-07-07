/**
 * HTML escaping utility for safe interpolation into HTML responses.
 *
 * Used by routes that return raw HTML (e.g. printable invoices) to prevent
 * stored XSS when customer-submitted fields are rendered in admin contexts.
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 */

/**
 * Escape a string for safe interpolation into HTML element content or attribute values.
 *
 * Returns an empty string for null/undefined input so callers can write
 * `escapeHtml(user.firstName)` without null checks.
 *
 * @example
 *   escapeHtml(`<img src=x onerror=alert(1)>`)
 *   // → "&lt;img src=x onerror=alert(1)&gt;"
 *
 *   escapeHtml(undefined)
 *   // → ""
 */
export function escapeHtml(value: string | null | undefined): string {
  if (value == null) return "";
  return String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return char;
    }
  });
}

/**
 * Escape an object's string-valued fields for safe HTML interpolation.
 *
 * Walks one level deep — useful for address objects where every field
 * is a string and needs escaping before rendering.
 *
 * @example
 *   const safe = escapeHtmlFields(shippingAddress);
 *   // → { firstName: "Jane", lastName: "Doe&lt;script&gt;", ... }
 */
export function escapeHtmlFields<T extends Record<string, unknown>>(
  obj: T | null | undefined,
): Record<string, string> {
  if (obj == null) return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = escapeHtml(typeof value === "string" ? value : String(value ?? ""));
  }
  return result;
}
