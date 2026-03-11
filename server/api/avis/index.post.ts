export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const body = await readBody(event)
  const { filmId, note, commentaire } = body

  if (!filmId || !note) {
    throw createError({ statusCode: 400, statusMessage: 'Film et note requis' })
  }

  const validNotes = ['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5']
  if (!validNotes.includes(String(note))) {
    throw createError({ statusCode: 400, statusMessage: 'Note invalide (0.5 à 5 par pas de 0.5)' })
  }

  const db = useDB()
  const userId = session.user.id

  // Vérifier si l'utilisateur a déjà un avis pour ce film
  const [existing] = await db.execute(
    'SELECT IDAvis FROM Avis WHERE IDUtilisateur = ? AND IDFilm = ?',
    [userId, filmId]
  )

  if ((existing as any[]).length > 0) {
    // Mettre à jour l'avis existant
    await db.execute(
      'UPDATE Avis SET Note = ?, Commentaire = ?, DateAvis = CURDATE() WHERE IDUtilisateur = ? AND IDFilm = ?',
      [String(note), commentaire || null, userId, filmId]
    )
  } else {
    // Créer un nouvel avis
    await db.execute(
      'INSERT INTO Avis (Note, Commentaire, DateAvis, IDUtilisateur, IDFilm) VALUES (?, ?, CURDATE(), ?, ?)',
      [String(note), commentaire || null, userId, filmId]
    )
  }

  return { success: true }
})
