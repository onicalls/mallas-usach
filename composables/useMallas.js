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
      let mallasFiles = []
      const mallas = []
      
      // Estrategia 1: Intentar cargar desde index.json (lista manual actualizable)
      try {
        const indexURL = buildURL('/mallas/index.json')
        const indexResponse = await fetch(indexURL)
        if (indexResponse.ok) {
          const indexData = await indexResponse.json()
          if (indexData.files && Array.isArray(indexData.files)) {
            mallasFiles = indexData.files
          }
        }
      } catch (error) {
        alert('Advertencia: No se pudo cargar el índice de mallas.\n\nSe utilizará un método alternativo para cargar las mallas disponibles.')
      }
      
      
      for (const file of mallasFiles) {
        try {
          // Construir URL correcta con baseURL
          const url = buildURL(`/mallas/${file}`)
          const response = await fetch(url)
          
          if (response.ok) {
            const data = await response.json()
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
            } else {
              alert(`Advertencia: La malla ${file} tiene datos incompletos y será omitida.`)
            }
          } else {
            alert(`Error: No se pudo cargar la malla ${file}.\n\nRespuesta del servidor: ${response.status}`)
          }
        } catch (error) {
          alert(`Error: No se pudo procesar la malla ${file}.\n\nDetalles: ${error.message}`)
        }
      }
      
      // Ordenar las mallas por código
      mallas.sort((a, b) => a.codigo.localeCompare(b.codigo))
      
      // Actualizar la instancia global
      globalAvailableMallas.value = mallas
      
      return mallas
    } catch (error) {
      alert('Error crítico: No se pudieron cargar las mallas disponibles.\n\nPor favor, recargue la página e inténtelo de nuevo.')
      globalAvailableMallas.value = []
      return []
    } finally {
      isLoading = false
    }
  }

  const loadMallaData = async (carreraValue) => {
    if (!carreraValue) return null
    
    // Si es personalizado, cargar desde localStorage o devolver estructura base
    if (carreraValue === 'personalizado') {
      return loadCustomMalla()
    }
    
    try {
      // Construir URL correcta con baseURL
      const url = buildURL(`/mallas/${carreraValue}.json`)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // Devolver solo la parte de la malla, no la info
      return data.malla || data
    } catch (error) {
      alert(`Error: No se pudo cargar la malla seleccionada.\n\nDetalles: ${error.message}`)
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
      alert('Advertencia: El almacenamiento local no está disponible.\n\nAlgunas funcionalidades pueden verse limitadas.')
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
      alert('Advertencia: No se pudo calcular el tamaño del almacenamiento local.')
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
    
   
    // Guardar en localStorage para persistencia
    try {
      if (!checkLocalStorageQuota()) {
        throw new Error('localStorage no disponible')
      }
      
      const storageSize = getLocalStorageSize()
      
      localStorage.setItem(`malla_simulation_${mallaId}`, JSON.stringify(updatedState))
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
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
        } catch (retryError) {
          alert('Advertencia: No se pudo guardar el progreso de la simulación.\n\nEs posible que se pierda al refrescar la página.')
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
        simulationCache.value.set(mallaId, state)
        return state
      } else {
        // No hay datos guardados, continuar con estado inicial
      }
    } catch (error) {
      alert('Advertencia: No se pudieron cargar los datos de simulación guardados.\n\nSe iniciará con un estado limpio.')
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
        alert('Advertencia: No se pudo limpiar completamente la caché de simulación del almacenamiento local.')
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
        alert('Advertencia: No se pudo limpiar completamente toda la caché de simulación del almacenamiento local.')
      }
    }
  }

  // Funciones para manejar el caché de malla personalizada
  const saveCustomMalla = (mallaData) => {
    try {
      if (!checkLocalStorageQuota()) {
        throw new Error('localStorage no disponible')
      }
      
      localStorage.setItem('custom_malla_data', JSON.stringify(mallaData))
    } catch (error) {
      alert('Error: No se pudo guardar la malla personalizada.\n\nPor favor, verifique que el navegador permita el almacenamiento local.')
    }
  }
  
  const loadCustomMalla = () => {
    try {
      const stored = localStorage.getItem('custom_malla_data')
      if (stored) {
        const mallaData = JSON.parse(stored)
        return mallaData
      } else {
        // No hay malla personalizada guardada, usar estructura base
      }
    } catch (error) {
      alert('Advertencia: No se pudo cargar la malla personalizada guardada.\n\nSe utilizará una malla de ejemplo.')
    }
    
    // Devolver estructura base si no hay datos guardados
    return {
      n1: [
        ['MATERIA DE EJEMPLO', 'XXXXX', []]
      ]
    }
  }
  
  const clearCustomMalla = () => {
    try {
      localStorage.removeItem('custom_malla_data')
    } catch (error) {
      alert('Advertencia: No se pudo eliminar completamente la malla personalizada del almacenamiento local.')
    }
  }

  // Función de debugging para ver el estado del caché
  const debugCacheState = () => {
    
    const localStorageKeys = []
    let customMallaData = null
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('malla_simulation_')) {
          const value = localStorage.getItem(key)
          localStorageKeys.push({ key, value: JSON.parse(value) })
        } else if (key === 'custom_malla_data') {
          customMallaData = JSON.parse(localStorage.getItem(key))
        }
      }
      if (customMallaData) {
        // Datos de malla personalizada encontrados
      }
    } catch (error) {
      alert('Error de depuración: No se pudo analizar el estado de la caché.')
    }
    
  }

  // Funciones para recordar la última malla seleccionada
  const saveLastSelectedMalla = (mallaId) => {
    try {
      if (!checkLocalStorageQuota()) {
        return
      }
      localStorage.setItem('last_selected_malla', mallaId)
    } catch (error) {
      console.warn('No se pudo guardar la última malla seleccionada:', error)
    }
  }

  const getLastSelectedMalla = () => {
    try {
      if (!checkLocalStorageQuota()) {
        return null
      }
      return localStorage.getItem('last_selected_malla')
    } catch (error) {
      console.warn('No se pudo cargar la última malla seleccionada:', error)
      return null
    }
  }

  const clearLastSelectedMalla = () => {
    try {
      localStorage.removeItem('last_selected_malla')
    } catch (error) {
      console.warn('No se pudo limpiar la última malla seleccionada:', error)
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
    // Funciones de caché de malla personalizada
    saveCustomMalla,
    loadCustomMalla,
    clearCustomMalla,
    // Funciones para recordar la última malla
    saveLastSelectedMalla,
    getLastSelectedMalla,
    clearLastSelectedMalla,
    // Funciones de diagnóstico
    checkLocalStorageQuota,
    getLocalStorageSize,
    debugCacheState
  }
}
