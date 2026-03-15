// Recherche de films par mot-clé quand l'utilisateur tape dans la barre de recherche
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const apiKey = config.TMDB_API_KEY || '518694f92e91fa40e700e880576f3170' // fallback
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: "TMDB API key manquante côté serveur" })
  }

  const query = getQuery(event).query as string
  const page = getQuery(event).page || 1
  if (!query || query.trim().length < 1) {
    return { results: [] }
  }

  const data = await $fetch(`https://api.themoviedb.org/3/search/movie`, {
    params: {
      api_key: apiKey,
      query: query.trim(),
      language: 'fr-FR',
      page: page
    }
  })

  return data
})