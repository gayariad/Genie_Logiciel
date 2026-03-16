export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const db = useDB()

  const [countRows] = await db.execute(
    'SELECT COUNT(*) AS total FROM Watchlist WHERE IDUtilisateur = ?',
    [session.user.id]
  )
  const [filmRows] = await db.execute(
    'SELECT IDFilm FROM Watchlist WHERE IDUtilisateur = ? ORDER BY IDFilm DESC LIMIT 40',
    [session.user.id]
  )

  const count = Number((countRows as any[])[0]?.total ?? 0)
  const filmIds = (filmRows as any[]).map(row => Number(row.IDFilm))

  return { count, filmIds }
})
