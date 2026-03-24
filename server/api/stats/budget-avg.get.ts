export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'TMDB token manquant côté serveur' })
  }

  const query = getQuery(event)
  const limit = Math.min(Math.max(parseInt(String(query.limit)) || 5, 1), 20)
  const mode = String(query.mode || 'genre') // 'genre' ou 'director'
  const pages = Math.min(Math.max(parseInt(String(query.pages)) || 3, 1), 5)

  const buckets: Record<string, { total: number; count: number }> = {}

  for (let page = 1; page <= pages; page++) {
    const response: any = await $fetch('https://api.themoviedb.org/3/discover/movie', {
      params: {
        language: 'fr-FR',
        sort_by: 'revenue.desc',
        'vote_count.gte': 100,
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

        if (!detail.budget || detail.budget === 0) continue

        if (mode === 'genre') {
          for (const genre of detail.genres || []) {
            if (!buckets[genre.name]) buckets[genre.name] = { total: 0, count: 0 }
            buckets[genre.name].total += detail.budget
            buckets[genre.name].count += 1
          }
        } else {
          const directors = (detail.credits?.crew || []).filter((c: any) => c.job === 'Director')
          for (const dir of directors) {
            if (!buckets[dir.name]) buckets[dir.name] = { total: 0, count: 0 }
            buckets[dir.name].total += detail.budget
            buckets[dir.name].count += 1
          }
        }
      } catch {
        // skip
      }
    }
  }

  return Object.entries(buckets)
    .map(([name, data]) => ({
      name,
      avgBudget: Math.round(data.total / data.count),
      filmCount: data.count,
    }))
    .sort((a, b) => b.avgBudget - a.avgBudget)
    .slice(0, limit)
})
