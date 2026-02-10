export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const token = config.TMDB_API_READ_TOKEN
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: "TMDB token manquant côté serveur" })
  }

  const timeWindow = getQuery(event).time_window === "week" ? "week" : "day"

  const data = await $fetch(`https://api.themoviedb.org/3/trending/movie/${timeWindow}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  })

  return data
})