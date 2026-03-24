export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'TMDB token manquant côté serveur' })
  }

  const query = getQuery(event)
  const limit = Math.min(Math.max(parseInt(String(query.limit)) || 5, 1), 20)

  // Films populaires avec budget significatif
  const genreBudgets: Record<string, { total: number; count: number }> = {}
  const directorBudgets: Record<string, { total: number; count: number }> = {}

  for (let page = 1; page <= 3; page++) {
    const response: any = await $fetch('https://api.themoviedb.org/3/discover/movie', {
      params: {
        language: 'fr-FR',
        sort_by: 'popularity.desc',
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
          params: { language: 'fr-FR', append_to_response: 'credits' },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })

        if (detail.budget > 0) {
          // Par genre
          for (const genre of detail.genres || []) {
            if (!genreBudgets[genre.name]) genreBudgets[genre.name] = { total: 0, count: 0 }
            genreBudgets[genre.name].total += detail.budget
            genreBudgets[genre.name].count++
          }

          // Par réalisateur
          const directors = (detail.credits?.crew || []).filter((c: any) => c.job === 'Director')
          for (const dir of directors) {
            if (!directorBudgets[dir.name]) directorBudgets[dir.name] = { total: 0, count: 0 }
            directorBudgets[dir.name].total += detail.budget
            directorBudgets[dir.name].count++
          }
        }
      } catch {
        // skip
      }
    }
  }

  const byGenre = Object.entries(genreBudgets)
    .map(([name, data]) => ({ name, average: Math.round(data.total / data.count) }))
    .sort((a, b) => b.average - a.average)
    .slice(0, limit)

  const byDirector = Object.entries(directorBudgets)
    .filter(([, data]) => data.count >= 1)
    .map(([name, data]) => ({ name, average: Math.round(data.total / data.count) }))
    .sort((a, b) => b.average - a.average)
    .slice(0, limit)

  return { byGenre, byDirector }
})
