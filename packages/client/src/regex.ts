/**
 * This module contains multiple regexes for common patterns.
 * @module
 */

/**
 * Regex for markdown bullet list
 */
export const BULLET_LIST_REGEX = "(- [^\n]*\n)+(- [^\n]*)(\n\n)?";
/**
 * Regex for markdown numbered list
 */
export const NUMBERED_LIST_REGEX = "([0-9]+\\. [^\n]*\n)+([0-9]+\\. [^\n]*)(\n\n)?";

/**
 * Regex for integers
 */
export const INTEGER_REGEX = "[0-9]+";

/**
 * Regex for decimals
 */
export const DECIMAL_REGEX = "[0-9]+\\.[0-9]+";

/**
 * Regex for dates
 */
export const DATE_REGEX = "\\d{4}-\\d{2}-\\d{2}";
