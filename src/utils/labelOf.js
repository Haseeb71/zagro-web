/** Resolve populated refs or plain strings for display */
export function labelOf(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'object') return value.name || value.title || value.slug || '';
  return String(value);
}
