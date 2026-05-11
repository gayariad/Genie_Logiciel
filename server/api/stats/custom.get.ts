export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  if (!token) throw createError({ statusCode: 500, statusMessage: 'TMDB token manquant' })

  const query = getQuery(event)
  const type = String(query.type || '').trim()
  const param = String(query.param || '').trim()
  const limit = Math.min(Math.max(parseInt(String(query.limit)) || 10, 1), 20)

  if (!type) throw createError({ statusCode: 400, statusMessage: 'type requis' })
  if (!param) throw createError({ statusCode: 400, statusMessage: 'param requis' })

  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }

  const tmdb = (path: string, params: Record<string, unknown> = {}): Promise<Record<string, any>> =>
    $fetch<Record<string, any>>(`https://api.themoviedb.org/3${path}`, {
      headers,
      params: { language: 'fr-FR', ...params },
    })

  async function searchPerson(name: string): Promise<number | undefined> {
    const res = await tmdb('/search/person', { query: name })
    return res.results?.[0]?.id
  }

  switch (type) {
    // ─── Films les mieux notés d'un acteur ───
    case 'actor_films': {
      const personId = await searchPerson(param)
      if (!personId) return { labels: [], values: [], error: 'Acteur introuvable' }
      const res = await tmdb('/discover/movie', {
        with_cast: personId,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 50,
        page: 1,
      })
      const movies = (res.results || []).slice(0, limit)
      return {
        labels: movies.map((m: any) => m.title),
        values: movies.map((m: any) => Math.round(m.vote_average * 10) / 10),
      }
    }

    // ─── Filmographie d'un réalisateur (notes) ───
    case 'director_films': {
      const personId = await searchPerson(param)
      if (!personId) return { labels: [], values: [], error: 'Réalisateur introuvable' }
      const res = await tmdb(`/person/${personId}/movie_credits`)
      const directed = (res.crew || [])
        .filter((m: any) => m.job === 'Director' && m.vote_average > 0 && m.vote_count >= 10)
        .sort((a: any, b: any) => b.vote_average - a.vote_average)
        .slice(0, limit)
      return {
        labels: directed.map((m: any) => m.title),
        values: directed.map((m: any) => Math.round(m.vote_average * 10) / 10),
      }
    }

    // ─── Recettes des films d'un acteur ───
    case 'actor_revenue': {
      const personId = await searchPerson(param)
      if (!personId) return { labels: [], values: [], isMoney: true, error: 'Acteur introuvable' }
      const res = await tmdb('/discover/movie', {
        with_cast: personId,
        sort_by: 'revenue.desc',
        'vote_count.gte': 30,
        page: 1,
      })
      const movies = (res.results || []).slice(0, limit + 5)
      const details = await Promise.all(
        movies.map(async (m: any) => {
          try {
            const d = await tmdb(`/movie/${m.id}`)
            return { title: d.title as string, revenue: (d.revenue as number) || 0 }
          } catch {
            return { title: m.title as string, revenue: 0 }
          }
        }),
      )
      const filtered = details.filter((d) => d.revenue > 0).slice(0, limit)
      return {
        labels: filtered.map((d) => d.title),
        values: filtered.map((d) => d.revenue),
        isMoney: true,
      }
    }

    // ─── Top films d'une année (recettes) ───
    case 'top_by_year': {
      const year = parseInt(param)
      if (!year || year < 1900 || year > 2100)
        return { labels: [], values: [], isMoney: true, error: 'Année invalide (ex : 2023)' }
      const res = await tmdb('/discover/movie', {
        primary_release_year: year,
        sort_by: 'revenue.desc',
        'vote_count.gte': 30,
        page: 1,
      })
      const movies = (res.results || []).slice(0, limit + 5)
      const details = await Promise.all(
        movies.map(async (m: any) => {
          try {
            const d = await tmdb(`/movie/${m.id}`)
            return { title: d.title as string, revenue: (d.revenue as number) || 0 }
          } catch {
            return { title: m.title as string, revenue: 0 }
          }
        }),
      )
      const filtered = details.filter((d) => d.revenue > 0).slice(0, limit)
      return {
        labels: filtered.map((d) => d.title),
        values: filtered.map((d) => d.revenue),
        isMoney: true,
      }
    }

    // ─── Évolution des notes d'un genre sur 10 ans ───
    case 'genre_evolution': {
      const genresList = await tmdb('/genre/movie/list')
      const genres: any[] = genresList.genres || []
      const genreObj = genres.find((g) => g.name.toLowerCase().includes(param.toLowerCase()))
      if (!genreObj) return { labels: [], values: [], error: 'Genre introuvable (ex : Action, Drame, Horreur…)' }
      const currentYear = new Date().getFullYear()
      const years = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i)
      const results = await Promise.all(
        years.map(async (year) => {
          try {
            const res = await tmdb('/discover/movie', {
              with_genres: genreObj.id,
              primary_release_year: year,
              sort_by: 'vote_average.desc',
              'vote_count.gte': 50,
              page: 1,
            })
            const movies = (res.results || []).slice(0, 20)
            if (!movies.length) return { year, avg: 0 }
            const avg = movies.reduce((s: number, m: any) => s + m.vote_average, 0) / movies.length
            return { year, avg: Math.round(avg * 100) / 100 }
          } catch {
            return { year, avg: 0 }
          }
        }),
      )
      return {
        labels: results.map((r) => String(r.year)),
        values: results.map((r) => r.avg),
      }
    }

    // ─── Recettes des films d'un réalisateur ───
    case 'director_revenue': {
      const personId = await searchPerson(param)
      if (!personId) return { labels: [], values: [], isMoney: true, error: 'Réalisateur introuvable' }
      const res = await tmdb(`/person/${personId}/movie_credits`)
      const directed = (res.crew || [])
        .filter((m: any) => m.job === 'Director' && m.vote_count >= 10)
        .slice(0, limit + 10)
      const details = await Promise.all(
        directed.map(async (m: any) => {
          try {
            const d = await tmdb(`/movie/${m.id}`)
            return { title: d.title as string, revenue: (d.revenue as number) || 0 }
          } catch {
            return { title: m.title as string, revenue: 0 }
          }
        }),
      )
      const filtered = details
        .filter((d) => d.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)
      return {
        labels: filtered.map((d) => d.title),
        values: filtered.map((d) => d.revenue),
        isMoney: true,
      }
    }

    // ─── Films les plus populaires d'un studio ───
    case 'studio_topfilms': {
      const searchRes = await tmdb('/search/company', { query: param })
      const company = searchRes.results?.[0]
      if (!company) return { labels: [], values: [], error: 'Studio introuvable' }
      const res = await tmdb('/discover/movie', {
        with_companies: company.id,
        sort_by: 'popularity.desc',
        'vote_count.gte': 50,
        page: 1,
      })
      const movies = (res.results || []).slice(0, limit)
      return {
        labels: movies.map((m: any) => m.title),
        values: movies.map((m: any) => Math.round(m.popularity * 10) / 10),
      }
    }

    default:
      throw createError({ statusCode: 400, statusMessage: 'Type de requête inconnu' })
  }
})
