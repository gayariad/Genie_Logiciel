<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

const { data, pending, error, refresh } = await useFetch(
  "/api/tmdb/trending?time_window=day",
);

const results = computed(() => data.value?.results ?? []);
const CAROUSEL_INTERVAL_MS = 5000;

// Carousel state
const currentHeroIndex = ref(0);
let carouselInterval: NodeJS.Timeout | null = null;
let heroSectionObserver: IntersectionObserver | null = null;

const heroSectionRef = ref<HTMLElement | null>(null);
const heroBgEnabled = useState<boolean>(
  "dashboard-hero-bg-enabled",
  () => false,
);
const heroBgImage = useState<string>("dashboard-hero-bg-image", () => "");
const heroBgFrameKey = useState<number>("dashboard-hero-bg-frame-key", () => 0);

// Auto-rotate carousel every 5 seconds
onMounted(() => {
  startCarouselAutoRotate();

  heroBgEnabled.value = false;

  const heroSection = heroSectionRef.value;
  const scrollRoot = heroSection?.closest("main") as HTMLElement | null;

  if (heroSection) {
    heroSectionObserver = new IntersectionObserver(
      ([entry]) => {
        heroBgEnabled.value =
          !!entry && entry.isIntersecting && entry.intersectionRatio >= 0.55;
      },
      {
        root: scrollRoot,
        threshold: [0.25, 0.55, 0.85],
      },
    );
    heroSectionObserver.observe(heroSection);
  }
});

onUnmounted(() => {
  if (carouselInterval) clearInterval(carouselInterval);
  if (heroSectionObserver) {
    heroSectionObserver.disconnect();
    heroSectionObserver = null;
  }
  heroBgEnabled.value = false;
  heroBgImage.value = "";
});

function nextSlide() {
  if (results.value.length > 0) {
    currentHeroIndex.value =
      (currentHeroIndex.value + 1) % Math.min(results.value.length, 5);
  }
}

function prevSlide() {
  if (results.value.length > 0) {
    currentHeroIndex.value =
      currentHeroIndex.value === 0
        ? Math.min(results.value.length, 5) - 1
        : currentHeroIndex.value - 1;
  }
}

function startCarouselAutoRotate() {
  if (carouselInterval) clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    nextSlide();
  }, CAROUSEL_INTERVAL_MS);
}

function resetCarouselAutoRotate() {
  startCarouselAutoRotate();
}

function nextSlideManual() {
  nextSlide();
  resetCarouselAutoRotate();
}

function prevSlideManual() {
  prevSlide();
  resetCarouselAutoRotate();
}

function goToSlide(index: number) {
  const slidesCount = Math.min(results.value.length, 5);
  if (slidesCount <= 0) return;
  currentHeroIndex.value = ((index % slidesCount) + slidesCount) % slidesCount;
  resetCarouselAutoRotate();
}

// Get current hero and other cards
const currentHero = computed(
  () => results.value[currentHeroIndex.value] ?? null,
);
const heroSlides = computed(
  () => results.value.slice(0, Math.min(results.value.length, 5)) ?? [],
);

// Helper image TMDb
function tmdbImg(item: any, size: "w780" | "w1280" | "original" = "w1280") {
  const path = item?.backdrop_path || item?.poster_path;
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function titleOf(item: any) {
  return item?.title || item?.name || "—";
}

function overviewOf(item: any) {
  return item?.overview || "";
}

function syncHeroBackgroundFrame() {
  const image =
    tmdbImg(currentHero.value, "w1280") ||
    tmdbImg(currentHero.value, "original") ||
    "";
  heroBgImage.value = image;
  heroBgFrameKey.value += 1;
}
watch(
  currentHero,
  () => {
    syncHeroBackgroundFrame();
  },
  { immediate: true },
);

// ---- Genres carousels ----
const GENRE_PICKS = [
  { id: 28,  name: 'Action' },
  { id: 35,  name: 'Comédie' },
  { id: 18,  name: 'Drame' },
  { id: 27,  name: 'Horreur' },
  { id: 878, name: 'Science-Fiction' },
  { id: 10749, name: 'Romance' },
  { id: 16,  name: 'Animation' },
  { id: 53,  name: 'Thriller' },
]

const genreFilms = ref<Record<number, any[]>>({})
const genreLoading = ref<Record<number, boolean>>({})

async function loadGenre(genreId: number) {
  if (genreFilms.value[genreId] || genreLoading.value[genreId]) return
  genreLoading.value[genreId] = true
  try {
    const data: any = await $fetch('/api/search/discover', {
      params: { genres: genreId, page: 1 },
    })
    genreFilms.value[genreId] = (data?.results ?? []).slice(0, 15)
  } finally {
    genreLoading.value[genreId] = false
  }
}

const genreSectionRef = ref<HTMLElement | null>(null)
let genreObserver: IntersectionObserver | null = null

onMounted(() => {
  if (genreSectionRef.value) {
    genreObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          GENRE_PICKS.forEach(g => loadGenre(g.id))
          genreObserver?.disconnect()
        }
      },
      { threshold: 0.05 },
    )
    genreObserver.observe(genreSectionRef.value)
  }
})

onUnmounted(() => {
  genreObserver?.disconnect()
})

function posterImg(item: any) {
  if (!item?.poster_path) return null
  return `https://image.tmdb.org/t/p/w342${item.poster_path}`
}
</script>

<template>
  <div class="h-full">
    <!-- Loading / Error -->
    <div v-if="pending" class="h-full text-white/70 p-8 flex items-center">
      Chargement…
    </div>

    <div v-else-if="error" class="h-full text-red-300 p-8 flex items-center">
      Erreur : {{ error?.message }}
      <button
        class="ml-3 underline text-white/70 hover:text-white"
        @click="refresh()"
      >
        Réessayer
      </button>
    </div>

    <template v-else>
      <!-- Hero Carousel -->
      <section
        ref="heroSectionRef"
        class="h-full min-h-full snap-start snap-stop-always"
      >
        <div
          class="relative w-full h-full min-h-full rounded-3xl overflow-hidden group"
        >
          <!-- Background image -->
          <div class="absolute inset-0">
            <img
              v-for="(heroItem, slideIdx) in heroSlides"
              :key="
                heroItem?.id ??
                `${slideIdx}-${heroItem?.title || heroItem?.name || 'hero'}`
              "
              :src="tmdbImg(heroItem, 'original') || ''"
              alt=""
              class="absolute inset-0 w-full h-full object-cover object-[center_50%] transition-opacity duration-700 ease-in-out"
              :class="
                currentHeroIndex === slideIdx ? 'opacity-100' : 'opacity-0'
              "
            />
            <div
              class="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"
            />
            <div
              class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30"
            />
          </div>

          <!-- Navigation Arrows -->
          <button
            @click="prevSlideManual"
            class="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 glass glass-pill glass-red flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            @click="nextSlideManual"
            class="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 glass glass-pill glass-red flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- Content -->
          <div
            class="relative z-10 flex flex-col justify-end h-full px-12 pb-10 max-w-5xl ml-auto text-right"
          >
            <Transition name="hero-slide" mode="out-in">
              <div :key="currentHeroIndex">
                <h1
                  class="text-5xl md:text-6xl font-extrabold uppercase tracking-wider text-white drop-shadow-2xl"
                >
                  {{ titleOf(currentHero) }}
                </h1>

                <p
                  class="mt-3 text-sm text-white/80 leading-relaxed max-w-xl ml-auto line-clamp-3"
                >
                  {{ overviewOf(currentHero) }}
                </p>
              </div>
            </Transition>

            <NuxtLink
              :to="`/movie/${currentHero?.id}`"
              class="mt-5 self-end glass glass-btn glass-red text-white inline-block"
            >
              Voir les détails
            </NuxtLink>
          </div>

          <!-- Carousel indicators -->
          <div
            class="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2"
          >
            <button
              v-for="i in Math.min(results.length, 5)"
              :key="i"
              @click="goToSlide(i - 1)"
              class="h-2 rounded-full transition-all duration-300"
              :class="
                currentHeroIndex === i - 1
                  ? 'bg-white w-8'
                  : 'bg-white/40 hover:bg-white/60 w-2'
              "
            />
          </div>
        </div>
      </section>

      <!-- Stats CTA -->
      <section
        class="min-h-full snap-start snap-stop-always flex items-center justify-center py-8 mt-8"
      >
        <div
          class="relative w-full h-full min-h-full rounded-3xl overflow-hidden glass glass-panel flex items-center justify-center"
        >
          <!-- Decorative blurred blobs -->
          <div
            class="absolute -top-24 -left-24 w-96 h-96 bg-red-800/30 rounded-full blur-3xl pointer-events-none"
          />
          <div
            class="absolute -bottom-24 -right-24 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none"
          />
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none"
          />

          <!-- Decorative bar-chart shapes -->
          <div
            class="absolute inset-0 flex items-end justify-center gap-4 px-16 pb-10 opacity-10 pointer-events-none select-none"
            aria-hidden="true"
          >
            <div
              v-for="(h, i) in [45, 70, 55, 90, 65, 80, 50, 75, 40, 60, 85, 35]"
              :key="i"
              class="flex-1 rounded-t-lg bg-gradient-to-t from-red-500 to-red-300"
              :style="`height: ${h}%`"
            />
          </div>

          <!-- Main content -->
          <div
            class="relative z-10 flex flex-col items-center text-center px-8 gap-8 max-w-2xl mt-8"
          >
            <!-- Headline -->
            <div class="space-y-3">
              <h2
                class="text-4xl md:text-5xl font-extrabold uppercase tracking-wider text-white drop-shadow-xl leading-tight"
              >
                Le cinéma en<br />
                <span class="text-red-400">chiffres</span>
              </h2>
              <p
                class="text-white/60 text-base leading-relaxed max-w-md mx-auto"
              >
                Budgets, recettes, genres, réalisateurs plongez dans les
                coulisses de l'industrie cinématographique grâce à des analyses
                interactives.
              </p>
            </div>

            <!-- Key stats chips -->
            <div class="flex flex-wrap items-center justify-center gap-3">
              <span
                class="glass glass-red text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full"
                >Top profits</span
              >
              <span
                class="glass glass-red text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full"
                >Revenus par pays</span
              >
              <span
                class="glass glass-red text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full"
                >Genres & réalisateurs</span
              >
              <span
                class="glass glass-red text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full"
                >Budgets moyens</span
              >
            </div>

            <!-- CTA -->
            <NuxtLink
              to="/stats"
              class="glass glass-btn glass-red text-white flex items-center gap-2 px-8 py-3 text-base mb-8"
            >
              Explorer les statistiques
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </section>
      <!-- Genres Carousels -->
      <section
        ref="genreSectionRef"
        class="snap-start py-10 mt-8"
      >
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-2xl glass glass-red flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-white">Films par catégorie</h2>
            <p class="text-white/40 text-sm mt-0.5">Explorez les genres qui vous correspondent</p>
          </div>
        </div>

        <div class="genres-container flex flex-col gap-10">
          <div v-for="genre in GENRE_PICKS" :key="genre.id" class="genre-row-snap">
            <!-- Genre label -->
            <div class="flex items-center gap-3 mb-4">
              <h3 class="text-lg font-bold text-white">{{ genre.name }}</h3>
              <div class="flex-1 h-px bg-white/10" />
              <NuxtLink
                :to="`/search?genres=${genre.id}`"
                class="text-xs text-white/40 hover:text-white/70 transition-colors"
              >Voir tout →</NuxtLink>
            </div>

            <!-- Loading skeleton -->
            <div v-if="genreLoading[genre.id]" class="flex gap-4 overflow-hidden">
              <div
                v-for="n in 8" :key="n"
                class="genre-card-skeleton glass glass-red shrink-0 w-36 h-52 rounded-2xl animate-pulse"
              />
            </div>

            <!-- Horizontal scroll row -->
            <div
              v-else-if="genreFilms[genre.id]?.length"
              class="genre-row flex gap-4 overflow-x-auto pb-2"
            >
              <div
                v-for="film in genreFilms[genre.id]"
                :key="film.id"
                class="shrink-0 w-36 flex flex-col gap-1.5"
              >
                <NuxtLink
                  :to="`/movie/${film.id}`"
                  class="genre-card w-36 h-52 rounded-2xl overflow-hidden relative group/card glass glass-red block"
                >
                  <img
                    v-if="posterImg(film)"
                    :src="posterImg(film)!"
                    :alt="film.title"
                    class="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div class="absolute bottom-0 left-0 right-0 p-3">
                    <p class="text-white text-xs font-semibold leading-tight line-clamp-2">{{ film.title }}</p>
                    <p v-if="film.release_date" class="text-white/50 text-[10px] mt-0.5">
                      {{ film.release_date.slice(0, 4) }}
                    </p>
                  </div>
                </NuxtLink>
                <!-- Rating below card -->
                <div v-if="film.vote_average" class="flex items-center gap-1 px-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-yellow-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  <span class="text-white text-[11px] font-semibold">{{ film.vote_average.toFixed(1) }}</span>
                </div>
              </div>
            </div>

            <div v-else class="text-white/30 text-sm">Aucun film trouvé.</div>
          </div>
        </div>
        <!-- Sentinel snap point at the bottom so snap-mandatory doesn't bounce back up -->
        <div class="snap-start h-0" aria-hidden="true" />
      </section>
    </template>
  </div>
</template>

<style scoped>
.snap-stop-always {
  scroll-snap-stop: always;
}

/* Hero text slide */
.hero-slide-enter-active,
.hero-slide-leave-active {
  transition: all 0.5s ease;
}
.hero-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.hero-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Genre carousels */
.genres-container {
  scroll-snap-type: y proximity;
  overflow-y: auto;
}
.genre-row-snap {
  scroll-snap-align: start;
}
.genre-row {
  scrollbar-width: none;
}
.genre-row::-webkit-scrollbar {
  display: none;
}
</style>
