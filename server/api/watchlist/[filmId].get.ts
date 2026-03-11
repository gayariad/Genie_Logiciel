export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    return { isInWatchlist: false }
  }

  const filmId = getRouterParam(event, 'filmId')
  if (!filmId || !/^\d+$/.test(filmId)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de film invalide' })
  }

  const db = useDB()

  const [rows] = await db.execute(
    'SELECT * FROM Watchlist WHERE IDUtilisateur = ? AND IDFilm = ?',
    [session.user.id, filmId]
  )

  return { isInWatchlist: (rows as any[]).length > 0 }
})
