<script setup lang="ts">
const { loggedIn, user, clear: logout } = useUserSession()

// Rediriger si non connecté
if (!loggedIn.value) {
  navigateTo('/login')
}

// Charger les avis de l'utilisateur
const { data: userAvis, refresh: refreshAvis } = await useFetch('/api/user/avis', {
  default: () => [],
})

async function handleLogout() {
  await logout()
  navigateTo('/login')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const hideHeader = useState<boolean>('layout-hide-header', () => false)
onMounted(() => { hideHeader.value = true })
onUnmounted(() => { hideHeader.value = false })
</script>

<template>
  <div class="min-h-screen py-12 px-4">
    <div class="max-w-2xl mx-auto space-y-8">

      <!-- En-tête profil -->
      <div class="glass glass-panel glass-red p-8 text-center">
        <div class="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-3xl font-extrabold text-white tracking-wide">{{ user?.pseudo }}</h1>
        <p class="text-white/40 text-sm mt-1">{{ user?.email }}</p>

        <button
          @click="handleLogout"
          class="mt-6 glass glass-btn glass-red text-white text-sm"
        >
          Se déconnecter
        </button>
      </div>

      <!-- Mes avis -->
      <div class="glass glass-panel glass-red p-6">
        <h2 class="text-lg font-bold text-white mb-5 uppercase tracking-wider">Mes avis</h2>

        <div v-if="(userAvis as any[])?.length === 0" class="text-white/25 text-sm italic text-center py-4">
          Vous n'avez pas encore donné d'avis.
        </div>

          <div v-else class="space-y-4">
            <NuxtLink
              v-for="avis in (userAvis as any[])"
              :key="avis.IDAvis"
              :to="`/movie/${avis.IDFilm}`"
              class="flex gap-4 border border-white/8 rounded-xl p-4 hover:bg-white/5 transition-colors"
            >
              <!-- Affiche -->
              <div class="shrink-0 w-16">
                <img
                  v-if="avis.poster"
                  :src="avis.poster"
                  :alt="avis.titre ?? 'Affiche'"
                  class="w-16 rounded-lg object-cover border border-white/10 shadow-lg"
                  style="aspect-ratio:2/3"
                />
                <div v-else class="w-16 rounded-lg bg-white/8 flex items-center justify-center" style="aspect-ratio:2/3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
              </div>

              <!-- Contenu -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-1.5">
                  <span class="text-white/80 font-semibold text-sm leading-tight truncate">
                    {{ avis.titre ?? `Film #${avis.IDFilm}` }}
                  </span>
                  <span class="text-white/25 text-xs shrink-0">{{ formatDate(avis.DateAvis) }}</span>
                </div>

                <!-- Étoiles -->
                <div class="flex items-center gap-1 mb-2">
                  <template v-for="i in 5" :key="i">
                    <svg
                      v-if="parseFloat(avis.Note) >= i"
                      xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"
                    ><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg
                      v-else-if="parseFloat(avis.Note) >= i - 0.5"
                      xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-yellow-400" viewBox="0 0 24 24"
                    ><defs><linearGradient :id="`p-${avis.IDAvis}-${i}`"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path :fill="`url(#p-${avis.IDAvis}-${i})`" stroke="currentColor" stroke-width="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white/15" viewBox="0 0 24 24" fill="currentColor"
                    ><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </template>
                  <span class="text-white/40 text-xs ml-1">{{ avis.Note }}/5</span>
                </div>

                <p v-if="avis.Commentaire" class="text-white/55 text-sm leading-relaxed line-clamp-2">{{ avis.Commentaire }}</p>
                <p v-else class="text-white/20 text-xs italic">Pas de commentaire</p>
              </div>
            </NuxtLink>
          </div>
      </div>

      <div class="text-center">
        <NuxtLink to="/dashboard" class="text-white/20 hover:text-white/50 text-xs transition-colors">← Retour au dashboard</NuxtLink>
      </div>
    </div>
  </div>
</template>
