// Recherche quand on applique des filtres (genre, année, note) sans rechercher dans la barre
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const apiKey = config.TMDB_API_KEY || '518694f92e91fa40e700e880576f3170' // fallback
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: "TMDB API key manquante côté serveur" })
  }

  const query = getQuery(event)
  const page = query.page || 1
  const params: any = {
    api_key: apiKey,
    language: 'fr-FR',
    page: page,
    sort_by: 'popularity.desc'
  }

  if (query.genres) {
    params.with_genres = query.genres
  }
  if (query.year) {
    params.primary_release_year = query.year
  }
  if (query.min_rating) {
    params['vote_average.gte'] = query.min_rating
  }

  const data = await $fetch(`https://api.themoviedb.org/3/discover/movie`, {
    params
  })

  return data
})