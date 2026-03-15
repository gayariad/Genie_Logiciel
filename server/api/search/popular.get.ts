// Sans recherche ça affiche par défaut des films tendance
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const apiKey = config.TMDB_API_KEY || '518694f92e91fa40e700e880576f3170' // fallback
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: "TMDB API key manquante côté serveur" })
  }

  const page = getQuery(event).page || 1

  const data = await $fetch(`https://api.themoviedb.org/3/movie/popular`, {
    params: { 
      api_key: apiKey,
      language: 'fr-FR',
      page: page
    }
  })

  return data
})