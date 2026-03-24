export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'TMDB token manquant côté serveur' })
  }

  const query = getQuery(event)
  const minRating = parseFloat(String(query.min_rating)) || 8
  const limit = Math.min(Math.max(parseInt(String(query.limit)) || 5, 1), 20)
  const pages = Math.min(Math.max(parseInt(String(query.pages)) || 3, 1), 5)

  const countryCounts: Record<string, number> = {}

  for (let page = 1; page <= pages; page++) {
    const response: any = await $fetch('https://api.themoviedb.org/3/discover/movie', {
      params: {
        language: 'fr-FR',
        sort_by: 'vote_average.desc',
        'vote_average.gte': minRating,
        'vote_count.gte': 200,
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
        for (const country of detail.production_countries || []) {
          countryCounts[country.name] = (countryCounts[country.name] || 0) + 1
        }
      } catch {
        // skip
      }
    }
  }

  return Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
})
