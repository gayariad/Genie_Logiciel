export default defineEventHandler(async (event) => {
  const filmId = getRouterParam(event, 'filmId')
  if (!filmId || !/^\d+$/.test(filmId)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de film invalide' })
  }

  const db = useDB()

  const [rows] = await db.execute(
    `SELECT a.IDAvis, a.Note, a.Commentaire, a.DateAvis, a.IDUtilisateur, u.Pseudo
     FROM Avis a
     JOIN Utilisateur u ON a.IDUtilisateur = u.IDUtilisateur
     WHERE a.IDFilm = ?
     ORDER BY a.DateAvis DESC`,
    [filmId]
  )

  return rows
})
