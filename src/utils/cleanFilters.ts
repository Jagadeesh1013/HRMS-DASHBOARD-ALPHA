/**
 * Removes any null, undefined, or empty string properties from a filter object.
 * This ensures that empty query parameters are not sent to the backend.
 * @param filters An object containing filter keys and values.
 * @returns A new object with only the defined and non-empty filter values.
 */
export function cleanFilters(filters: Record<string, any>): Record<string, any> {
  const cleaned: { [key: string]: any } = {};
  for (const key in filters) {
    const value = (filters as any)[key];
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
}
