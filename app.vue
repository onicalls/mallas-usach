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
