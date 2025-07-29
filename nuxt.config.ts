// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true, // Habilitamos SSR para mejor SEO
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || (process.env.NODE_ENV === 'production' ? '/mallas-usach/' : '/'),
    head: {
      htmlAttrs: {
        lang: 'es'
      },
      title: 'Mallas USACH',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Visualizador interactivo no oficial de mallas curriculares de la Universidad de Santiago de Chile (USACH). Explora los planes de estudio, prerequisitos y estructura de las carreras.' },
        { name: 'keywords', content: 'USACH, Universidad de Santiago, mallas curriculares, planes de estudio, carreras, prerequisitos, educación superior' },
        { name: 'author', content: 'USACH' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: 'Mallas Curriculares USACH' },
        { property: 'og:description', content: 'Visualizador interactivo no oficial de mallas curriculares de la Universidad de Santiago de Chile' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'es_CL' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Mallas Curriculares USACH' },
        { name: 'twitter:description', content: 'Visualizador interactivo no oficial de mallas curriculares de USACH' }
      ],
      link: [
        { rel: 'canonical', href: process.env.NODE_ENV === 'production' ? 'https://onicalls.github.io/mallas-usach/' : 'http://localhost:3000/' },
        { rel: 'manifest', href: (process.env.NODE_ENV === 'production' ? '/mallas-usach' : '') + '/manifest.json' },
        { rel: 'icon', type: 'image/x-icon', href: (process.env.NODE_ENV === 'production' ? '/mallas-usach' : '') + '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: (process.env.NODE_ENV === 'production' ? '/mallas-usach' : '') + '/icon-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: (process.env.NODE_ENV === 'production' ? '/mallas-usach' : '') + '/icon-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: (process.env.NODE_ENV === 'production' ? '/mallas-usach' : '') + '/icon-192x192.png' },
        { rel: 'shortcut icon', href: (process.env.NODE_ENV === 'production' ? '/mallas-usach' : '') + '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: (process.env.NODE_ENV === 'production' ? '/mallas-usach' : '') + '/icon-192x192.png' },
        { rel: 'apple-touch-icon', sizes: '192x192', href: (process.env.NODE_ENV === 'production' ? '/mallas-usach' : '') + '/icon-192x192.png' },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect', 
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        }
      ]
    }
  }
})
