export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  if (!token) throw createError({ statusCode: 500, statusMessage: 'TMDB token manquant' })

  const query = getQuery(event)
  const type  = String(query.type  || 'person').trim()
  const q     = String(query.q     || '').trim()

  if (!q || q.length < 2) return []

  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }

  if (type === 'genre') {
    const res: any = await $fetch('https://api.themoviedb.org/3/genre/movie/list', {
      headers,
      params: { language: 'fr-FR' },
    })
    const genres: { id: number; name: string }[] = res.genres || []
    return genres
      .filter((g) => g.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 8)
      .map((g) => ({ id: g.id, name: g.name, profile_path: null, known_for: null }))
  }

  if (type === 'movie') {
    const res: any = await $fetch('https://api.themoviedb.org/3/search/movie', {
      headers,
      params: { query: q, language: 'fr-FR', page: 1 },
    })
    const results: any[] = res.results || []
    return results.slice(0, 6).map((m: any) => ({
      id: m.id,
      name: m.title,
      profile_path: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : null,
      known_for: m.release_date ? m.release_date.slice(0, 4) : null,
    }))
  }

  if (type === 'studio') {
    const res: any = await $fetch('https://api.themoviedb.org/3/search/company', {
      headers,
      params: { query: q, page: 1 },
    })
    const raw: any[] = res.results || []

    // Sort: exact match first, then by name length (shorter = main brand)
    const sorted = [...raw].sort((a, b) => {
      const aq = q.toLowerCase()
      const aExact = a.name.toLowerCase() === aq ? 0 : 1
      const bExact = b.name.toLowerCase() === aq ? 0 : 1
      if (aExact !== bExact) return aExact - bExact
      return a.name.length - b.name.length
    })

    const candidates = sorted.slice(0, 10)

    // Fetch movie count for each company in parallel to rank by size
    const withCounts = await Promise.all(
      candidates.map(async (c: any) => {
        try {
          const disc: any = await $fetch('https://api.themoviedb.org/3/discover/movie', {
            headers,
            params: { with_companies: c.id, sort_by: 'popularity.desc', page: 1 },
          })
          return { ...c, movieCount: (disc.total_results as number) || 0 }
        } catch {
          return { ...c, movieCount: 0 }
        }
      }),
    )

    // Re-sort: exact match stays first, rest by movie count
    withCounts.sort((a, b) => {
      const aq = q.toLowerCase()
      const aExact = a.name.toLowerCase() === aq ? 0 : 1
      const bExact = b.name.toLowerCase() === aq ? 0 : 1
      if (aExact !== bExact) return aExact - bExact
      return b.movieCount - a.movieCount
    })

    return withCounts.slice(0, 7).map((c: any) => ({
      id: c.id,
      name: c.name,
      profile_path: c.logo_path ? `https://image.tmdb.org/t/p/w92${c.logo_path}` : null,
      known_for: c.movieCount > 0
        ? `${c.movieCount} film${c.movieCount > 1 ? 's' : ''}${c.origin_country ? ` · ${c.origin_country}` : ''}`
        : (c.origin_country || null),
    }))
  }

  // type === 'person' (default)
  const res: any = await $fetch('https://api.themoviedb.org/3/search/person', {
    headers,
    params: { query: q, language: 'fr-FR', page: 1 },
  })

  const results: any[] = res.results || []
  return results.slice(0, 6).map((p: any) => ({
    id: p.id,
    name: p.name,
    profile_path: p.profile_path
      ? `https://image.tmdb.org/t/p/w185${p.profile_path}`
      : null,
    known_for: p.known_for_department || null,
  }))
})
