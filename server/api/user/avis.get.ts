export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const db = useDB()

  const [rows] = await db.execute(
    `SELECT a.IDAvis, a.Note, a.Commentaire, a.DateAvis, a.IDFilm
     FROM Avis a
     WHERE a.IDUtilisateur = ?
     ORDER BY a.DateAvis DESC`,
    [session.user.id]
  )

  return rows
})
