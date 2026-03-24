export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'TMDB token manquant côté serveur' })
  }

  const query = getQuery(event)
  const minRating = parseFloat(String(query.min_rating)) || 8
  const pages = Math.min(Math.max(parseInt(String(query.pages)) || 3, 1), 5)

  // Récupérer les films bien notés (8+ par défaut)
  const allMovies: any[] = []
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
    allMovies.push(...(response.results || []))
  }

  // Récupérer les détails avec credits pour chaque film
  const genreCounts: Record<string, number> = {}

  await Promise.all(
    allMovies.slice(0, 40).map(async (m: any) => {
      try {
        const detail: any = await $fetch(`https://api.themoviedb.org/3/movie/${m.id}`, {
          params: { language: 'fr-FR', append_to_response: 'credits' },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })

        const directors = (detail.credits?.crew || []).filter((c: any) => c.job === 'Director')
        if (directors.length > 0 && detail.genres) {
          for (const genre of detail.genres) {
            genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1
          }
        }
      } catch {
        // skip
      }
    })
  )

  return Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
})
