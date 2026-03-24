export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'TMDB token manquant côté serveur' })
  }

  const query = getQuery(event)
  const limit = Math.min(Math.max(parseInt(String(query.limit)) || 5, 1), 20)

  // Récupérer les films à plus grosses recettes
  const response: any = await $fetch('https://api.themoviedb.org/3/discover/movie', {
    params: {
      language: 'fr-FR',
      sort_by: 'revenue.desc',
      'vote_count.gte': 100,
      page: 1,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  const movies = response.results || []

  // Pour chaque film, récupérer les détails (budget + revenue)
  const details = await Promise.all(
    movies.slice(0, limit + 5).map(async (m: any) => {
      try {
        const detail: any = await $fetch(`https://api.themoviedb.org/3/movie/${m.id}`, {
          params: { language: 'fr-FR' },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
        return {
          id: detail.id,
          title: detail.title,
          budget: detail.budget || 0,
          revenue: detail.revenue || 0,
          profit: (detail.revenue || 0) - (detail.budget || 0),
          poster_path: detail.poster_path,
        }
      } catch {
        return null
      }
    })
  )

  return details
    .filter((d: any) => d && d.budget > 0 && d.revenue > 0)
    .sort((a: any, b: any) => b.profit - a.profit)
    .slice(0, limit)
})
