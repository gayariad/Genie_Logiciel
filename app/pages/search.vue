<template>
  <div class="min-h-full text-white">
    <!-- Barre Spotlight flottante -->
    <div class="sticky top-6 z-10 px-8">
      <div class="max-w-2xl mx-auto flex flex-col gap-2">

        <!-- Pill principale — même style que la sidebar -->
        <div
          class="flex items-center gap-3 px-5 py-3.5 rounded-full"
          style="background: rgba(30,5,5,0.45); border: 1px solid rgba(255,255,255,0.2); -webkit-backdrop-filter: blur(20px) saturate(1.6); backdrop-filter: blur(20px) saturate(1.6); box-shadow: inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(255,255,255,0.05), 0 12px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08);"
        >
          <!-- Icône loupe -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <!-- Input transparent dans la pill -->
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher des films..."
            class="flex-1 bg-transparent border-none outline-none text-white text-base font-light placeholder-white/40 focus:outline-none"
          >

          <!-- Séparateur vertical -->
          <div class="w-px h-5 bg-white/20 shrink-0" />

          <!-- Bouton Filtres inline -->
          <div class="relative shrink-0">
            <button
              @click="showFilters = !showFilters"
              class="filter-button flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filtres</span>
              <svg xmlns="http://www.w3.org/2000/svg" :class="['w-3.5 h-3.5 transition-transform', showFilters ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <div v-if="hasActiveFilters" class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <!-- Déroulant des filtres -->
            <div
              v-if="showFilters"
              class="filter-dropdown absolute top-full mt-3 right-0 z-20 w-80 rounded-2xl p-4"
              style="background: rgba(20,3,3,0.8); border: 1px solid rgba(255,255,255,0.14); -webkit-backdrop-filter: blur(40px) saturate(1.8); backdrop-filter: blur(40px) saturate(1.8); box-shadow: inset 0 1px 1px rgba(255,255,255,0.12), 0 24px 64px rgba(0,0,0,0.5);"
            >
              <div class="space-y-4">
                <!-- Genres -->
                <div>
                  <label class="block text-sm text-white/80 mb-2">Genre</label>
                  <select
                    v-model="selectedGenres"
                    class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
                  >
                    <option value="">Tous les genres</option>
                    <option v-for="genre in genres" :key="genre.id" :value="genre.id.toString()" class="text-black bg-white">
                      {{ genre.name }}
                    </option>
                  </select>
                </div>

                <!-- Années -->
                <div>
                  <label class="block text-sm text-white/80 mb-2">Année</label>
                  <select
                    v-model="selectedYear"
                    class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
                  >
                    <option value="" class="text-black bg-white">Toutes</option>
                    <option v-for="year in years" :key="year" :value="year" class="text-black bg-white">{{ year }}</option>
                  </select>
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm text-white/80 mb-2">Note minimum: {{ minRating }}/10</label>
                  <input
                    v-model.number="minRating"
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    class="w-full"
                  >
                </div>

                <!-- Bouton "Appliquer les filtres" -->
                <button
                  @click="applyFilters"
                  :disabled="!canApplyFilters"
                  class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full transition-colors font-medium"
                >
                  Appliquer les filtres
                </button>

                <!-- Bouton "Annuler les filtres" -->
                <button
                  @click="cancelFilters"
                  class="w-full px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-full transition-colors font-medium"
                >
                  Annuler les filtres
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Compteur de résultats sous la pill -->
        <p class="text-center text-xs text-white/40">
          {{ displayCount }} résultat{{ displayCount !== 1 ? 's' : '' }}
        </p>

      </div>
    </div>

    <div class="max-w-7xl mx-auto px-8 pt-8 pb-8">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>

      <div v-else-if="results.length === 0 && searchQuery" class="text-center py-12">
        <p class="text-white/60">Aucun film trouvé pour "{{ searchQuery }}"</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <NuxtLink
          v-for="movie in filteredResults"
          :key="movie.id"
          :to="`/movie/${movie.id}`"
          class="group cursor-pointer"
        >
          <div class="aspect-[2/3] rounded-lg overflow-hidden bg-white/10 mb-3">
            <img
              v-if="movie.poster_path"
              :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
              :alt="movie.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            >
            <div v-else class="w-full h-full flex items-center justify-center text-white/40">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
          <h3 class="font-medium text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
            {{ movie.title }}
          </h3>
          <p class="text-xs text-white/60 mt-1">
            {{ movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A' }}
          </p>
          <div class="flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span class="text-xs text-white/60">{{ movie.vote_average?.toFixed(1) || 'N/A' }}</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center items-center gap-4 mt-8">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
        >
          Précédent
        </button>
        <span class="text-white/80">
          Page {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
        >
          Suivant
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const genres = ref<any[]>([])
const selectedGenres = ref<string>('')
const selectedYear = ref('')
const minRating = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const totalResults = ref(0)
const currentMode = ref<'popular' | 'search' | 'discover'>('popular')
const currentQuery = ref('')
const showFilters = ref(false)
const filtersApplied = ref(false)

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 50 }, (_, i) => currentYear - i)
})

const hasActiveFilters = computed(() => 
  selectedGenres.value || selectedYear.value || minRating.value > 0
)

const filteredResults = computed(() => {
  if (currentMode.value === 'search' && filtersApplied.value && hasActiveFilters.value) {
  // Applique les filtres uniquement aux résultats lorsque des filtres sont appliqués
    return results.value.filter(movie => {
      // Filtrer par genre
      if (selectedGenres.value) {
        const movieGenres = movie.genre_ids || []
        if (!movieGenres.includes(parseInt(selectedGenres.value))) {
          return false
        }
      }

      // Filtrer par année
      if (selectedYear.value) {
        const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : ''
        if (movieYear !== selectedYear.value) {
          return false
        }
      }

      // Filtrer par note
      if (minRating.value > 0) {
        if (!movie.vote_average || movie.vote_average < minRating.value) {
          return false
        }
      }

      return true
    })
  }
  return results.value
})

const displayCount = computed(() => {
  if (currentMode.value === 'search' && filtersApplied.value && hasActiveFilters.value) {
    return filteredResults.value.length
  }
  return totalResults.value
})

const canApplyFilters = computed(() => hasActiveFilters.value)

// Fonction Appliquer des filtres
const applyFilters = () => {
  showFilters.value = false
  filtersApplied.value = true
  
  const query = searchQuery.value.trim()
  if (query.length >= 1) {
    currentMode.value = 'search'
    currentQuery.value = query
    currentPage.value = 1
    loadResults()
  } else {
    // Si pas de recherche, on bascule entre popular et discover selon les filtres
    if (hasActiveFilters.value) {
      currentMode.value = 'discover'
    } else {
      currentMode.value = 'popular'
    }
    currentPage.value = 1
    loadResults()
  }
}

const cancelFilters = () => {
  showFilters.value = false
  selectedGenres.value = ''
  selectedYear.value = ''
  minRating.value = 0
  filtersApplied.value = false
  
  const query = searchQuery.value.trim()
  if (query.length >= 1) {
    currentMode.value = 'search'
    currentQuery.value = query
  } else {
    currentMode.value = 'popular'
  }
  currentPage.value = 1
  loadResults()
}

const loadResults = async () => {
  loading.value = true
  try {
    let response
    const params: any = { page: currentPage.value }

    switch (currentMode.value) {
      case 'search':
        params.query = currentQuery.value
        response = await $fetch('/api/search/search', { params })
        break
      case 'discover':
        if (selectedGenres.value) params.genres = selectedGenres.value
        params.year = selectedYear.value
        params.min_rating = minRating.value
        response = await $fetch('/api/search/discover', { params })
        break
      case 'popular':
      default:
        response = await $fetch('/api/search/popular', { params })
        break
    }

    results.value = response.results || []
    totalResults.value = response.total_results || 0
    totalPages.value = response.total_pages || 1

    // Si on filtre côté client en mode recherche, on ne peut pas paginer correctement
    if (currentMode.value === 'search' && filtersApplied.value && hasActiveFilters.value) {
      totalPages.value = 1
    }
  } catch (error) {
    console.error('Load error:', error)
    results.value = []
    totalResults.value = 0
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

let searchTimeout: NodeJS.Timeout | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    const query = searchQuery.value.trim()
    if (query.length >= 1) {
      currentMode.value = 'search'
      currentQuery.value = query
      currentPage.value = 1
      filtersApplied.value = false // Désactiver les filtres appliqués quand on tape du texte
      await loadResults()
    } else {
      // Quand on efface la recherche, on revient au mode précédent
      if (filtersApplied.value && hasActiveFilters.value) {
        currentMode.value = 'discover'
      } else {
        currentMode.value = 'popular'
        filtersApplied.value = false // Réinitialise les filtres appliqués si on revient à popular sans recherche
      }
      currentPage.value = 1
      await loadResults()
    }
  }, 300)
}

// Chargement
onMounted(async () => {
  const route = useRoute()
  const genreParam = route.query.genres as string | undefined
  if (genreParam) {
    selectedGenres.value = genreParam
    currentMode.value = 'discover'
    filtersApplied.value = true
  }

  await Promise.all([loadGenres(), loadResults()])
  
  // Ferme le menu déroulant des filtres lorsqu'on clique en dehors
  const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.filter-dropdown') && !target.closest('.filter-button')) {
      showFilters.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})


// Chargement des genres depuis l'API
const loadGenres = async () => {
  try {
    const response = await $fetch('/api/search/genres')
    genres.value = response.genres || []
  } catch (error) {
    console.error('Genres load error:', error)
  }
}

// Fonction de pagination
const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await loadResults()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>