export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'TMDB token manquant côté serveur' })
  }

  const query = getQuery(event)
  const year = parseInt(String(query.year)) || 2025
  const limit = Math.min(Math.max(parseInt(String(query.limit)) || 5, 1), 20)
  const pages = Math.min(Math.max(parseInt(String(query.pages)) || 3, 1), 5)

  const countryRevenue: Record<string, number> = {}

  for (let page = 1; page <= pages; page++) {
    const response: any = await $fetch('https://api.themoviedb.org/3/discover/movie', {
      params: {
        language: 'fr-FR',
        sort_by: 'revenue.desc',
        primary_release_year: year,
        'vote_count.gte': 50,
        page,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    for (const movie of response.results || []) {
      try {
        const detail: any = await $fetch(`https://api.themoviedb.org/3/movie/${movie.id}`, {
          params: { language: 'fr-FR' },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
        if (detail.revenue > 0) {
          for (const country of detail.production_countries || []) {
            countryRevenue[country.name] = (countryRevenue[country.name] || 0) + detail.revenue
          }
        }
      } catch {
        // skip
      }
    }
  }

  return Object.entries(countryRevenue)
    .map(([country, revenue]) => ({ country, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
})
