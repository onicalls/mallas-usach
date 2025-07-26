import { ref } from 'vue'

// Instancia global para compartir entre componentes
const globalAvailableMallas = ref([])
let isLoading = false

export const useMallas = () => {
  // Cargar dinámicamente las mallas disponibles
  const loadAvailableMallas = async () => {
    if (isLoading) return globalAvailableMallas.value
    isLoading = true
    
    try {
      console.log('Iniciando carga automática de mallas disponibles...')
      let mallasFiles = []
      const mallas = []
      
      // Estrategia 1: Intentar cargar desde index.json (lista manual actualizable)
      try {
        console.log('Intentando cargar index.json...')
        const indexResponse = await fetch('/mallas/index.json')
        if (indexResponse.ok) {
          const indexData = await indexResponse.json()
          console.log('Index.json cargado:', indexData)
          if (indexData.files && Array.isArray(indexData.files)) {
            mallasFiles = indexData.files
            console.log('Usando archivos del index.json:', mallasFiles)
          }
        }
      } catch (error) {
        console.log('No se encontró index.json:', error)
      }
      
      console.log('Archivos finales a procesar:', mallasFiles)
      
      for (const file of mallasFiles) {
        try {
          console.log(`Cargando archivo: ${file}`)
          // En Nuxt, los archivos en public/ se sirven desde la raíz
          const url = `/mallas/${file}`
          const response = await fetch(url)
          
          if (response.ok) {
            const data = await response.json()
            console.log(`Datos de ${file}:`, data)
            if (data.info && data.info.codigo && data.info.nombre) {
              const mallaItem = {
                value: file.replace('.json', ''),
                label: `${data.info.codigo} - ${data.info.nombre}`,
                codigo: data.info.codigo,
                nombre: data.info.nombre,
                departamento: data.info.departamento || 'N/A',
                file: file
              }
              mallas.push(mallaItem)
              console.log(`Malla agregada:`, mallaItem)
            } else {
              console.warn(`Archivo ${file} no tiene la estructura esperada (info.codigo, info.nombre)`)
            }
          } else {
            console.warn(`No se pudo cargar ${file}: ${response.status}`)
          }
        } catch (error) {
          console.warn(`Error cargando malla ${file}:`, error)
        }
      }
      
      // Ordenar las mallas por código
      mallas.sort((a, b) => a.codigo.localeCompare(b.codigo))
      
      // Actualizar la instancia global
      globalAvailableMallas.value = mallas
      console.log('Mallas finales cargadas automáticamente:', mallas.length, mallas)
      
      return mallas
    } catch (error) {
      console.error('Error cargando mallas disponibles:', error)
      globalAvailableMallas.value = []
      return []
    } finally {
      isLoading = false
    }
  }

  const loadMallaData = async (carreraValue) => {
    if (!carreraValue) return null
    
    // Si es personalizado, devolver estructura base
    if (carreraValue === 'personalizado') {
      return {
        n1: [
          ['MATERIA DE EJEMPLO', 'XXXXX', []]
        ]
      }
    }
    
    try {
      // En Nuxt, los archivos en public/ se sirven desde la raíz
      const url = `/mallas/${carreraValue}.json`
      console.log('Intentando cargar URL:', url) // Debug
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // Devolver solo la parte de la malla, no la info
      return data.malla || data
    } catch (error) {
      console.error('Error cargando la malla:', error)
      return null
    }
  }

  const getCarreraTitle = (carreraValue) => {
    const malla = globalAvailableMallas.value?.find(m => m.value === carreraValue)
    return malla ? malla.nombre : ''
  }

  const getCarreraInfo = (carreraValue) => {
    const malla = globalAvailableMallas.value?.find(m => m.value === carreraValue)
    return malla ? {
      codigo: malla.codigo,
      nombre: malla.nombre,
      departamento: malla.departamento
    } : null
  }

  // No inicializar automáticamente aquí para evitar problemas de contexto
  // La inicialización se hará desde el componente

  return {
    availableMallas: globalAvailableMallas,
    loadMallaData,
    getCarreraTitle,
    getCarreraInfo,
    loadAvailableMallas
  }
}
