export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'TMDB token manquant côté serveur' })
  }

  const id = getRouterParam(event, 'id')
  if (!id || !/^\d+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de film invalide' })
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }

  const [recommendations, similar] = await Promise.all([
    $fetch<{ results?: any[] }>(`https://api.themoviedb.org/3/movie/${id}/recommendations`, {
      params: { language: 'fr-FR', page: 1 },
      headers,
    }),
    $fetch<{ results?: any[] }>(`https://api.themoviedb.org/3/movie/${id}/similar`, {
      params: { language: 'fr-FR', page: 1 },
      headers,
    }),
  ])

  const seen = new Set<number>([Number(id)])
  const merged: any[] = []

  for (const source of [recommendations?.results ?? [], similar?.results ?? []]) {
    for (const item of source) {
      const movieId = Number(item?.id)
      if (!Number.isInteger(movieId) || seen.has(movieId)) continue
      seen.add(movieId)
      merged.push(item)
      if (merged.length >= 24) break
    }
    if (merged.length >= 24) break
  }

  return { results: merged }
})
