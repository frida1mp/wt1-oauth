/**
 * Paginera en lista
 *
 * @param {Array} items - Alla objekt
 * @param {number} page - Aktuell sida (börjar från 1)
 * @param {number} perPage - Antal per sida
 * @returns {{ totalPages: number, currentPage: number, data: Array }}
 */
export function paginate (items, page = 1, perPage = 5) {
  const totalPages = Math.ceil(items.length / perPage)
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const startIndex = (currentPage - 1) * perPage
  const data = items.slice(startIndex, startIndex + perPage)

  return {
    currentPage,
    totalPages,
    data
  }
}
