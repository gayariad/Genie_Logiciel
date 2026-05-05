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
                Budgets, recettes, genres, réalisateurs — plongez dans les
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
</style>
