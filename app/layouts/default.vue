<template>
  <div class="relative h-screen text-white overflow-hidden flex flex-col" :class="hideHeader ? 'bg-[#1a0000]' : 'bg-animated-red'">
    <div
      class="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-700 ease-out"
      :class="heroBgEnabled ? 'opacity-100' : 'opacity-0'"
    >
      <Transition name="hero-bg-fade">
        <div
          v-if="heroBgImage"
          :key="`hero-bg-${heroBgFrameKey}`"
          class="absolute inset-0 hero-bg-image-layer"
          :style="{ backgroundImage: `url('${heroBgImage}')` }"
        />
      </Transition>
    </div>

    <!-- Header -->
    <header v-if="!hideHeader" class="relative z-10 flex items-center justify-between px-8 py-5 shrink-0">
      <!-- Logo placeholder -->
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </div>
      <span class="text-sm font-medium tracking-widest uppercase text-white/40">movie analytics</span>

      <!-- Auth status -->
      <div class="flex items-center gap-3">
        <template v-if="loggedIn">
          <NuxtLink to="/profil" class="flex items-center gap-2 glass glass-pill px-4 py-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ user?.pseudo }}
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="glass glass-pill px-4 py-1.5 text-sm text-white/60 hover:text-white transition-colors">
            Connexion
          </NuxtLink>
        </template>
      </div>
    </header>

    <!-- Sidebar flottante centrée verticalement — liquid glass -->
    <nav class="fixed left-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3 py-5 px-3 w-16 glass glass-sidebar">
      <NuxtLink to="/dashboard" class="sidebar-icon" title="Dashboard">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        </svg>
      </NuxtLink>

      <NuxtLink :to="loggedIn ? '/profil' : '/login'" class="sidebar-icon" title="Profil">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </NuxtLink>

      <div class="sidebar-icon" title="WatchList">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      <div class="sidebar-icon" title="Favoris">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>

      <div class="sidebar-icon" title="Stats">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>

      <!-- Séparateur glass -->
      <div class="w-7 border-t border-white/15 my-1" />

      <div class="sidebar-icon" title="Recherche">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="relative z-10 pl-24 pr-8 pb-8 overflow-y-auto flex-1 min-h-0 snap-y snap-mandatory scroll-smooth">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const heroBgEnabled = useState<boolean>('dashboard-hero-bg-enabled', () => false)
const heroBgImage = useState<string>('dashboard-hero-bg-image', () => '')
const heroBgFrameKey = useState<number>('dashboard-hero-bg-frame-key', () => 0)
const hideHeader = useState<boolean>('layout-hide-header', () => false)

const { loggedIn, user } = useUserSession()
</script>

<style scoped>
.hero-bg-fade-enter-active,
.hero-bg-fade-leave-active {
  transition: opacity 850ms ease;
}

.hero-bg-fade-enter-from,
.hero-bg-fade-leave-to {
  opacity: 0;
}

.hero-bg-image-layer {
  background-size: cover;
  background-position: center;
  transform: scale(1.16);
  filter: blur(58px) saturate(1.15);
}
</style>
