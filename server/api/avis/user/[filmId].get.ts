export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const filmId = getRouterParam(event, 'filmId')
  if (!filmId || !/^\d+$/.test(filmId)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de film invalide' })
  }

  const db = useDB()

  const [rows] = await db.execute(
    'SELECT IDAvis, Note, Commentaire, DateAvis FROM Avis WHERE IDUtilisateur = ? AND IDFilm = ?',
    [session.user.id, filmId]
  )

  const avis = (rows as any[])[0] || null
  return avis
})
