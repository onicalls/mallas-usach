import { ref } from 'vue'

// Instancia global para compartir entre componentes
const globalAvailableMallas = ref([])
let isLoading = false

// Caché global para el estado de simulación por malla
const simulationCache = ref(new Map())

export const useMallas = () => {
  // Obtener la configuración del runtime de Nuxt
  const config = useRuntimeConfig()
  const baseURL = config.app?.baseURL || '/'
  
  // Función helper para construir URLs correctas
  const buildURL = (path) => {
    // Asegurar que path comience con /
    if (!path.startsWith('/')) {
      path = '/' + path
    }
    // Si baseURL termina con /, no duplicar
    const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
    return cleanBaseURL + path
  }
  
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
        const indexURL = buildURL('/mallas/index.json')
        console.log('URL del index:', indexURL)
        const indexResponse = await fetch(indexURL)
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
          // Construir URL correcta con baseURL
          const url = buildURL(`/mallas/${file}`)
          console.log(`URL completa: ${url}`)
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
      // Construir URL correcta con baseURL
      const url = buildURL(`/mallas/${carreraValue}.json`)
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

  // Funciones para manejar el caché de simulación
  const getSimulationState = (mallaId) => {
    if (!mallaId) return { approvedMaterias: [], isSimulating: false }
    
    if (!simulationCache.value.has(mallaId)) {
      simulationCache.value.set(mallaId, {
        approvedMaterias: [],
        isSimulating: false
      })
    }
    
    return simulationCache.value.get(mallaId)
  }
  
  const updateSimulationState = (mallaId, newState) => {
    if (!mallaId) return
    
    const currentState = getSimulationState(mallaId)
    const updatedState = { ...currentState, ...newState }
    simulationCache.value.set(mallaId, updatedState)
    
    // Guardar en localStorage para persistencia
    try {
      localStorage.setItem(`malla_simulation_${mallaId}`, JSON.stringify(updatedState))
    } catch (error) {
      console.warn('No se pudo guardar en localStorage:', error)
    }
  }
  
  const loadSimulationFromStorage = (mallaId) => {
    if (!mallaId) return
    
    try {
      const stored = localStorage.getItem(`malla_simulation_${mallaId}`)
      if (stored) {
        const state = JSON.parse(stored)
        simulationCache.value.set(mallaId, state)
        return state
      }
    } catch (error) {
      console.warn('No se pudo cargar desde localStorage:', error)
    }
    
    return getSimulationState(mallaId)
  }
  
  const clearSimulationCache = (mallaId = null) => {
    if (mallaId) {
      // Limpiar caché de una malla específica
      simulationCache.value.delete(mallaId)
      try {
        localStorage.removeItem(`malla_simulation_${mallaId}`)
      } catch (error) {
        console.warn('No se pudo limpiar localStorage:', error)
      }
    } else {
      // Limpiar todo el caché
      simulationCache.value.clear()
      try {
        // Limpiar todas las claves de simulación del localStorage
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('malla_simulation_')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('No se pudo limpiar localStorage:', error)
      }
    }
  }

  // No inicializar automáticamente aquí para evitar problemas de contexto
  // La inicialización se hará desde el componente

  return {
    availableMallas: globalAvailableMallas,
    loadMallaData,
    getCarreraTitle,
    getCarreraInfo,
    loadAvailableMallas,
    // Funciones de caché de simulación
    getSimulationState,
    updateSimulationState,
    loadSimulationFromStorage,
    clearSimulationCache
  }
}
