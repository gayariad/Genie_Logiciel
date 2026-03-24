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

  // Récupérer les films bien notés
  const genreCounts: Record<string, number> = {}

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

    // On a besoin des noms de genres, pas juste des IDs
    for (const movie of response.results || []) {
      // genre_ids sont des IDs, on doit les résoudre
      // On va fetch les détails pour avoir les noms
      try {
        const detail: any = await $fetch(`https://api.themoviedb.org/3/movie/${movie.id}`, {
          params: { language: 'fr-FR' },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
        for (const genre of detail.genres || []) {
          genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1
        }
      } catch {
        // skip
      }
    }
  }

  return Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
})
