export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const body = await readBody(event)
  const { filmId } = body

  if (!filmId || !Number.isInteger(filmId)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de film invalide' })
  }

  const db = useDB()
  const userId = session.user.id

  // Retirer des favoris
  await db.execute(
    'DELETE FROM Favoris WHERE IDUtilisateur = ? AND IDFilm = ?',
    [userId, filmId]
  )

  return { success: true, message: 'Retiré des favoris' }
})
