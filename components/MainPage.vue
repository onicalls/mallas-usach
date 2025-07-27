<template>
  <div class="main-container">
    <!-- Selector de carrera -->
    <CarreraSelector 
      :selected-carrera="selectedCarrera"
      :available-mallas="availableMallas"
      :is-simulating="isSimulating"
      :is-editing="isEditing"
      @carrera-changed="onCarreraChanged"
      @toggle-simulate="toggleSimulate"
      @toggle-edit="toggleEdit"
      @clear-simulation="clearCurrentSimulationCache"
    />

    <!-- Tabla de malla curricular -->
    <MallaTable 
      v-if="mallaData && selectedCarrera !== 'personalizado'"
      :malla-data="mallaData"
      :selected-materia="selectedMateria"
      :enabled-materias="enabledMaterias"
      :prerequisite-materias="prerequisiteMaterias"
      :is-simulating="isSimulating"
      :approved-materias="approvedMaterias"
      @materia-selected="selectMateria"
    />
    
    <!-- Tabla de malla personalizada -->
    <CustomMallaTable 
      v-if="mallaData && selectedCarrera === 'personalizado' && isEditing"
      :malla-data="mallaData"
      :selected-materia="selectedMateria"
      :enabled-materias="enabledMaterias"
      :prerequisite-materias="prerequisiteMaterias"
      :is-simulating="isSimulating"
      :approved-materias="approvedMaterias"
      @materia-selected="selectMateria"
      @malla-updated="updateCustomMalla"
    />
    
    <!-- Tabla de malla normal (para personalizada en modo no-editable) -->
    <MallaTable 
      v-if="mallaData && selectedCarrera === 'personalizado' && !isEditing"
      :malla-data="mallaData"
      :selected-materia="selectedMateria"
      :enabled-materias="enabledMaterias"
      :prerequisite-materias="prerequisiteMaterias"
      :is-simulating="isSimulating"
      :approved-materias="approvedMaterias"
      @materia-selected="selectMateria"
    />
    
    <!-- Leyenda -->
    <MallaLegend 
      v-if="mallaData"
      :is-simulating="isSimulating"
    />
  </div>
</template>

<script>
import CarreraSelector from './CarreraSelector.vue'
import MallaTable from './MallaTable.vue'
import MallaLegend from './MallaLegend.vue'
import CustomMallaTable from './CustomMallaTable.vue'
import { useMallas } from '~/composables/useMallas.js'

export default {
  name: 'MainPage',
  components: {
    CarreraSelector,
    MallaTable,
    MallaLegend,
    CustomMallaTable
  },
  data() {
    return {
      selectedCarrera: '',
      mallaData: null,
      selectedMateria: null,
      enabledMaterias: [],
      prerequisiteMaterias: [],
      isSimulating: false,
      approvedMaterias: [],
      isEditing: true
    }
  },
  setup() {
    // Usar una sola instancia del composable
    const mallasComposable = useMallas()
    
    return {
      mallasComposable
    }
  },
  computed: {
    availableMallas() {
      return this.mallasComposable.availableMallas.value || []
    }
  },
  watch: {
    // Guardar automáticamente cuando cambien las materias aprobadas
    approvedMaterias: {
      handler(newVal, oldVal) {
        if (this.selectedCarrera && this.isSimulating) {
          // Usar nextTick para asegurar que todos los cambios se hayan aplicado
          this.$nextTick(() => {
            this.saveCurrentSimulationState()
          })
        }
      },
      deep: true
    },
    // Guardar cuando cambie el estado de simulación
    isSimulating(newVal, oldVal) {
      if (this.selectedCarrera) {
        this.$nextTick(() => {
          this.saveCurrentSimulationState()
        })
      }
    },
    // Guardar cuando cambie la estructura de la malla personalizada
    mallaData: {
      handler(newVal, oldVal) {
        if (this.selectedCarrera === 'personalizado' && newVal) {
          this.$nextTick(() => {
            this.savePersonalizedData()
          })
        }
      },
      deep: true
    }
  },
  async mounted() {
    // Las mallas ya se cargan automáticamente en el composable
    // pero podemos forzar la carga si es necesario
    await this.mallasComposable.loadAvailableMallas()
  },
  beforeUnmount() {
    // Guardar estado antes de que el componente se desmonte
    this.saveCurrentSimulationState()
  },
  methods: {
    onCarreraChanged(carrera) {
      // Guardar estado actual antes de cambiar de malla
      this.saveCurrentSimulationState()
      
      this.selectedCarrera = carrera
      this.loadMallaData()
    },
    async loadMallaData() {
      this.mallaData = await this.mallasComposable.loadMallaData(this.selectedCarrera)
      
      // Cargar estado de simulación del caché para esta malla
      if (this.selectedCarrera && this.selectedCarrera !== 'personalizado') {
        const cachedState = this.mallasComposable.loadSimulationFromStorage(this.selectedCarrera)
        console.log(`Cargando estado para ${this.selectedCarrera}:`, cachedState)
        this.isSimulating = cachedState.isSimulating || false
        this.approvedMaterias = [...(cachedState.approvedMaterias || [])]
        
        if (this.isSimulating) {
          this.calculateEnabledFromApproved()
        }
      } else if (this.selectedCarrera === 'personalizado') {
        // Para malla personalizada, cargar estado de simulación también
        const cachedState = this.mallasComposable.loadSimulationFromStorage('personalizado')
        console.log(`Cargando estado personalizado:`, cachedState)
        this.isSimulating = cachedState.isSimulating || false
        this.approvedMaterias = [...(cachedState.approvedMaterias || [])]
        
        if (this.isSimulating) {
          this.calculateEnabledFromApproved()
        }
      } else {
        // Resetear estado si no hay carrera seleccionada
        this.isSimulating = false
        this.approvedMaterias = []
      }
      
      // Resetear selección cuando se cambie la malla
      this.selectedMateria = null
      this.enabledMaterias = this.isSimulating ? this.enabledMaterias : []
      this.prerequisiteMaterias = []
      this.isEditing = true
    },
    getCarreraTitle(carreraValue) {
      return this.mallasComposable.getCarreraTitle(carreraValue)
    },
    selectMateria(materia) {
      const [nombre, codigo, habilita] = materia
      
      if (this.isSimulating) {
        // Modo simulación: lógica de dos pasos
        if (this.approvedMaterias.includes(codigo)) {
          // Si ya está aprobada, desaprobarla
          this.approvedMaterias = this.approvedMaterias.filter(c => c !== codigo)
          this.selectedMateria = null
          this.prerequisiteMaterias = []
        } else if (this.selectedMateria === codigo) {
          // Si está seleccionada, aprobarla (segundo clic)
          this.approvedMaterias.push(codigo)
          this.selectedMateria = null
          this.prerequisiteMaterias = []
        } else {
          // Primer clic: seleccionar y mostrar prerrequisitos
          this.selectedMateria = codigo
          this.prerequisiteMaterias = this.findPrerequisites(codigo)
        }
        
        // Calcular materias habilitadas basado en las aprobadas
        this.calculateEnabledFromApproved()
        
        // El watcher se encargará de guardar automáticamente
      } else {
        // Modo normal: selección temporal
        if (this.selectedMateria === codigo) {
          this.clearSelection()
          return
        }
        
        this.selectedMateria = codigo
        
        if (habilita && Array.isArray(habilita)) {
          this.enabledMaterias = [...habilita]
        } else {
          this.enabledMaterias = []
        }
        
        this.prerequisiteMaterias = this.findPrerequisites(codigo)
      }
      
      console.log(`${this.isSimulating ? 'Simulación' : 'Selección'}: ${nombre} (${codigo})`)
    },
    clearSelection() {
      this.selectedMateria = null
      this.enabledMaterias = []
      this.prerequisiteMaterias = []
    },
    toggleSimulate() {
      // Guardar estado actual antes de cambiar
      this.saveCurrentSimulationState()
      
      this.isSimulating = !this.isSimulating
      this.clearSelection()
      
      if (this.isSimulating) {
        // Al activar simulación, cargar datos del caché
        if (this.selectedCarrera && this.selectedCarrera !== 'personalizado') {
          const cachedState = this.mallasComposable.loadSimulationFromStorage(this.selectedCarrera)
          this.approvedMaterias = [...(cachedState.approvedMaterias || [])]
        }
        // Mostrar materias sin prerrequisitos como habilitadas
        this.showMateriasWithoutPrerequisites()
        // También calcular habilitadas basado en aprobadas
        this.calculateEnabledFromApproved()
      } else {
        // Al desactivar simulación, NO limpiar aprobadas - mantener en caché
        // Solo limpiar la visualización
        this.enabledMaterias = []
      }
      
      // Guardar nuevo estado
      this.saveCurrentSimulationState()
    },
    // Método para guardar el estado actual de simulación
    saveCurrentSimulationState() {
      if (this.selectedCarrera && this.selectedCarrera !== 'personalizado') {
        const state = {
          isSimulating: this.isSimulating,
          approvedMaterias: [...this.approvedMaterias]
        }
        console.log(`Guardando estado actual para ${this.selectedCarrera}:`, state)
        console.log(`LocalStorage size: ${this.mallasComposable.getLocalStorageSize()} KB`)
        this.mallasComposable.updateSimulationState(this.selectedCarrera, state)
      } else if (this.selectedCarrera === 'personalizado') {
        // Para malla personalizada, guardar tanto la estructura como la simulación
        this.savePersonalizedData()
      }
    },
    // Método para guardar datos de la malla personalizada
    savePersonalizedData() {
      if (this.selectedCarrera === 'personalizado' && this.mallaData) {
        // Guardar estructura de la malla
        this.mallasComposable.saveCustomMalla(this.mallaData)
        
        // Guardar estado de simulación usando una clave especial
        const state = {
          isSimulating: this.isSimulating,
          approvedMaterias: [...this.approvedMaterias]
        }
        this.mallasComposable.updateSimulationState('personalizado', state)
        console.log('💾 Datos personalizados guardados:', { malla: this.mallaData, simulacion: state })
      }
    },
    toggleEdit() {
      this.isEditing = !this.isEditing
      // Al cambiar de modo, limpiar selecciones
      this.clearSelection()
    },
    showMateriasWithoutPrerequisites() {
      if (!this.mallaData) return
      
      const materiasWithoutPrereqs = []
      
      // Recorrer todas las materias para encontrar las que no tienen prerrequisitos
      for (const nivel in this.mallaData) {
        const materias = this.mallaData[nivel]
        
        for (const materia of materias) {
          const [nombre, codigo, habilita] = materia
          
          // Encontrar prerrequisitos de esta materia
          const prerequisitos = this.findPrerequisites(codigo)
          
          // Si no tiene prerrequisitos, agregarla a la lista de habilitadas
          if (prerequisitos.length === 0) {
            materiasWithoutPrereqs.push(codigo)
          }
        }
      }
      
      this.enabledMaterias = materiasWithoutPrereqs
    },
    calculateEnabledFromApproved() {
      if (!this.mallaData) return
      
      const allEnabled = new Set()
      
      // Recorrer todas las materias para verificar cuáles pueden habilitarse
      for (const nivel in this.mallaData) {
        const materias = this.mallaData[nivel]
        
        for (const materia of materias) {
          const [nombre, codigo, habilita] = materia
          
          // Solo procesar materias que no están ya aprobadas
          if (!this.approvedMaterias.includes(codigo)) {
            // Encontrar todos los prerrequisitos de esta materia
            const prerequisitos = this.findPrerequisites(codigo)
            
            // Si la materia no tiene prerrequisitos, siempre está habilitada en modo simulación
            if (prerequisitos.length === 0) {
              allEnabled.add(codigo)
            }
            // Si la materia tiene prerrequisitos, verificar que TODOS estén aprobados
            else {
              const todosPrerequisitosAprobados = prerequisitos.every(prereq => 
                this.approvedMaterias.includes(prereq)
              )
              
              // Solo habilitar si todos los prerrequisitos están aprobados
              if (todosPrerequisitosAprobados) {
                allEnabled.add(codigo)
              }
            }
          }
        }
      }
      
      this.enabledMaterias = Array.from(allEnabled)
    },
    getMateriaNombre(codigo) {
      if (!this.mallaData) return ''
      
      for (const nivel in this.mallaData) {
        const materia = this.mallaData[nivel].find(m => m[1] === codigo)
        if (materia) {
          return materia[0]
        }
      }
      return codigo
    },
    updateCustomMalla(updatedMalla) {
      this.mallaData = updatedMalla
      
      // Guardar automáticamente la malla personalizada actualizada
      this.savePersonalizedData()
      
      // Resetear estados cuando se modifica la malla
      this.selectedMateria = null
      this.enabledMaterias = []
      this.prerequisiteMaterias = []
      
      // Si está en modo simulación, recalcular materias habilitadas
      if (this.isSimulating) {
        this.showMateriasWithoutPrerequisites()
        this.calculateEnabledFromApproved()
      }
    },
    findPrerequisites(codigoSeleccionado) {
      if (!this.mallaData) return []
      
      const prerequisites = []
      
      // Buscar en todos los niveles
      for (const nivel in this.mallaData) {
        const materias = this.mallaData[nivel]
        
        for (const materia of materias) {
          const [nombre, codigo, habilita] = materia
          
          // Si esta materia habilita la seleccionada, agregarla a prerequisites
          if (habilita && Array.isArray(habilita) && habilita.includes(codigoSeleccionado)) {
            prerequisites.push(codigo)
          }
        }
      }
      
      return prerequisites
    },
    // Método para limpiar caché de simulación de la malla actual
    clearCurrentSimulationCache() {
      if (this.selectedCarrera && this.selectedCarrera !== 'personalizado') {
        this.mallasComposable.clearSimulationCache(this.selectedCarrera)
        // Resetear estado local
        this.approvedMaterias = []
        this.isSimulating = false
        this.clearSelection()
        this.calculateEnabledFromApproved()
      } else if (this.selectedCarrera === 'personalizado') {
        // Para malla personalizada, limpiar tanto la simulación como la estructura
        this.mallasComposable.clearSimulationCache('personalizado')
        this.mallasComposable.clearCustomMalla()
        
        // Resetear a estructura base
        this.mallaData = {
          n1: [
            ['MATERIA DE EJEMPLO', 'XXXXX', []]
          ]
        }
        this.approvedMaterias = []
        this.isSimulating = false
        this.clearSelection()
        this.calculateEnabledFromApproved()
      }
    }
  }
}
</script>

<style scoped>
.main-container {
  width: 100%;
}
</style>