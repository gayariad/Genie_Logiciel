export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Vous devez être connecté' })
  }

  const db = useDB()
  const config = useRuntimeConfig()

  const [rows] = await db.execute(
    `SELECT a.IDAvis, a.Note, a.Commentaire, a.DateAvis, a.IDFilm
     FROM Avis a
     WHERE a.IDUtilisateur = ?
     ORDER BY a.DateAvis DESC`,
    [session.user.id]
  )

  const avis = rows as { IDAvis: number; Note: string; Commentaire: string | null; DateAvis: string; IDFilm: number }[]

  if (!avis.length) return []

  // Enrichir avec titre + affiche depuis TMDB
  const token = config.TMDB_API_READ_TOKEN
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }

  const enriched = await Promise.all(
    avis.map(async (a) => {
      try {
        const movie = await $fetch<{ title: string; poster_path: string | null }>(
          `https://api.themoviedb.org/3/movie/${a.IDFilm}`,
          { headers, params: { language: 'fr-FR' } }
        )
        return {
          ...a,
          titre: movie.title,
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : null,
        }
      } catch {
        return { ...a, titre: null, poster: null }
      }
    })
  )

  return enriched
})
