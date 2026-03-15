// Récupère la liste des genres de films pour les afficher dans les filtres
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const apiKey = config.TMDB_API_KEY || '518694f92e91fa40e700e880576f3170' // fallback
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: "TMDB API key manquante côté serveur" })
  }

  const data = await $fetch(`https://api.themoviedb.org/3/genre/movie/list`, {
    params: { 
      api_key: apiKey,
      language: 'fr-FR' 
    }
  })

  return data
})