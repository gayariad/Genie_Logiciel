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

  // Vérifier si déjà dans les favoris
  const [existing] = await db.execute(
    'SELECT * FROM Favoris WHERE IDUtilisateur = ? AND IDFilm = ?',
    [userId, filmId]
  )

  if ((existing as any[]).length > 0) {
    return { success: true, message: 'Déjà dans les favoris' }
  }

  // Ajouter aux favoris
  await db.execute(
    'INSERT INTO Favoris (IDUtilisateur, IDFilm) VALUES (?, ?)',
    [userId, filmId]
  )

  return { success: true, message: 'Ajouté aux favoris' }
})
