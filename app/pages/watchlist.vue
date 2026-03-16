<script setup lang="ts">
const { loggedIn } = useUserSession()

if (!loggedIn.value) {
  await navigateTo('/login')
}

const { data: watchlist, pending, error, refresh } = await useFetch('/api/watchlist', {
  default: () => [],
})

function tmdbImg(movie: any) {
  const path = movie?.poster_path || movie?.backdrop_path
  return path
    ? `https://image.tmdb.org/t/p/w500${path}`
    : 'https://placehold.co/500x750?text=No+Image'
}

async function removeFromWatchlist(filmId: number) {
  try {
    await $fetch(`/api/watchlist?filmId=${filmId}`, { method: 'DELETE' })
    await refresh()
  } catch (err) {
    console.error('Erreur lors de la suppression de la watchlist', err)
  }
}
</script>

<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 class="text-4xl font-extrabold text-white tracking-tight uppercase">Ma Watchlist</h1>
          <p class="text-white/40 mt-2">Les films que vous voulez voir plus tard.</p>
        </div>
        <NuxtLink
          to="/dashboard"
          class="text-white/20 hover:text-white/60 text-sm transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour au dashboard
        </NuxtLink>
      </div>

      <div v-if="pending" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-red-500"></div>
      </div>

      <div v-else-if="error" class="glass glass-panel glass-red p-12 text-center rounded-3xl max-w-xl mx-auto">
        <h2 class="text-2xl font-bold text-white mb-3">Impossible de charger votre watchlist</h2>
        <p class="text-white/40 mb-8">
          {{ (error as any)?.statusMessage || 'Une erreur est survenue.' }}
        </p>
        <button @click="refresh()" class="glass glass-btn glass-red text-white px-8">Réessayer</button>
      </div>

      <div
        v-else-if="!watchlist || watchlist.length === 0"
        class="glass glass-panel glass-red p-12 text-center rounded-3xl max-w-xl mx-auto"
      >
        <h2 class="text-2xl font-bold text-white mb-3">Votre watchlist est vide</h2>
        <p class="text-white/40 mb-8">Ajoutez un film depuis sa page pour le retrouver ici.</p>
        <NuxtLink to="/dashboard" class="glass glass-btn glass-red text-white px-8">Explorer les films</NuxtLink>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <div
          v-for="movie in watchlist"
          :key="movie.id"
          class="relative group rounded-2xl overflow-hidden glass glass-panel transition-all duration-300 hover:scale-105 hover:z-10"
        >
          <div class="aspect-[2/3] w-full relative">
            <img :src="tmdbImg(movie)" :alt="movie.title" class="absolute inset-0 w-full h-full object-cover" />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4"
            >
              <h3 class="text-white font-bold text-sm mb-3 line-clamp-2">{{ movie.title }}</h3>

              <div class="flex flex-col gap-2">
                <NuxtLink
                  :to="`/movie/${movie.id}`"
                  class="glass glass-btn text-[10px] py-2 text-center text-white uppercase tracking-wider"
                >
                  Détails
                </NuxtLink>
                <button
                  @click="removeFromWatchlist(movie.id)"
                  class="glass glass-btn glass-red text-[10px] py-2 text-white uppercase tracking-wider bg-red-600/20"
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

