// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-auth-utils'],
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    TMDB_API_READ_TOKEN: process.env.TMDB_API_READ_TOKEN,
    session: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    db: {
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'dev_user',
      password: process.env.DB_PASSWORD || 'dev_pass',
      database: process.env.DB_NAME || 'cinema_bi_dev',
    },
  },
})
