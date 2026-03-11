<script setup lang="ts">
import { ref, computed } from 'vue'

interface TMDBGenre { id: number; name: string }
interface TMDBCastMember { id: number; name: string; character: string; profile_path: string | null }
interface TMDBCrewMember { id: number; name: string; job: string; department: string }
interface TMDBCompany { id: number; name: string; logo_path: string | null }
interface TMDBCountry { iso_3166_1: string; name: string }

interface TMDBMovie {
  id: number
  title: string
  original_title: string
  tagline: string
  overview: string
  backdrop_path: string | null
  poster_path: string | null
  release_date: string
  runtime: number | null
  vote_average: number
  vote_count: number
  budget: number
  revenue: number
  original_language: string
  status: string
  genres: TMDBGenre[]
  production_companies: TMDBCompany[]
  production_countries: TMDBCountry[]
  credits: {
    cast: TMDBCastMember[]
    crew: TMDBCrewMember[]
  }
}

const route = useRoute()
const movieId = route.params.id as string

const { data: movie, pending, error } = await useFetch<TMDBMovie>(`/api/tmdb/movie/${movieId}`)

// ── Image helpers ──
function backdropUrl(path: string | null, size = 'original') {
  if (!path) return ''
  return `https://image.tmdb.org/t/p/${size}${path}`
}
function posterUrl(path: string | null, size = 'w500') {
  if (!path) return ''
  return `https://image.tmdb.org/t/p/${size}${path}`
}
function profileUrl(path: string | null) {
  if (!path) return ''
  return `https://image.tmdb.org/t/p/w185${path}`
}

// ── TMDB rating → 5-star scale (half-star) ──
const tmdbStars = computed(() => {
  const vote = movie.value?.vote_average ?? 0
  return Math.round((vote / 2) * 2) / 2
})

function starType(index: number, rating: number): 'full' | 'half' | 'empty' {
  if (rating >= index) return 'full'
  if (rating >= index - 0.5) return 'half'
  return 'empty'
}

// ── User rating (local) ──
const userRating = ref(0)
const hoverRating = ref(0)

const { loggedIn, user } = useUserSession()

function handleStarHover(starIndex: number, event: MouseEvent) {
  if (!loggedIn.value) return
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const isLeftHalf = event.clientX - rect.left < rect.width / 2
  hoverRating.value = isLeftHalf ? starIndex - 0.5 : starIndex
}
function handleStarClick(starIndex: number, event: MouseEvent) {
  if (!loggedIn.value) {
    navigateTo('/login')
    return
  }
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const isLeftHalf = event.clientX - rect.left < rect.width / 2
  userRating.value = isLeftHalf ? starIndex - 0.5 : starIndex
}
const displayRating = computed(() => hoverRating.value || userRating.value)

// ── Avis depuis la BDD ──
interface AvisDB {
  IDAvis: number
  Note: string
  Commentaire: string | null
  DateAvis: string
  IDUtilisateur: number
  Pseudo: string
}

const commentText = ref('')
const submitting = ref(false)

const { data: avisData, refresh: refreshAvis } = await useFetch<AvisDB[]>(`/api/avis/${movieId}`, {
  default: () => [],
})

// ── Favoris et Watchlist ──
const { data: favorisStatus, refresh: refreshFavoris } = await useFetch<{ isFavorite: boolean }>(
  `/api/favoris/${movieId}`,
  { default: () => ({ isFavorite: false }) }
)
const { data: watchlistStatus, refresh: refreshWatchlist } = await useFetch<{ isInWatchlist: boolean }>(
  `/api/watchlist/${movieId}`,
  { default: () => ({ isInWatchlist: false }) }
)

const togglingFavoris = ref(false)
const togglingWatchlist = ref(false)

async function toggleFavoris() {
  if (!loggedIn.value) {
    navigateTo('/login')
    return
  }

  togglingFavoris.value = true
  try {
    if (favorisStatus.value?.isFavorite) {
      await $fetch(`/api/favoris?filmId=${parseInt(movieId)}`, {
        method: 'DELETE',
      })
    } else {
      await $fetch('/api/favoris', {
        method: 'POST',
        body: { filmId: parseInt(movieId) },
      })
    }
    await refreshFavoris()
  } catch (e) {
    console.error('Erreur lors de la gestion des favoris', e)
  } finally {
    togglingFavoris.value = false
  }
}

async function toggleWatchlist() {
  if (!loggedIn.value) {
    navigateTo('/login')
    return
  }

  togglingWatchlist.value = true
  try {
    if (watchlistStatus.value?.isInWatchlist) {
      await $fetch(`/api/watchlist?filmId=${parseInt(movieId)}`, {
        method: 'DELETE',
      })
    } else {
      await $fetch('/api/watchlist', {
        method: 'POST',
        body: { filmId: parseInt(movieId) },
      })
    }
    await refreshWatchlist()
  } catch (e) {
    console.error('Erreur lors de la gestion de la watchlist', e)
  } finally {
    togglingWatchlist.value = false
  }
}

// Charger l'avis existant de l'utilisateur pour ce film
const { data: userAvis, refresh: refreshUserAvis } = await useFetch<{ Note: string; Commentaire: string | null } | null>(
  `/api/avis/user/${movieId}`,
  { default: () => null }
)

// Initialiser la note utilisateur si un avis existe
watch(userAvis, (val) => {
  if (val?.Note) {
    userRating.value = parseFloat(val.Note)
  }
}, { immediate: true })

async function submitAvis() {
  if (!loggedIn.value) {
    navigateTo('/login')
    return
  }
  if (userRating.value === 0) return

  submitting.value = true
  try {
    await $fetch('/api/avis', {
      method: 'POST',
      body: {
        filmId: parseInt(movieId),
        note: userRating.value.toString(),
        commentaire: commentText.value.trim() || null,
      },
    })
    commentText.value = ''
    await refreshAvis()
    await refreshUserAvis()
  } catch (e) {
    console.error('Erreur lors de la soumission de l\'avis', e)
  } finally {
    submitting.value = false
  }
}

function formatAvisDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Expandable details ──
const detailsOpen = ref(false)

// ── Computed data ──
const directors = computed(() =>
  movie.value?.credits?.crew?.filter(c => c.job === 'Director') ?? []
)
const topCast = computed(() =>
  movie.value?.credits?.cast?.slice(0, 8) ?? []
)

function formatRuntime(minutes: number | null) {
  if (!minutes) return ''
  return `${Math.floor(minutes / 60)}h ${minutes % 60}min`
}
function releaseYear(date: string | null) {
  return date ? date.split('-')[0] : ''
}
function formatMoney(amount: number) {
  if (!amount) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}
function langName(code: string) {
  const map: Record<string, string> = { en: 'Anglais', fr: 'Français', es: 'Espagnol', de: 'Allemand', ja: 'Japonais', ko: 'Coréen', zh: 'Chinois', it: 'Italien', pt: 'Portugais', ru: 'Russe', hi: 'Hindi', ar: 'Arabe' }
  return map[code] ?? code.toUpperCase()
}

// ── Hero background sync ──
const heroBgEnabled = useState<boolean>('dashboard-hero-bg-enabled', () => false)
const heroBgImage = useState<string>('dashboard-hero-bg-image', () => '')
const heroBgFrameKey = useState<number>('dashboard-hero-bg-frame-key', () => 0)
const hideHeader = useState<boolean>('layout-hide-header', () => false)
onMounted(() => {
  hideHeader.value = true
  // Désactiver le fond flouté du layout pour éviter le fond gris
  heroBgEnabled.value = false
  heroBgImage.value = ''
})
onUnmounted(() => {
  hideHeader.value = false
  heroBgEnabled.value = false
  heroBgImage.value = ''
})
</script>

<template>
  <div class="min-h-full movie-page-bg">
    <!-- Loading -->
    <div v-if="pending" class="h-full text-white/70 p-8 flex items-center justify-center text-lg">Chargement…</div>

    <!-- Error -->
    <div v-else-if="error" class="h-full text-red-300 p-8 flex items-center justify-center">
      Erreur : {{ error?.message }}
      <NuxtLink to="/dashboard" class="ml-4 underline text-white/70 hover:text-white">Retour</NuxtLink>
    </div>

    <template v-else-if="movie">

      <!-- ═══════════ HERO : BANNIÈRE + POSTER + INFOS ═══════════ -->
      <section class="hero-section banner-fullbleed relative min-h-[90vh] overflow-hidden flex items-end">
        <!-- Image de fond -->
        <img
          :src="backdropUrl(movie.backdrop_path)"
          :alt="movie.title"
          class="absolute inset-0 w-full h-full object-cover object-[center_20%]"
        />

        <!-- Dégradés multiples pour assombrissement progressif -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" style="height:25%" />
        <div class="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
        <div class="absolute bottom-0 left-0 right-0 h-[70%] hero-bottom-gradient" />

        <!-- Bouton retour -->
        <NuxtLink
          to="/dashboard"
          class="absolute top-6 left-8 z-20 glass glass-pill glass-red flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </NuxtLink>

        <!-- Contenu hero : poster + infos, positionné en bas -->
        <div class="relative z-10 flex flex-col lg:flex-row gap-8 items-end pb-12 px-4 w-full">
          <!-- Poster -->
          <div class="shrink-0">
            <img
              :src="posterUrl(movie.poster_path)"
              :alt="movie.title"
              class="w-56 lg:w-72 rounded-2xl shadow-2xl shadow-black/70 border border-white/10"
            />
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0 pb-2">
            <h1 class="text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-wide drop-shadow-lg leading-tight">
              {{ movie.title }}
            </h1>
            <p v-if="movie.tagline" class="mt-2 text-white/40 text-base italic">« {{ movie.tagline }} »</p>

            <!-- Méta -->
            <div class="mt-4 flex flex-wrap items-center gap-3 text-base text-white/55">
              <span v-if="releaseYear(movie.release_date)">{{ releaseYear(movie.release_date) }}</span>
              <span v-if="movie.runtime" class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatRuntime(movie.runtime) }}
              </span>
              <template v-for="genre in movie.genres" :key="genre.id">
                <span class="glass glass-pill px-3 py-0.5 text-xs text-white/65">{{ genre.name }}</span>
              </template>
            </div>

            <!-- Note TMDB étoiles -->
            <div class="mt-4 flex items-center gap-3">
              <div class="flex items-center gap-0.5">
                <template v-for="i in 5" :key="`tmdb-${i}`">
                  <svg v-if="starType(i, tmdbStars) === 'full'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <svg v-else-if="starType(i, tmdbStars) === 'half'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-400" viewBox="0 0 24 24"><defs><linearGradient :id="`ht-${i}`"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path :fill="`url(#ht-${i})`" stroke="currentColor" stroke-width="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </template>
              </div>
              <span class="text-white/45 text-sm">{{ (movie.vote_average ?? 0).toFixed(1) }} / 10 <span class="text-white/25">({{ movie.vote_count }} votes)</span></span>
            </div>

            <!-- Synopsis -->
            <p class="mt-5 text-white/70 leading-relaxed text-base max-w-3xl">
              {{ movie.overview || 'Aucun synopsis disponible.' }}
            </p>

            <!-- Boutons d'action -->
            <div class="mt-7 flex flex-wrap gap-4">
              <button 
                @click="toggleWatchlist"
                :disabled="togglingWatchlist"
                :class="watchlistStatus?.isInWatchlist ? 'glass-active' : ''"
                class="glass glass-btn glass-red text-white flex items-center gap-2 disabled:opacity-50"
              >
                <svg v-if="watchlistStatus?.isInWatchlist" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {{ watchlistStatus?.isInWatchlist ? 'Dans la Watchlist' : 'Ajouter à la Watchlist' }}
              </button>
              <button 
                @click="toggleFavoris"
                :disabled="togglingFavoris"
                :class="favorisStatus?.isFavorite ? 'glass-active' : ''"
                class="glass glass-btn glass-red text-white flex items-center gap-2 disabled:opacity-50"
              >
                <svg v-if="favorisStatus?.isFavorite" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
                {{ favorisStatus?.isFavorite ? 'Dans les Favoris' : 'Ajouter aux Favoris' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════ DEUX COLONNES : COMMENTAIRES | SIDEBAR ═══════════ -->
      <section class="movie-content-area px-4 pt-10 pb-16 flex flex-col lg:flex-row gap-10">

        <!-- ── COLONNE GAUCHE : Commentaires ── -->
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold text-white mb-5 tracking-wide">Commentaires</h2>

          <!-- Formulaire de soumission d'avis -->
          <div v-if="loggedIn" class="flex flex-col gap-3">
            <!-- Rappel de la note sélectionnée -->
            <div v-if="userRating > 0" class="flex items-center gap-2 text-sm text-white/40">
              <span>Votre note :</span>
              <div class="flex items-center gap-0.5">
                <template v-for="i in 5" :key="`inline-${i}`">
                  <svg v-if="starType(i, userRating) === 'full'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <svg v-else-if="starType(i, userRating) === 'half'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-yellow-400" viewBox="0 0 24 24"><defs><linearGradient :id="`il-${i}`"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path :fill="`url(#il-${i})`" stroke="currentColor" stroke-width="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white/15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </template>
              </div>
              <span>{{ userRating }}/5</span>
            </div>
            <div v-else class="text-white/25 text-xs italic">
              Sélectionnez une note dans le panneau « Ma note » avant de publier
            </div>

            <textarea
              v-model="commentText"
              rows="3"
              placeholder="Partagez votre avis sur ce film…"
              class="w-full bg-white/5 border border-white/12 rounded-xl px-5 py-4 text-white placeholder-white/25 text-sm leading-relaxed resize-none focus:outline-none focus:border-white/25 transition-all"
            />
            <button
              @click="submitAvis"
              :disabled="userRating === 0 || submitting"
              class="self-start glass glass-btn glass-red text-white text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Envoi…' : 'Publier mon avis' }}
            </button>
          </div>

          <!-- Message si non connecté -->
          <div v-else class="glass glass-panel glass-red p-4 text-center">
            <p class="text-white/40 text-sm mb-3">Connectez-vous pour donner votre avis</p>
            <NuxtLink to="/login" class="glass glass-btn glass-red text-white text-xs">Se connecter</NuxtLink>
          </div>

          <!-- Liste des avis depuis la BDD -->
          <div class="mt-8 space-y-5">
            <div v-if="(avisData as AvisDB[])?.length === 0" class="text-white/20 text-sm italic">
              Aucun avis pour le moment. Soyez le premier à donner votre avis !
            </div>
            <div
              v-for="avis in (avisData as AvisDB[])"
              :key="avis.IDAvis"
              class="border-l-2 border-white/10 pl-4 py-1"
            >
              <div class="flex items-center gap-3 mb-1">
                <span class="text-white/80 font-semibold text-sm">{{ avis.Pseudo }}</span>
                <div class="flex items-center gap-0.5">
                  <template v-for="i in 5" :key="`av-${avis.IDAvis}-${i}`">
                    <svg v-if="parseFloat(avis.Note) >= i" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg v-else-if="parseFloat(avis.Note) >= i - 0.5" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24"><defs><linearGradient :id="`avh-${avis.IDAvis}-${i}`"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path :fill="`url(#avh-${avis.IDAvis}-${i})`" stroke="currentColor" stroke-width="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-white/15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </template>
                </div>
                <span class="text-white/20 text-xs">{{ formatAvisDate(avis.DateAvis) }}</span>
              </div>
              <p v-if="avis.Commentaire" class="text-white/55 text-sm leading-relaxed">{{ avis.Commentaire }}</p>
              <p v-else class="text-white/20 text-xs italic">Note sans commentaire</p>
            </div>
          </div>
        </div>

        <!-- ── COLONNE DROITE : Sidebar ── -->
        <div class="w-full lg:w-80 shrink-0 flex flex-col gap-5">

          <!-- Box : Ma note -->
          <div class="glass glass-panel glass-red p-5">
            <h3 class="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Ma note</h3>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-0.5" @mouseleave="hoverRating = 0">
                <template v-for="i in 5" :key="`usr-${i}`">
                  <div class="relative w-8 h-8 cursor-pointer" @mousemove="handleStarHover(i, $event)" @click="handleStarClick(i, $event)">
                    <svg v-if="starType(i, displayRating) === 'full'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-yellow-400 transition-transform hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg v-else-if="starType(i, displayRating) === 'half'" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-yellow-400 transition-transform hover:scale-110" viewBox="0 0 24 24"><defs><linearGradient :id="`hu-${i}`"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path :fill="`url(#hu-${i})`" stroke="currentColor" stroke-width="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white/15 transition-transform hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                </template>
              </div>
              <span v-if="userRating > 0" class="text-white/50 text-sm">{{ userRating }} / 5</span>
              <span v-else class="text-white/20 text-xs italic">Cliquez pour noter</span>
            </div>
          </div>

          <!-- Box : Catégories -->
          <div class="glass glass-panel glass-red p-5">
            <h3 class="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">Catégories</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="genre in movie.genres"
                :key="genre.id"
                class="glass glass-pill px-3 py-1 text-xs text-white/70 hover:text-white transition-colors cursor-default"
              >
                {{ genre.name }}
              </span>
              <span v-if="!movie.genres?.length" class="text-white/20 text-xs italic">Aucune catégorie</span>
            </div>
          </div>

          <!-- Box déroulable : En savoir plus -->
          <div class="glass glass-panel glass-red overflow-hidden">
            <button
              @click="detailsOpen = !detailsOpen"
              class="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
            >
              <h3 class="text-sm font-bold text-white/80 uppercase tracking-wider">En savoir plus</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 text-white/40 transition-transform duration-300"
                :class="{ 'rotate-180': detailsOpen }"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <Transition name="expand">
              <div v-if="detailsOpen" class="px-5 pb-5 space-y-4">

                <!-- Réalisateur -->
                <div v-if="directors.length">
                  <span class="detail-label">Réalisateur</span>
                  <span class="detail-value">{{ directors.map(d => d.name).join(', ') }}</span>
                </div>

                <!-- Acteurs principaux -->
                <div v-if="topCast.length">
                  <span class="detail-label">Acteurs principaux</span>
                  <div class="mt-2 space-y-2">
                    <div v-for="actor in topCast" :key="actor.id" class="flex items-center gap-3">
                      <img
                        v-if="actor.profile_path"
                        :src="profileUrl(actor.profile_path)"
                        :alt="actor.name"
                        class="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                      <div v-else class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/30 text-xs">?</div>
                      <div class="min-w-0">
                        <p class="text-white/70 text-xs font-medium truncate">{{ actor.name }}</p>
                        <p class="text-white/30 text-[11px] truncate">{{ actor.character }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Titre original -->
                <div v-if="movie.original_title && movie.original_title !== movie.title">
                  <span class="detail-label">Titre original</span>
                  <span class="detail-value">{{ movie.original_title }}</span>
                </div>

                <!-- Langue -->
                <div v-if="movie.original_language">
                  <span class="detail-label">Langue originale</span>
                  <span class="detail-value">{{ langName(movie.original_language) }}</span>
                </div>

                <!-- Budget -->
                <div v-if="movie.budget">
                  <span class="detail-label">Budget</span>
                  <span class="detail-value">{{ formatMoney(movie.budget) }}</span>
                </div>

                <!-- Recettes -->
                <div v-if="movie.revenue">
                  <span class="detail-label">Recettes</span>
                  <span class="detail-value">{{ formatMoney(movie.revenue) }}</span>
                </div>

                <!-- Pays de production -->
                <div v-if="movie.production_countries?.length">
                  <span class="detail-label">Pays de production</span>
                  <span class="detail-value">{{ movie.production_countries.map(c => c.name).join(', ') }}</span>
                </div>

                <!-- Sociétés de production -->
                <div v-if="movie.production_companies?.length">
                  <span class="detail-label">Production</span>
                  <span class="detail-value">{{ movie.production_companies.map(c => c.name).join(', ') }}</span>
                </div>

                <!-- Statut -->
                <div v-if="movie.status">
                  <span class="detail-label">Statut</span>
                  <span class="detail-value">{{ movie.status }}</span>
                </div>
              </div>
            </Transition>
          </div>

        </div>
      </section>

    </template>
  </div>
</template>

<style scoped>
/* Banner plein écran : compenser les paddings du layout */
.banner-fullbleed {
  margin-left: -6rem;
  margin-right: -2rem;
  width: calc(100% + 8rem);
  padding-left: 6rem;
  padding-right: 2rem;
}

/* Gradient bas de la bannière : fondu progressif vers le fond sombre */
.hero-bottom-gradient {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(26, 0, 0, 0.05) 15%,
    rgba(26, 0, 0, 0.15) 30%,
    rgba(26, 0, 0, 0.35) 45%,
    rgba(26, 0, 0, 0.55) 55%,
    rgba(26, 0, 0, 0.75) 65%,
    rgba(26, 0, 0, 0.88) 75%,
    rgba(26, 0, 0, 0.96) 85%,
    #1a0000 95%
  );
}

.hero-section {
  margin-bottom: 0;
}

/* Fond solide pour toute la page film — matche le gradient */
.movie-page-bg {
  background: #1a0000;
}

/* Zone de contenu sous la bannière */
.movie-content-area {
  position: relative;
  background: #1a0000;
}

/* Labels des détails */
.detail-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 0.15rem;
}
.detail-value {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.4;
}

/* Transition expand */
.expand-enter-active,

/* État actif pour les boutons favoris/watchlist */
.glass-active {
  background: rgba(239, 68, 68, 0.25) !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
}
.expand-leave-active {
  transition: all 350ms ease;
  max-height: 800px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
