export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = config.TMDB_API_READ_TOKEN
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: "TMDB token manquant côté serveur" })
  }

  const id = getRouterParam(event, 'id')
  if (!id || !/^\d+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: "ID de film invalide" })
  }

  const data = await $fetch(`https://api.themoviedb.org/3/movie/${id}`, {
    params: { language: 'fr-FR', append_to_response: 'credits' },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  return data
})
