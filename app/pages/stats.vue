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

      <!-- Requête personnalisée -->
      <div class="mb-10">
        <div class="glass glass-panel p-6">
          <!-- Header -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl glass glass-red flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-base font-bold">Requête personnalisée</h2>
              <p class="text-white/40 text-xs mt-0.5">Explorez les données selon vos propres critères</p>
            </div>
            <button @click="customPanelOpen = !customPanelOpen" class="expand-btn" :title="customPanelOpen ? 'Réduire' : 'Agrandir'">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-300" :class="customPanelOpen ? '' : 'rotate-180'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </button>
          </div>

          <div :class="['panel-wrapper', customPanelOpen && 'panel-wrapper--open']">
            <div class="panel-wrapper-inner">
          <!-- Contrôles -->
          <div class="flex flex-wrap items-end gap-4 pt-6">
            <!-- Type de requête -->
            <div ref="queryDropdownRef" class="flex flex-col gap-1.5 min-w-[220px]">
              <label class="text-white/50 text-xs font-medium">Type de requête</label>
              <button
                ref="queryBtnRef"
                type="button"
                @click="toggleQueryDropdown"
                class="query-type-btn"
              >
                <span class="truncate">{{ selectedQuery?.label }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0 transition-transform duration-200" :class="queryDropdownOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>

            <!-- Paramètre libre -->
            <div class="flex flex-col gap-1.5 flex-1 min-w-[160px] relative">
              <label class="text-white/50 text-xs font-medium">{{ selectedQuery?.paramLabel }}</label>
              <input
                v-model="customParam"
                :placeholder="selectedQuery?.paramPlaceholder"
                @keyup.enter="runCustomQuery"
                @focus="showSuggestions = suggestions.length > 0"
                @blur="onParamBlur"
                class="custom-input"
                autocomplete="off"
              />
              <!-- Spinner dans l'input -->
              <div v-if="loadingSuggestions" class="absolute right-2.5 bottom-[9px]">
                <div class="spinner-sm" />
              </div>
              <!-- Dropdown suggestions -->
              <div
                v-if="showSuggestions && suggestions.length"
                class="suggest-dropdown"
              >
                <button
                  v-for="s in suggestions"
                  :key="s.id"
                  @mousedown.prevent="pickSuggestion(s)"
                  class="suggest-item"
                >
                  <div class="suggest-avatar">
                    <img v-if="s.profile_path" :src="s.profile_path" :alt="s.name" class="w-full h-full object-cover" loading="lazy" />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-white truncate">{{ s.name }}</div>
                    <div v-if="s.known_for" class="text-xs text-white/40 truncate">{{ s.known_for }}</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Nombre de résultats -->
            <div class="flex flex-col gap-1.5">
              <label class="text-white/50 text-xs font-medium">Résultats</label>
              <select v-model.number="customLimit" class="stat-select">
                <option v-for="n in topOptions" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>

            <!-- Type de graphique -->
            <div class="flex flex-col gap-1.5">
              <label class="text-white/50 text-xs font-medium">Graphique</label>
              <div class="flex gap-1 flex-wrap">
                <button
                  v-for="ct in CHART_TYPES"
                  :key="ct.id"
                  @click="customChartType = ct.id"
                  :class="['chart-type-btn', customChartType === ct.id ? 'active' : '']"
                >{{ ct.label }}</button>
              </div>
            </div>

            <!-- Bouton Analyser -->
            <button
              @click="runCustomQuery"
              :disabled="!customParam.trim() || loadingCustom"
              class="custom-run-btn"
            >
              <svg v-if="!loadingCustom" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              <div v-else class="spinner-sm mr-1.5 shrink-0" />
              {{ loadingCustom ? 'Analyse...' : 'Analyser' }}
            </button>
          </div>

          <!-- Hint -->
          <p v-if="selectedQuery?.hint" class="mt-3 flex items-center gap-1.5 text-white/35 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            {{ selectedQuery.hint }}
          </p>

          <!-- Zone résultat -->
          <div class="mt-6">
            <div v-if="customError" class="flex items-center gap-2 text-red-400 text-sm py-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {{ customError }}
            </div>

            <div v-else-if="loadingCustom" class="chart-loader h-[340px]">
              <div class="spinner" />
            </div>

            <div v-else-if="customResult">
              <div v-if="!customResult.labels.length" class="text-white/30 text-sm text-center py-10">
                Aucun résultat trouvé.
              </div>
              <div v-else class="h-[340px] relative" :key="customChartType">
                <Bar       v-if="customChartType === 'bar'      && customChartData" :data="customChartData" :options="customChartOptions" />
                <Line      v-else-if="customChartType === 'line'     && customChartData" :data="customChartData" :options="customChartOptions" />
                <Pie       v-else-if="customChartType === 'pie'      && customChartData" :data="customChartData" :options="customChartOptions" />
                <Doughnut  v-else-if="customChartType === 'doughnut' && customChartData" :data="customChartData" :options="customChartOptions" />
                <Radar     v-else-if="customChartType === 'radar'    && customChartData" :data="customChartData" :options="customChartOptions" />
                <PolarArea v-else-if="customChartType === 'polar'    && customChartData" :data="customChartData" :options="customChartOptions" />
              </div>
            </div>

            <div v-else class="flex items-center justify-center gap-2 py-10 text-white/20 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Sélectionnez un type de requête, saisissez votre critère et cliquez sur Analyser
            </div>
          </div>
            </div>
          </div>
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

  <!-- Query type dropdown – teleported to body to escape overflow:hidden clipping -->
  <Teleport to="body">
    <div
      v-if="queryDropdownOpen"
      ref="queryDropdownTeleportRef"
      class="query-dropdown-portal"
      :style="queryDropdownPos"
    >
      <button
        v-for="q in CUSTOM_QUERIES"
        :key="q.id"
        type="button"
        @mousedown.prevent="customQueryType = q.id; onQueryTypeChange(); queryDropdownOpen = false"
        :class="['query-dropdown-item-portal', customQueryType === q.id ? 'active' : '']"
      >
        {{ q.label }}
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Line, Pie, PolarArea, Radar } from 'vue-chartjs'

ChartJS.register(
  CategoryScale, LinearScale, RadialLinearScale,
  BarElement, LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, Filler,
)

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

// ─── Config requêtes personnalisées ───
const CUSTOM_QUERIES = [
  {
    id: 'actor_films',
    label: 'Films les mieux notés (acteur)',
    paramLabel: 'Acteur',
    paramPlaceholder: 'Ex : Brad Pitt',
    defaultChart: 'bar',
    isMoney: false,
    suggestType: 'person',
    hint: 'Valeurs : note moyenne TMDB (0–10) — films avec au moins 50 votes',
  },
  {
    id: 'actor_revenue',
    label: 'Recettes des films (acteur)',
    paramLabel: 'Acteur',
    paramPlaceholder: 'Ex : Tom Hanks',
    defaultChart: 'bar',
    isMoney: true,
    suggestType: 'person',
    hint: 'Valeurs : recette totale au box-office mondial (en $)',
  },
  {
    id: 'director_films',
    label: 'Filmographie par note (réalisateur)',
    paramLabel: 'Réalisateur',
    paramPlaceholder: 'Ex : Christopher Nolan',
    defaultChart: 'bar',
    isMoney: false,
    suggestType: 'person',
    hint: 'Valeurs : note moyenne TMDB (0–10) — films avec au moins 10 votes',
  },
  {
    id: 'director_revenue',
    label: 'Recettes des films (réalisateur)',
    paramLabel: 'Réalisateur',
    paramPlaceholder: 'Ex : Steven Spielberg',
    defaultChart: 'bar',
    isMoney: true,
    suggestType: 'person',
    hint: 'Valeurs : recette totale au box-office mondial (en $)',
  },
  {
    id: 'top_by_year',
    label: 'Top films par recette (année)',
    paramLabel: 'Année',
    paramPlaceholder: 'Ex : 2023',
    defaultChart: 'bar',
    isMoney: true,
    suggestType: null,
    hint: 'Valeurs : recette totale au box-office mondial (en $)',
  },
  {
    id: 'genre_evolution',
    label: 'Évolution des notes sur 10 ans (genre)',
    paramLabel: 'Genre',
    paramPlaceholder: 'Ex : Action',
    defaultChart: 'line',
    isMoney: false,
    suggestType: 'genre',
    hint: 'Valeurs : note moyenne TMDB (0–10) des 20 meilleurs films du genre, par année',
  },
  {
    id: 'studio_topfilms',
    label: 'Films les plus populaires (studio)',
    paramLabel: 'Studio',
    paramPlaceholder: 'Ex : Warner Bros',
    defaultChart: 'bar',
    isMoney: false,
    suggestType: 'studio',
    hint: 'Valeurs : score de popularité TMDB — indice basé sur les vues, recherches et interactions récentes',
  },
]

const CHART_TYPES = [
  { id: 'bar',      label: 'Barres'    },
  { id: 'line',     label: 'Ligne'     },
  { id: 'pie',      label: 'Secteurs'  },
  { id: 'doughnut', label: 'Donut'     },
  { id: 'radar',    label: 'Radar'     },
  { id: 'polar',    label: 'Polaire'   },
]

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

// ─── Custom query state ───
const customQueryType = ref('actor_films')
const customParam = ref('')
const customLimit = ref(10)
const customChartType = ref('bar')
const customResult = ref<{ labels: string[], values: number[], isMoney?: boolean, error?: string } | null>(null)
const loadingCustom = ref(false)
const customError = ref('')
const customPanelOpen = ref(true)
const queryDropdownOpen = ref(false)

// ─── Suggestions autocomplete ───
type Suggestion = { id: number; name: string; profile_path: string | null; known_for: string | null }
const suggestions = ref<Suggestion[]>([])
const loadingSuggestions = ref(false)
const showSuggestions = ref(false)
let suggestTimer: ReturnType<typeof setTimeout> | null = null

const suggestionType = computed(() => selectedQuery.value?.suggestType ?? null)

watch(customParam, (val) => {
  if (!suggestionType.value || !val.trim() || val.trim().length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  if (suggestTimer) clearTimeout(suggestTimer)
  loadingSuggestions.value = true
  suggestTimer = setTimeout(async () => {
    try {
      const data = await $fetch<Suggestion[]>('/api/stats/suggest', {
        params: { type: suggestionType.value, q: val.trim() },
      })
      suggestions.value = data
      showSuggestions.value = data.length > 0
    } catch {
      suggestions.value = []
    } finally {
      loadingSuggestions.value = false
    }
  }, 280)
})

function pickSuggestion(s: Suggestion) {
  customParam.value = s.name
  showSuggestions.value = false
  suggestions.value = []
}

function onParamBlur() {
  // Small delay so click on suggestion registers first
  setTimeout(() => { showSuggestions.value = false }, 180)
}

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

// ─── Custom query computed + functions ───
const selectedQuery = computed(() => CUSTOM_QUERIES.find((q) => q.id === customQueryType.value))

const queryDropdownRef = ref<HTMLElement | null>(null)
const queryBtnRef = ref<HTMLElement | null>(null)
const queryDropdownTeleportRef = ref<HTMLElement | null>(null)
const queryDropdownPos = ref<Record<string, string>>({})

function toggleQueryDropdown() {
  if (queryDropdownOpen.value) {
    queryDropdownOpen.value = false
    return
  }
  const rect = queryBtnRef.value?.getBoundingClientRect()
  if (rect) {
    queryDropdownPos.value = {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    }
  }
  queryDropdownOpen.value = true
}

function onQueryOutsideClick(e: MouseEvent) {
  const target = e.target as Node
  const inBtn = queryDropdownRef.value?.contains(target)
  const inDropdown = queryDropdownTeleportRef.value?.contains(target)
  if (!inBtn && !inDropdown) queryDropdownOpen.value = false
}

watch(queryDropdownOpen, (open) => {
  if (open) document.addEventListener('mousedown', onQueryOutsideClick)
  else document.removeEventListener('mousedown', onQueryOutsideClick)
})

function onQueryTypeChange() {
  const q = selectedQuery.value
  if (q) customChartType.value = q.defaultChart
  customParam.value = ''
  customResult.value = null
  customError.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

const customChartData = computed(() => {
  if (!customResult.value?.labels.length) return null
  const { labels, values } = customResult.value
  const isLine = customChartType.value === 'line'
  const isBar  = customChartType.value === 'bar'
  return {
    labels,
    datasets: [{
      label: selectedQuery.value?.label || '',
      data: values,
      backgroundColor: palette.slice(0, values.length),
      borderColor: isLine ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.1)',
      borderWidth: isLine ? 2 : 1,
      borderRadius: isBar ? 6 : undefined,
      tension: isLine ? 0.35 : undefined,
      pointBackgroundColor: isLine ? 'rgba(220,38,38,0.85)' : undefined,
      pointRadius: isLine ? 4 : undefined,
      fill: false,
    }],
  }
})

const customChartOptions = computed(() => {
  const isMoney = customResult.value?.isMoney ?? false
  const type    = customChartType.value
  const moneyFmt = (v: any) => formatMoney(v)
  const moneyTooltip = { callbacks: { label: (ctx: any) => formatMoney(ctx.raw) } }

  if (type === 'radar') {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          ticks: { color: 'rgba(255,255,255,0.45)', backdropColor: 'transparent', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.1)' },
          pointLabels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } },
        },
      },
    }
  }

  if (type === 'polar') {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' as const, labels: { color: 'rgba(255,255,255,0.7)', padding: 10, font: { size: 10 } } },
        ...(isMoney ? { tooltip: moneyTooltip } : {}),
      },
      scales: {
        r: {
          ticks: { color: 'rgba(255,255,255,0.45)', backdropColor: 'transparent', callback: isMoney ? moneyFmt : undefined },
          grid: { color: 'rgba(255,255,255,0.1)' },
        },
      },
    }
  }

  if (type === 'pie' || type === 'doughnut') {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' as const, labels: { color: 'rgba(255,255,255,0.7)', padding: 12, font: { size: 11 } } },
        ...(isMoney ? { tooltip: moneyTooltip } : {}),
      },
    }
  }

  // bar or line
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      ...(isMoney ? { tooltip: moneyTooltip } : {}),
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 10 }, maxRotation: 40 },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: 'rgba(255,255,255,0.5)',
          ...(isMoney ? { callback: moneyFmt } : {}),
        },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
    },
  }
})

async function runCustomQuery() {
  if (!customParam.value.trim() || loadingCustom.value) return
  loadingCustom.value = true
  customError.value = ''
  customResult.value = null
  try {
    const data = await $fetch<{ labels: string[], values: number[], isMoney?: boolean, error?: string }>(
      '/api/stats/custom',
      { params: { type: customQueryType.value, param: customParam.value.trim(), limit: customLimit.value } },
    )
    if (data.error) customError.value = data.error
    else customResult.value = data
  } catch (e: any) {
    customError.value = e?.data?.statusMessage || 'Une erreur est survenue'
  } finally {
    loadingCustom.value = false
  }
}

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
  background: #2d0f0f;
  color: rgba(255, 255, 255, 0.9);
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

/* ─── Custom query type dropdown ─── */
.query-type-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.35rem 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 200ms ease;
  outline: none;
  text-align: left;
}

.query-type-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: white;
}

/* (query-dropdown styles moved to global <style> below for Teleport support) */
.custom-input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  padding: 0.35rem 0.75rem;
  color: white;
  font-size: 0.75rem;
  outline: none;
  transition: all 200ms ease;
  width: 100%;
}

.custom-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.custom-input:focus {
  border-color: rgba(220, 38, 38, 0.55);
  background: rgba(255, 255, 255, 0.11);
}

.chart-type-btn {
  padding: 0.3rem 0.65rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 200ms ease;
  white-space: nowrap;
}

.chart-type-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

.chart-type-btn.active {
  background: rgba(220, 38, 38, 0.25);
  border-color: rgba(220, 38, 38, 0.55);
  color: white;
}

.custom-run-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 1.1rem;
  border-radius: 0.75rem;
  background: rgba(220, 38, 38, 0.7);
  border: 1px solid rgba(220, 38, 38, 0.4);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  white-space: nowrap;
}

.custom-run-btn:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.9);
}

.custom-run-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ─── Suggestions dropdown ─── */
.panel-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 350ms ease, opacity 250ms ease;
}

.panel-wrapper--open {
  grid-template-rows: 1fr;
  opacity: 1;
}

.panel-wrapper-inner {
  overflow: hidden;
}

.suggest-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(30, 5, 5, 0.95);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 1rem;
  backdrop-filter: blur(20px);
  overflow-y: auto;
  max-height: 220px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  scrollbar-width: thin;
  scrollbar-color: rgba(220, 38, 38, 0.4) transparent;
}

.suggest-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.6rem 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: background 150ms ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.suggest-item:last-child {
  border-bottom: none;
}

.suggest-item:hover {
  background: rgba(220, 38, 38, 0.18);
}

.suggest-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<!-- Global styles for teleported query-type dropdown (scoped CSS doesn't apply to Teleport) -->
<style>
.query-dropdown-portal {
  position: fixed;
  z-index: 9999;
  background: rgba(25, 5, 5, 0.97);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 0.875rem;
  backdrop-filter: blur(20px);
  overflow-y: auto;
  max-height: 260px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55);
  scrollbar-width: thin;
  scrollbar-color: rgba(220, 38, 38, 0.4) transparent;
}

.query-dropdown-item-portal {
  display: block;
  width: 100%;
  padding: 0.55rem 0.85rem;
  text-align: left;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: transparent;
  border-left: none;
  border-right: none;
  border-top: none;
}

.query-dropdown-item-portal:last-child {
  border-bottom: none;
}

.query-dropdown-item-portal:hover {
  background: rgba(220, 38, 38, 0.15);
  color: white;
}

.query-dropdown-item-portal.active {
  background: rgba(220, 38, 38, 0.22);
  color: white;
  font-weight: 600;
}
</style>
