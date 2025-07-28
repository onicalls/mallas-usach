<template>
  <div>
    <NuxtRouteAnnouncer />
    <MainPage />
  </div>
</template>

<script setup>
useHead({
  meta: [
    {
      name: 'google-site-verification',
      content: 'sCyLrRSROPRhMbz1YFIqJi2c8kOLqfoQyyMjmRP0Voc'
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'Mallas Curriculares USACH',
        'description': 'Visualizador interactivo de mallas curriculares de la Universidad de Santiago de Chile',
        'url': process.env.NODE_ENV === 'production' ? 'https://onicalls.github.io/mallas-usach/' : 'http://localhost:3000/',
        'applicationCategory': 'EducationalApplication',
        'operatingSystem': 'Web Browser',
        'author': {
          '@type': 'Organization',
          'name': 'Universidad de Santiago de Chile',
          'url': 'https://www.usach.cl'
        },
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'CLP'
        }
      })
    }
  ]
})
</script>

<style>
/* Estilos globales para toda la aplicación */
* {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
}
</style>
