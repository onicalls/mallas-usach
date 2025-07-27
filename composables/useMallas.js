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
  const checkLocalStorageQuota = () => {
    try {
      const test = 'localStorage_test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      console.warn('localStorage no está disponible o está lleno:', e)
      return false
    }
  }
  
  const getLocalStorageSize = () => {
    let total = 0
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }
      return Math.round(total / 1024) // KB
    } catch (e) {
      return 0
    }
  }
  
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
    
    console.log(`Guardando estado de simulación para ${mallaId}:`, updatedState)
    
    // Guardar en localStorage para persistencia
    try {
      if (!checkLocalStorageQuota()) {
        throw new Error('localStorage no disponible')
      }
      
      const storageSize = getLocalStorageSize()
      console.log(`Tamaño actual del localStorage: ${storageSize} KB`)
      
      localStorage.setItem(`malla_simulation_${mallaId}`, JSON.stringify(updatedState))
      console.log(`Estado guardado en localStorage para ${mallaId}`)
    } catch (error) {
      console.warn('No se pudo guardar en localStorage:', error)
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage lleno, limpiando datos antiguos...')
        // Intentar limpiar datos antiguos y volver a intentar
        try {
          const keysToRemove = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('malla_simulation_') && key !== `malla_simulation_${mallaId}`) {
              keysToRemove.push(key)
            }
          }
          // Remover la mitad de los datos más antiguos
          keysToRemove.slice(0, Math.ceil(keysToRemove.length / 2)).forEach(key => {
            localStorage.removeItem(key)
          })
          // Intentar guardar de nuevo
          localStorage.setItem(`malla_simulation_${mallaId}`, JSON.stringify(updatedState))
          console.log(`Estado guardado después de limpiar localStorage para ${mallaId}`)
        } catch (retryError) {
          console.error('No se pudo guardar incluso después de limpiar:', retryError)
        }
      }
    }
  }
  
  const loadSimulationFromStorage = (mallaId) => {
    if (!mallaId) return { approvedMaterias: [], isSimulating: false }
    
    try {
      const stored = localStorage.getItem(`malla_simulation_${mallaId}`)
      if (stored) {
        const state = JSON.parse(stored)
        console.log(`Cargando estado de simulación para ${mallaId}:`, state)
        simulationCache.value.set(mallaId, state)
        return state
      }
    } catch (error) {
      console.warn('No se pudo cargar desde localStorage:', error)
    }
    
    // Si no hay datos guardados, devolver estado inicial
    const initialState = { approvedMaterias: [], isSimulating: false }
    simulationCache.value.set(mallaId, initialState)
    return initialState
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
    clearSimulationCache,
    // Funciones de diagnóstico
    checkLocalStorageQuota,
    getLocalStorageSize
  }
}
