<template>
  <div class="min-h-full text-white pb-12">
    <div class="mx-auto px-8 pt-8">
      <!-- Titre -->
      <div class="flex items-center gap-4 mb-10">
        <div class="w-12 h-12 rounded-2xl glass glass-red flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">Statistiques</h1>
          <p class="text-white/40 text-sm mt-1">Analyses et classements personnalisables</p>
        </div>
      </div>

      <!-- Grille Bento -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">

        <!-- 1. Top Profits — LARGE (2 colonnes) -->
        <div
          class="transition-all duration-500 ease-out"
          :class="expanded === 'profits' ? 'xl:col-span-3' : 'xl:col-span-2'"
        >
          <div class="flex items-end justify-between mb-2 px-1">
            <div>
              <h2 class="text-lg font-bold">Plus grandes recettes nettes</h2>
              <p class="text-white/35 text-xs mt-0.5">Classement des films ayant genere le plus de profit net (recette - budget)</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-4">
              <select v-model.number="topProfitsLimit" @change="loadTopProfits" class="stat-select">
                <option v-for="n in topOptions" :key="n" :value="n">Top {{ n }}</option>
              </select>
              <button @click="toggleExpand('profits')" class="expand-btn" :title="expanded === 'profits' ? 'Reduire' : 'Agrandir'">
                <svg v-if="expanded !== 'profits'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
              </button>
            </div>
          </div>
          <div class="glass glass-panel p-5">
            <div v-if="loadingProfits" class="chart-loader" :class="expanded === 'profits' ? 'h-[480px]' : 'h-[380px]'"><div class="spinner" /></div>
            <div v-else class="chart-area" :class="expanded === 'profits' ? 'h-[480px]' : 'h-[380px]'">
              <Bar v-if="profitsData" :data="profitsData" :options="horizontalBarOptions" />
            </div>
          </div>
        </div>

        <!-- 2. Donut Genres Realisateurs — SMALL (1 colonne) -->
        <div
          class="transition-all duration-500 ease-out"
          :class="expanded === 'directors' ? 'xl:col-span-3' : 'xl:col-span-1'"
        >
          <div class="flex items-end justify-between mb-2 px-1">
            <div>
              <h2 class="text-base font-bold">Genres des realisateurs</h2>
              <p class="text-white/35 text-xs mt-0.5">Repartition des genres sur les films les mieux notes</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-3">
              <select v-model.number="directorsMinRating" @change="loadDirectorsGenres" class="stat-select">
                <option :value="7">7+</option>
                <option :value="7.5">7.5+</option>
                <option :value="8">8+</option>
                <option :value="8.5">8.5+</option>
              </select>
              <button @click="toggleExpand('directors')" class="expand-btn" :title="expanded === 'directors' ? 'Reduire' : 'Agrandir'">
                <svg v-if="expanded !== 'directors'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
              </button>
            </div>
          </div>
          <div class="glass glass-panel p-5">
            <div v-if="loadingDirectors" class="chart-loader" :class="expanded === 'directors' ? 'h-[480px]' : 'h-[380px]'"><div class="spinner" /></div>
            <div v-else class="chart-area-donut" :class="expanded === 'directors' ? 'h-[480px]' : 'h-[380px]'">
              <Doughnut v-if="directorsData" :data="directorsData" :options="donutOptions" />
            </div>
          </div>
        </div>

        <!-- 3. Films par genre -->
        <div
          class="transition-all duration-500 ease-out"
          :class="expanded === 'genres' ? 'xl:col-span-3' : 'xl:col-span-1'"
        >
          <div class="flex items-end justify-between mb-2 px-1">
            <div>
              <h2 class="text-base font-bold">Films par genre</h2>
              <p class="text-white/35 text-xs mt-0.5">Nombre de films bien notes par genre</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-3">
              <select v-model.number="genresMinRating" @change="loadGenresRated" class="stat-select">
                <option :value="7">7+</option>
                <option :value="7.5">7.5+</option>
                <option :value="8">8+</option>
                <option :value="8.5">8.5+</option>
              </select>
              <select v-model.number="genresLimit" @change="loadGenresRated" class="stat-select">
                <option v-for="n in topOptions" :key="n" :value="n">Top {{ n }}</option>
              </select>
              <button @click="toggleExpand('genres')" class="expand-btn" :title="expanded === 'genres' ? 'Reduire' : 'Agrandir'">
                <svg v-if="expanded !== 'genres'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
              </button>
            </div>
          </div>
          <div class="glass glass-panel p-5">
            <div v-if="loadingGenres" class="chart-loader" :class="expanded === 'genres' ? 'h-[480px]' : 'h-[340px]'"><div class="spinner" /></div>
            <div v-else class="chart-area" :class="expanded === 'genres' ? 'h-[480px]' : 'h-[340px]'">
              <Bar v-if="genresData" :data="genresData" :options="verticalBarOptions" />
            </div>
          </div>
        </div>

        <!-- 4. Films par pays -->
        <div
          class="transition-all duration-500 ease-out"
          :class="expanded === 'countries' ? 'xl:col-span-3' : 'xl:col-span-1'"
        >
          <div class="flex items-end justify-between mb-2 px-1">
            <div>
              <h2 class="text-base font-bold">Films par pays</h2>
              <p class="text-white/35 text-xs mt-0.5">Pays produisant le plus de films de qualite</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-3">
              <select v-model.number="countriesMinRating" @change="loadCountriesRated" class="stat-select">
                <option :value="7">7+</option>
                <option :value="7.5">7.5+</option>
                <option :value="8">8+</option>
                <option :value="8.5">8.5+</option>
              </select>
              <select v-model.number="countriesLimit" @change="loadCountriesRated" class="stat-select">
                <option v-for="n in topOptions" :key="n" :value="n">Top {{ n }}</option>
              </select>
              <button @click="toggleExpand('countries')" class="expand-btn" :title="expanded === 'countries' ? 'Reduire' : 'Agrandir'">
                <svg v-if="expanded !== 'countries'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
              </button>
            </div>
          </div>
          <div class="glass glass-panel p-5">
            <div v-if="loadingCountries" class="chart-loader" :class="expanded === 'countries' ? 'h-[480px]' : 'h-[340px]'"><div class="spinner" /></div>
            <div v-else class="chart-area" :class="expanded === 'countries' ? 'h-[480px]' : 'h-[340px]'">
              <Bar v-if="countriesData" :data="countriesData" :options="verticalBarOptions" />
            </div>
          </div>
        </div>

        <!-- 5. Recettes par pays -->
        <div
          class="transition-all duration-500 ease-out"
          :class="expanded === 'revenue' ? 'xl:col-span-3' : 'xl:col-span-1'"
        >
          <div class="flex items-end justify-between mb-2 px-1">
            <div>
              <h2 class="text-base font-bold">Recettes par pays</h2>
              <p class="text-white/35 text-xs mt-0.5">Somme des recettes par pays sur l'annee selectionnee</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-3">
              <select v-model.number="revenueYear" @change="loadRevenue2025" class="stat-select">
                <option :value="2025">2025</option>
                <option :value="2024">2024</option>
                <option :value="2023">2023</option>
              </select>
              <select v-model.number="revenueLimit" @change="loadRevenue2025" class="stat-select">
                <option v-for="n in topOptions" :key="n" :value="n">Top {{ n }}</option>
              </select>
              <button @click="toggleExpand('revenue')" class="expand-btn" :title="expanded === 'revenue' ? 'Reduire' : 'Agrandir'">
                <svg v-if="expanded !== 'revenue'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
              </button>
            </div>
          </div>
          <div class="glass glass-panel p-5">
            <div v-if="loadingRevenue" class="chart-loader" :class="expanded === 'revenue' ? 'h-[480px]' : 'h-[340px]'"><div class="spinner" /></div>
            <div v-else class="chart-area" :class="expanded === 'revenue' ? 'h-[480px]' : 'h-[340px]'">
              <Bar v-if="revenueData" :data="revenueData" :options="revenueBarOptions" />
            </div>
          </div>
        </div>

        <!-- 6. Budget moyen — LARGE (2 colonnes) -->
        <div
          class="transition-all duration-500 ease-out"
          :class="expanded === 'budget' ? 'xl:col-span-3' : 'xl:col-span-2'"
        >
          <div class="flex items-end justify-between mb-2 px-1">
            <div>
              <h2 class="text-lg font-bold">Budget moyen</h2>
              <p class="text-white/35 text-xs mt-0.5">Moyenne des budgets de production par genre ou par realisateur</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-4">
              <select v-model="budgetView" class="stat-select">
                <option value="genre">Par genre</option>
                <option value="director">Par realisateur</option>
              </select>
              <select v-model.number="budgetLimit" @change="loadBudget" class="stat-select">
                <option v-for="n in topOptions" :key="n" :value="n">Top {{ n }}</option>
              </select>
              <button @click="toggleExpand('budget')" class="expand-btn" :title="expanded === 'budget' ? 'Reduire' : 'Agrandir'">
                <svg v-if="expanded !== 'budget'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
              </button>
            </div>
          </div>
          <div class="glass glass-panel p-5">
            <div v-if="loadingBudget" class="chart-loader" :class="expanded === 'budget' ? 'h-[480px]' : 'h-[380px]'"><div class="spinner" /></div>
            <div v-else class="chart-area" :class="expanded === 'budget' ? 'h-[480px]' : 'h-[380px]'">
              <Bar v-if="budgetData" :data="budgetData" :options="budgetBarOptions" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const palette = [
  'rgba(220, 38, 38, 0.8)',
  'rgba(239, 68, 68, 0.7)',
  'rgba(248, 113, 113, 0.7)',
  'rgba(252, 165, 165, 0.6)',
  'rgba(254, 202, 202, 0.5)',
  'rgba(185, 28, 28, 0.8)',
  'rgba(153, 27, 27, 0.7)',
  'rgba(127, 29, 29, 0.6)',
  'rgba(255, 100, 100, 0.7)',
  'rgba(200, 50, 50, 0.6)',
  'rgba(170, 40, 40, 0.65)',
  'rgba(140, 30, 30, 0.6)',
  'rgba(230, 80, 80, 0.7)',
  'rgba(210, 60, 60, 0.65)',
  'rgba(190, 45, 45, 0.6)',
  'rgba(160, 35, 35, 0.55)',
  'rgba(250, 130, 130, 0.6)',
  'rgba(245, 150, 150, 0.55)',
  'rgba(240, 170, 170, 0.5)',
  'rgba(235, 190, 190, 0.45)',
]

const topOptions = [3, 5, 7, 10, 15, 20]

// ─── Expand toggle ───
const expanded = ref<string | null>(null)

function toggleExpand(key: string) {
  expanded.value = expanded.value === key ? null : key
}

function formatMoney(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} Md$`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} M$`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} k$`
  return `${value} $`
}

// ─── Chart options ───
const horizontalBarOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx: any) => formatMoney(ctx.raw) } },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.5)', callback: (v: any) => formatMoney(v) },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
    y: {
      ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
      grid: { display: false },
    },
  },
}

const verticalBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
      grid: { display: false },
    },
    y: {
      ticks: { color: 'rgba(255,255,255,0.5)' },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
  },
}

const revenueBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx: any) => formatMoney(ctx.raw) } },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
      grid: { display: false },
    },
    y: {
      ticks: { color: 'rgba(255,255,255,0.5)', callback: (v: any) => formatMoney(v) },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
  },
}

const budgetBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx: any) => formatMoney(ctx.raw) } },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
      grid: { display: false },
    },
    y: {
      ticks: { color: 'rgba(255,255,255,0.5)', callback: (v: any) => formatMoney(v) },
      grid: { color: 'rgba(255,255,255,0.06)' },
    },
  },
}

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: { color: 'rgba(255,255,255,0.7)', padding: 12, font: { size: 11 } },
    },
  },
}

// ─── State ───
const topProfitsLimit = ref(5)
const directorsMinRating = ref(8)
const genresMinRating = ref(8)
const genresLimit = ref(5)
const countriesMinRating = ref(8)
const countriesLimit = ref(5)
const revenueYear = ref(2025)
const revenueLimit = ref(5)
const budgetView = ref<'genre' | 'director'>('genre')
const budgetLimit = ref(5)

const loadingProfits = ref(true)
const loadingDirectors = ref(true)
const loadingGenres = ref(true)
const loadingCountries = ref(true)
const loadingRevenue = ref(true)
const loadingBudget = ref(true)

const profitsData = ref<any>(null)
const directorsData = ref<any>(null)
const genresData = ref<any>(null)
const countriesData = ref<any>(null)
const revenueData = ref<any>(null)
const budgetData = ref<any>(null)
const budgetRaw = ref<any>(null)

// ─── Loaders ───
async function loadTopProfits() {
  loadingProfits.value = true
  try {
    const data: any = await $fetch('/api/stats/top-profits', { params: { limit: topProfitsLimit.value } })
    profitsData.value = {
      labels: data.map((d: any) => d.title),
      datasets: [{
        data: data.map((d: any) => d.profit),
        backgroundColor: palette.slice(0, data.length),
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderRadius: 6,
      }],
    }
  } catch (e) { console.error('top-profits error:', e) }
  finally { loadingProfits.value = false }
}

async function loadDirectorsGenres() {
  loadingDirectors.value = true
  try {
    const data: any = await $fetch('/api/stats/directors-genres', { params: { min_rating: directorsMinRating.value } })
    directorsData.value = {
      labels: data.map((d: any) => d.genre),
      datasets: [{
        data: data.map((d: any) => d.count),
        backgroundColor: palette.slice(0, data.length),
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
      }],
    }
  } catch (e) { console.error('directors-genres error:', e) }
  finally { loadingDirectors.value = false }
}

async function loadGenresRated() {
  loadingGenres.value = true
  try {
    const data: any = await $fetch('/api/stats/genres-rated', { params: { min_rating: genresMinRating.value, limit: genresLimit.value } })
    genresData.value = {
      labels: data.map((d: any) => d.genre),
      datasets: [{
        data: data.map((d: any) => d.count),
        backgroundColor: palette.slice(0, data.length),
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderRadius: 6,
      }],
    }
  } catch (e) { console.error('genres-rated error:', e) }
  finally { loadingGenres.value = false }
}

async function loadCountriesRated() {
  loadingCountries.value = true
  try {
    const data: any = await $fetch('/api/stats/countries-rated', { params: { min_rating: countriesMinRating.value, limit: countriesLimit.value } })
    countriesData.value = {
      labels: data.map((d: any) => d.country),
      datasets: [{
        data: data.map((d: any) => d.count),
        backgroundColor: palette.slice(0, data.length),
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderRadius: 6,
      }],
    }
  } catch (e) { console.error('countries-rated error:', e) }
  finally { loadingCountries.value = false }
}

async function loadRevenue2025() {
  loadingRevenue.value = true
  try {
    const data: any = await $fetch('/api/stats/revenue-2025', { params: { limit: revenueLimit.value, year: revenueYear.value } })
    revenueData.value = {
      labels: data.map((d: any) => d.country),
      datasets: [{
        data: data.map((d: any) => d.revenue),
        backgroundColor: palette.slice(0, data.length),
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderRadius: 6,
      }],
    }
  } catch (e) { console.error('revenue-2025 error:', e) }
  finally { loadingRevenue.value = false }
}

async function loadBudget() {
  loadingBudget.value = true
  try {
    const data: any = await $fetch('/api/stats/budget-by-genre-director', { params: { limit: budgetLimit.value } })
    budgetRaw.value = data
    updateBudgetChart()
  } catch (e) { console.error('budget error:', e) }
  finally { loadingBudget.value = false }
}

function updateBudgetChart() {
  if (!budgetRaw.value) return
  const source = budgetView.value === 'genre' ? budgetRaw.value.byGenre : budgetRaw.value.byDirector
  budgetData.value = {
    labels: source.map((d: any) => d.name),
    datasets: [{
      data: source.map((d: any) => d.average),
      backgroundColor: palette.slice(0, source.length),
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderRadius: 6,
    }],
  }
}

watch(budgetView, updateBudgetChart)

onMounted(() => {
  loadTopProfits()
  loadDirectorsGenres()
  loadGenresRated()
  loadCountriesRated()
  loadRevenue2025()
  loadBudget()
})
</script>

<style scoped>
.chart-area {
  position: relative;
  transition: height 500ms ease;
}

.chart-area-donut {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 500ms ease;
}

.chart-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 500ms ease;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(239, 68, 68, 0.8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stat-select {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  padding: 0.35rem 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 200ms ease;
  outline: none;
}

.stat-select:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.stat-select option {
  background: #1a0000;
  color: white;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 0.625rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 200ms ease;
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border-color: rgba(255, 255, 255, 0.25);
}
</style>
