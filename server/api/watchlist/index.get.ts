export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  const db = useDB()

  const [rows] = await db.execute(
    'SELECT IDFilm FROM Watchlist WHERE IDUtilisateur = ? ORDER BY IDFilm DESC LIMIT 40',
    [session.user.id]
  )

  const filmIds = (rows as any[]).map(row => Number(row.IDFilm))
  if (filmIds.length === 0) return []

  const movies = await Promise.all(
    filmIds.map(async (id) => {
      try {
        return await $fetch(`https://api.themoviedb.org/3/movie/${id}`, {
          params: { language: 'fr-FR' },
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
      } catch {
        return null
      }
    })
  )

  return movies.filter(Boolean)
})
