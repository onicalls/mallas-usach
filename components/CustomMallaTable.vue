<template>
  <div v-if="mallaData" class="custom-malla-container">
    <!-- Formulario de información de la malla -->
    <div class="malla-info-form">
      <h3 class="form-title">Información de la Malla Personalizada</h3>
      <div class="form-row">
        <div class="form-group">
          <label for="codigo-malla">Código de la Malla:</label>
          <input 
            id="codigo-malla"
            v-model="mallaInfo.codigo"
            type="text"
            class="form-input"
            placeholder="Ej: 21041"
            maxlength="10"
          />
        </div>
        <div class="form-group">
          <label for="nombre-malla">Nombre de la Malla:</label>
          <input 
            id="nombre-malla"
            v-model="mallaInfo.nombre"
            type="text"
            class="form-input"
            placeholder="Ej: INGENIERÍA DE EJECUCIÓN EN COMPUTACIÓN E INFORMÁTICA"
          />
        </div>
        <div class="form-group">
          <label for="departamento-malla">Departamento:</label>
          <input 
            id="departamento-malla"
            v-model="mallaInfo.departamento"
            type="text"
            class="form-input"
            placeholder="Ej: INFORMÁTICA"
          />
        </div>
      </div>
    </div>

    <!-- Tabla de la malla -->
    <div class="table-container">
      <div class="table-wrapper">
        <table class="malla-table">
        <thead>
          <tr>
            <th v-for="(materias, nivel) in mallaData" :key="nivel" class="nivel-header">
              <div class="nivel-header-content">
                {{ nivel.toUpperCase().replace('N', 'NIVEL ') }}
                <button 
                  v-if="nivel === getLastLevel()" 
                  @click="addNewLevel" 
                  class="add-level-btn"
                  title="Agregar nuevo nivel"
                >
                  +
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="(materias, nivel) in mallaData" :key="nivel" class="nivel-column">
              <div 
                v-for="(materia, index) in materias" 
                :key="`${nivel}-${index}`"
                class="materia editable"
                :class="{
                  'approved': isSimulating && approvedMaterias.includes(materia[1]),
                  'prerequisite': prerequisiteMaterias.includes(materia[1]) && !approvedMaterias.includes(materia[1]),
                  'selected': selectedMateria === materia[1],
                  'enabled': enabledMaterias.includes(materia[1]) && !prerequisiteMaterias.includes(materia[1]) && selectedMateria !== materia[1] && (!isSimulating || !approvedMaterias.includes(materia[1]))
                }"
                @click="!isEditing ? $emit('materia-selected', materia) : null"
              >
                <div class="codigo-container">
                  <input 
                    v-if="editingMateria === `${nivel}-${index}-codigo`"
                    v-model="tempEditValue"
                    @blur="saveEdit(nivel, index, 'codigo')"
                    @keyup.enter="saveEdit(nivel, index, 'codigo')"
                    @keyup.escape="cancelEdit"
                    class="codigo-input"
                    ref="codigoInput"
                  />
                  <div 
                    v-else
                    class="codigo"
                    @click.stop="startEdit(nivel, index, 'codigo', materia[1])"
                  >
                    {{ materia[1] }}
                  </div>
                </div>
                
                <div class="nombre-container">
                  <textarea 
                    v-if="editingMateria === `${nivel}-${index}-nombre`"
                    v-model="tempEditValue"
                    @blur="saveEdit(nivel, index, 'nombre')"
                    @keyup.enter="saveEdit(nivel, index, 'nombre')"
                    @keyup.escape="cancelEdit"
                    class="nombre-input"
                    ref="nombreInput"
                    rows="2"
                  ></textarea>
                  <div 
                    v-else
                    class="nombre"
                    @click.stop="startEdit(nivel, index, 'nombre', materia[0])"
                  >
                    {{ materia[0] }}
                  </div>
                </div>
                
                <!-- Sección de materias que habilita -->
                <div class="habilita-container">
                  <div class="habilita-header">
                    <span class="habilita-label">Habilita:</span>
                    <button 
                      @click.stop="addHabilitaCode(nivel, index)"
                      class="add-habilita-btn"
                      title="Agregar código que habilita"
                    >
                      +
                    </button>
                  </div>
                  
                  <div class="habilita-codes">
                    <div 
                      v-for="(codigo, habilitaIndex) in (materia[2] || [])" 
                      :key="`${nivel}-${index}-habilita-${habilitaIndex}`"
                      class="habilita-code-item"
                    >
                      <input 
                        v-if="editingMateria === `${nivel}-${index}-habilita-${habilitaIndex}`"
                        v-model="tempEditValue"
                        @blur="saveHabilitaEdit(nivel, index, habilitaIndex)"
                        @keyup.enter="saveHabilitaEdit(nivel, index, habilitaIndex)"
                        @keyup.escape="cancelEdit"
                        class="habilita-input"
                        ref="habilitaInput"
                      />
                      <div 
                        v-else
                        class="habilita-code"
                        @click.stop="startEdit(nivel, index, `habilita-${habilitaIndex}`, codigo)"
                      >
                        {{ codigo }}
                      </div>
                      <button 
                        @click.stop="removeHabilitaCode(nivel, index, habilitaIndex)"
                        class="remove-habilita-btn"
                        title="Eliminar código"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click.stop="deleteMateria(nivel, index)"
                  class="delete-materia-btn"
                  title="Eliminar materia"
                >
                  ×
                </button>
              </div>
              
              <!-- Botón para agregar nueva materia -->
              <button 
                @click="addNewMateria(nivel)"
                class="add-materia-btn"
                title="Agregar nueva materia"
              >
                + Agregar Materia
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
    
    <!-- Leyenda -->
    <MallaLegend 
      :is-simulating="isSimulating"
    />
    
    <!-- Botón de exportar JSON -->
    <div class="export-section">
      <div class="export-buttons">
        <button 
          @click="triggerImport"
          class="import-btn"
          title="Importar malla desde archivo JSON"
        >
          📤 Importar JSON
        </button>
        
        <button 
          @click="exportMallaAsJSON"
          class="export-btn"
          :disabled="!canExport"
          title="Exportar malla como archivo JSON"
        >
          📥 Exportar como JSON
        </button>
        
        <button 
          @click="clearCache"
          class="clear-cache-btn"
          title="Limpiar datos guardados"
        >
          🗑️ Limpiar Cache
        </button>
      </div>
      
      <!-- Input file oculto para importar -->
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        @change="handleFileImport"
        style="display: none"
      />
      
      <p v-if="!canExport" class="export-warning">
        Complete la información de la malla (código, nombre y departamento) para poder exportar
      </p>
      
      <p class="cache-info">
        💾 Los cambios se guardan automáticamente y persisten entre recargas de página
      </p>
    </div>
  </div>
</template>

<script>
import MallaLegend from './MallaLegend.vue'

export default {
  name: 'CustomMallaTable',
  components: {
    MallaLegend
  },
  props: {
    mallaData: {
      type: Object,
      default: null
    },
    selectedMateria: {
      type: String,
      default: null
    },
    enabledMaterias: {
      type: Array,
      default: () => []
    },
    prerequisiteMaterias: {
      type: Array,
      default: () => []
    },
    isSimulating: {
      type: Boolean,
      default: false
    },
    approvedMaterias: {
      type: Array,
      default: () => []
    }
  },
  emits: ['materia-selected', 'malla-updated'],
  data() {
    return {
      editingMateria: null,
      tempEditValue: '',
      materiaCounter: 1,
      mallaInfo: {
        codigo: '',
        nombre: '',
        departamento: ''
      }
    }
  },
  watch: {
    // Guardar información de la malla cuando cambie
    mallaInfo: {
      handler(newValue) {
        this.saveToLocalStorage('mallaInfo', newValue)
      },
      deep: true
    },
    // Guardar datos de la malla cuando cambien
    mallaData: {
      handler(newValue) {
        if (newValue) {
          this.saveToLocalStorage('mallaData', newValue)
        }
      },
      deep: true
    }
  },
  mounted() {
    // Cargar datos guardados al montar el componente
    this.loadFromLocalStorage()
  },
  computed: {
    isEditing() {
      return this.editingMateria !== null
    },
    canExport() {
      return this.mallaInfo.codigo.trim() !== '' && 
             this.mallaInfo.nombre.trim() !== '' && 
             this.mallaInfo.departamento.trim() !== ''
    }
  },
  methods: {
    // Métodos para localStorage
    saveToLocalStorage(key, data) {
      try {
        const fullKey = `custom-malla-${key}`
        localStorage.setItem(fullKey, JSON.stringify(data))
      } catch (error) {
        alert('Error: No se pudo guardar los datos localmente.\n\nEs posible que el navegador tenga el almacenamiento local deshabilitado o lleno.')
      }
    },
    
    loadFromLocalStorage() {
      try {
        // Cargar información de la malla
        const savedMallaInfo = localStorage.getItem('custom-malla-mallaInfo')
        if (savedMallaInfo) {
          this.mallaInfo = { ...this.mallaInfo, ...JSON.parse(savedMallaInfo) }
        }
        
        // Cargar datos de la malla si existe
        const savedMallaData = localStorage.getItem('custom-malla-mallaData')
        if (savedMallaData) {
          const parsedData = JSON.parse(savedMallaData)
          // Emitir los datos cargados al componente padre
          this.$emit('malla-updated', parsedData)
        }
      } catch (error) {
        alert('Error: No se pudieron cargar los datos guardados localmente.\n\nEs posible que los datos estén corruptos o el navegador tenga restricciones de acceso.')
      }
    },
    
    clearLocalStorage() {
      try {
        localStorage.removeItem('custom-malla-mallaInfo')
        localStorage.removeItem('custom-malla-mallaData')
      } catch (error) {
        alert('Error: No se pudieron limpiar los datos guardados localmente.\n\nEs posible que el navegador tenga restricciones de acceso al almacenamiento local.')
      }
    },
    
    getLastLevel() {
      const levels = Object.keys(this.mallaData).sort((a, b) => {
        const numA = parseInt(a.replace('n', ''))
        const numB = parseInt(b.replace('n', ''))
        return numA - numB
      })
      return levels[levels.length - 1]
    },
    
    addNewLevel() {
      const lastLevelNum = parseInt(this.getLastLevel().replace('n', ''))
      const newLevelKey = `n${lastLevelNum + 1}`
      
      const updatedMalla = { ...this.mallaData }
      updatedMalla[newLevelKey] = [
        ['MATERIA DE EJEMPLO', 'XXXXX', []]
      ]
      
      this.$emit('malla-updated', updatedMalla)
    },
    
    addNewMateria(nivel) {
      this.materiaCounter++
      const newMateria = ['MATERIA DE EJEMPLO', `XXXXX${this.materiaCounter}`, []]
      
      const updatedMalla = { ...this.mallaData }
      updatedMalla[nivel] = [...updatedMalla[nivel], newMateria]
      
      this.$emit('malla-updated', updatedMalla)
    },
    
    deleteMateria(nivel, index) {
      const updatedMalla = { ...this.mallaData }
      updatedMalla[nivel] = updatedMalla[nivel].filter((_, i) => i !== index)
      
      // Si el nivel queda vacío y no es n1, eliminarlo
      if (updatedMalla[nivel].length === 0 && nivel !== 'n1') {
        delete updatedMalla[nivel]
      }
      
      this.$emit('malla-updated', updatedMalla)
    },
    
    addHabilitaCode(nivel, index) {
      const updatedMalla = { ...this.mallaData }
      if (!updatedMalla[nivel][index][2]) {
        updatedMalla[nivel][index][2] = []
      }
      updatedMalla[nivel][index][2].push('CÓDIGO')
      
      this.$emit('malla-updated', updatedMalla)
    },
    
    removeHabilitaCode(nivel, index, habilitaIndex) {
      const updatedMalla = { ...this.mallaData }
      updatedMalla[nivel][index][2].splice(habilitaIndex, 1)
      
      this.$emit('malla-updated', updatedMalla)
    },
    
    saveHabilitaEdit(nivel, index, habilitaIndex) {
      if (this.tempEditValue.trim() === '') {
        this.cancelEdit()
        return
      }
      
      const updatedMalla = { ...this.mallaData }
      updatedMalla[nivel][index][2][habilitaIndex] = this.tempEditValue.trim().toUpperCase()
      
      this.$emit('malla-updated', updatedMalla)
      this.cancelEdit()
    },
    
    startEdit(nivel, index, field, currentValue) {
      this.editingMateria = `${nivel}-${index}-${field}`
      this.tempEditValue = currentValue
      
      this.$nextTick(() => {
        let inputRef = 'nombreInput'
        if (field === 'codigo') {
          inputRef = 'codigoInput'
        } else if (field.startsWith('habilita-')) {
          inputRef = 'habilitaInput'
        }
        
        const input = this.$refs[inputRef]?.[0] || this.$refs[inputRef]
        if (input) {
          input.focus()
          input.select()
        }
      })
    },
    
    saveEdit(nivel, index, field) {
      if (this.tempEditValue.trim() === '') {
        this.cancelEdit()
        return
      }
      
      const updatedMalla = { ...this.mallaData }
      
      // Si es un campo de habilita, usar el método específico
      if (field.startsWith('habilita-')) {
        const habilitaIndex = parseInt(field.split('-')[1])
        this.saveHabilitaEdit(nivel, index, habilitaIndex)
        return
      }
      
      const fieldIndex = field === 'nombre' ? 0 : 1
      // Convertir a mayúsculas antes de guardar
      updatedMalla[nivel][index][fieldIndex] = this.tempEditValue.trim().toUpperCase()
      
      this.$emit('malla-updated', updatedMalla)
      this.cancelEdit()
    },
    
    cancelEdit() {
      this.editingMateria = null
      this.tempEditValue = ''
    },
    
    exportMallaAsJSON() {
      if (!this.canExport) {
        alert('Por favor complete todos los campos de información de la malla antes de exportar.')
        return
      }
      
      // Crear la estructura JSON completa
      const mallaCompleta = {
        info: {
          codigo: this.mallaInfo.codigo.trim().toUpperCase(),
          nombre: this.mallaInfo.nombre.trim().toUpperCase(),
          departamento: this.mallaInfo.departamento.trim().toUpperCase()
        },
        malla: { ...this.mallaData }
      }
      
      // Convertir a JSON con formato bonito
      const jsonString = JSON.stringify(mallaCompleta, null, 2)
      
      // Crear archivo para descarga
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Crear nombre de archivo basado en el código
      const fileName = `${this.mallaInfo.codigo.toLowerCase().replace(/\s+/g, '-')}.json`
      
      // Crear enlace temporal para descarga
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      
      // Limpiar
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Preguntar si quiere limpiar el cache después de exportar
      const shouldClearCache = confirm(
        `Malla exportada exitosamente como ${fileName}\n\n¿Desea limpiar el cache y empezar una nueva malla?`
      )
      
      if (shouldClearCache) {
        this.clearCache()
        // Resetear la malla a estado inicial
        this.$emit('malla-updated', {
          n1: [['MATERIA DE EJEMPLO', 'XXXXX', []]]
        })
      }
    },
    
    clearCache() {
      const confirmed = confirm(
        '¿Está seguro de que desea limpiar todos los datos guardados?\n\nEsto eliminará:\n- Información de la malla (código, nombre, departamento)\n- Todos los datos de materias creadas\n\nEsta acción no se puede deshacer.'
      )
      
      if (confirmed) {
        this.clearLocalStorage()
        
        // Resetear datos locales
        this.mallaInfo = {
          codigo: '',
          nombre: '',
          departamento: ''
        }
        
        // Resetear la malla a estado inicial
        this.$emit('malla-updated', {
          n1: [['MATERIA DE EJEMPLO', 'XXXXX', []]]
        })
        
        alert('Cache limpiado exitosamente. La malla se ha reiniciado.')
      }
    },
    
    triggerImport() {
      // Activar el input file
      this.$refs.fileInput.click()
    },
    
    handleFileImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // Verificar que sea un archivo JSON
      if (!file.name.toLowerCase().endsWith('.json')) {
        alert('Por favor seleccione un archivo JSON válido.')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result)
          this.importMallaFromJSON(jsonData)
        } catch (error) {
          alert('Error: El archivo no contiene un JSON válido.\n\nPor favor verifique el formato del archivo.')
        }
      }
      
      reader.onerror = () => {
        alert('Error: No se pudo leer el archivo.')
      }
      
      reader.readAsText(file)
      
      // Limpiar el input para permitir reimportar el mismo archivo
      event.target.value = ''
    },
    
    importMallaFromJSON(jsonData) {
      try {
        // Validar estructura del JSON
        if (!this.validateMallaStructure(jsonData)) {
          return
        }
        
        // Confirmar importación
        const mallaName = jsonData.info?.nombre || 'Malla sin nombre'
        const confirmed = confirm(
          `¿Desea importar la malla:\n"${mallaName}"?\n\nEsto reemplazará todos los datos actuales.`
        )
        
        if (!confirmed) return
        
        // Importar información de la malla
        if (jsonData.info) {
          this.mallaInfo = {
            codigo: jsonData.info.codigo || '',
            nombre: jsonData.info.nombre || '',
            departamento: jsonData.info.departamento || ''
          }
        }
        
        // Importar datos de la malla
        if (jsonData.malla) {
          this.$emit('malla-updated', jsonData.malla)
        }
        
        // Guardar en localStorage
        this.saveToLocalStorage('mallaInfo', this.mallaInfo)
        this.saveToLocalStorage('mallaData', jsonData.malla)
        
        alert(`Malla "${mallaName}" importada exitosamente!`)
        
      } catch (error) {
        alert('Error: No se pudo importar la malla.\n\nVerifique que el archivo tenga el formato correcto.')
      }
    },
    
    validateMallaStructure(jsonData) {
      // Verificar estructura básica
      if (!jsonData || typeof jsonData !== 'object') {
        alert('Error: El archivo no contiene un objeto JSON válido.')
        return false
      }
      
      // Verificar sección info
      if (!jsonData.info) {
        alert('Error: El archivo no contiene la sección "info" requerida.')
        return false
      }
      
      if (!jsonData.info.codigo || !jsonData.info.nombre) {
        alert('Error: La sección "info" debe contener al menos "codigo" y "nombre".')
        return false
      }
      
      // Verificar sección malla
      if (!jsonData.malla || typeof jsonData.malla !== 'object') {
        alert('Error: El archivo no contiene la sección "malla" requerida.')
        return false
      }
      
      // Verificar que tenga al menos un nivel
      const niveles = Object.keys(jsonData.malla)
      if (niveles.length === 0) {
        alert('Error: La malla debe contener al menos un nivel (ej: "n1").')
        return false
      }
      
      // Verificar estructura de niveles
      for (const nivel of niveles) {
        if (!Array.isArray(jsonData.malla[nivel])) {
          alert(`Error: El nivel "${nivel}" debe ser un array de materias.`)
          return false
        }
        
        // Verificar estructura de materias
        for (let i = 0; i < jsonData.malla[nivel].length; i++) {
          const materia = jsonData.malla[nivel][i]
          if (!Array.isArray(materia) || materia.length < 2) {
            alert(`Error: La materia ${i + 1} del ${nivel} no tiene el formato correcto.\nFormato esperado: ["NOMBRE", "CODIGO", ["prerequisitos"]]`)
            return false
          }
        }
      }
      
      return true
    }
  }
}
</script>

<style scoped>
.custom-malla-container {
  width: 100%;
}

/* Estilos para el formulario de información */
.malla-info-form {
  background-color: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.form-title {
  color: #009149;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
  text-transform: uppercase;
}

.form-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  color: #374151;
  margin-bottom: 5px;
  font-size: 14px;
}

.form-input {
  padding: 10px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  text-transform: uppercase;
}

.form-input:focus {
  outline: none;
  border-color: #009149;
  box-shadow: 0 0 0 3px rgba(0, 145, 73, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
  text-transform: none;
}

/* Estilos para la sección de exportación */
.export-section {
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.export-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.export-btn {
  background-color: #009149;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.export-btn:hover:not(:disabled) {
  background-color: #007a3d;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 145, 73, 0.3);
}

.export-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.import-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.import-btn:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.clear-cache-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.clear-cache-btn:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.export-warning {
  color: #dc2626;
  font-size: 14px;
  margin-top: 10px; 
}

.cache-info {
  color: #059669;
  font-size: 13px;
}

.table-container {
  text-align: center;
  width: 100%;
}

.table-wrapper {
  overflow-x: auto;
  width: 99%;
  padding-left: 6px;
}

.malla-table {
  border-collapse: separate;
  border-spacing: 5px;
  width: auto;
  display: table;
  text-transform: uppercase;
  font-family: 'Arial', 'Helvetica', sans-serif;
  margin: 0 auto;
  min-width: 100%;
}

.malla-table th {
  text-align: center;
  font-weight: bold;
  border: 1px;
  width: 200px;
  font-size: clamp(10px, 1vw, 15px);
}

.nivel-header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.add-level-btn {
  background-color: #009149;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.add-level-btn:hover {
  background-color: #007a3d;
}

.malla-table td {
  border: 1px;
  vertical-align: top;
  border-radius: 8px;
  width: 200px;
}

.nivel-column {
  position: relative;
}

.materia {
  background-color: #f8fafc;
  border: 2px solid transparent;
  border-radius: 8px;
  margin: 5px 0;
  text-align: center;
  font-size: clamp(8px, 1vw, 12px);
  font-family: 'Arial', sans-serif;
  transition: all 0.3s ease;
  min-height: 160px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 5px;
  position: relative;
  cursor: pointer;
}

.materia:hover {
  background-color: #e2e8f0;
  border-color: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.materia.editable {
  border: 2px dashed #cbd5e0;
  position: relative;
}

.materia.editable:hover {
  border-color: #009149;
}

/* Estados de materia (mismos estilos que MallaTable) */
.materia.selected {
  background-color: #f2f2fe;
  border-color: #c0c0c0;
}

.materia.enabled {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.materia.prerequisite {
  background-color: #fffbeb;
  border-color: #f59e0b;
  color: #d97706;
}

.materia.approved {
  background-color: #f0f9f0;
  border-color: #9BC99E;
  color: #2d5a2f;
}

.codigo-container, .nombre-container {
  position: relative;
  width: 100%;
  margin: 2px 0;
}

.codigo {
  background-color: rgba(102, 102, 102, 0.1);
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px 4px;
  margin: 5px;
  font-size: 10px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.codigo:hover {
  background-color: rgba(0, 145, 73, 0.2);
  border-color: #009149;
}

.codigo-input {
  width: calc(100% - 10px);
  margin: 5px;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid #009149;
  border-radius: 4px;
  padding: 8px 4px;
  text-align: center;
  background-color: white;
  text-transform: uppercase;
}

.nombre {
  background-color: rgba(102, 102, 102, 0.05);
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px;
  margin: 5px;
  cursor: pointer;
  min-height: 40px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.nombre:hover {
  background-color: rgba(0, 145, 73, 0.2);
  border-color: #009149;
}

.nombre-input {
  width: calc(100% - 10px);
  margin: 5px;
  border: 2px solid #009149;
  border-radius: 4px;
  padding: 8px;
  text-align: center;
  background-color: white;
  resize: none;
  font-family: inherit;
  font-size: inherit;
  text-transform: uppercase;
  min-height: 40px;
}

/* Estilos para la sección de materias que habilita */
.habilita-container {
  margin-top: 5px;
  padding: 5px;
  background-color: rgba(0, 145, 73, 0.05);
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.habilita-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.habilita-label {
  font-size: 8px;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
}

.add-habilita-btn {
  background-color: #009149;
  color: white;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.add-habilita-btn:hover {
  background-color: #007a3d;
}

.habilita-codes {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.habilita-code-item {
  display: flex;
  align-items: center;
  background-color: rgba(0, 145, 73, 0.1);
  border-radius: 3px;
  padding: 2px;
  gap: 3px;
}

.habilita-code {
  font-size: 8px;
  font-weight: bold;
  color: #009149;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.habilita-code:hover {
  background-color: rgba(0, 145, 73, 0.2);
}

.habilita-input {
  font-size: 8px;
  font-weight: bold;
  border: 1px solid #009149;
  border-radius: 2px;
  padding: 2px 4px;
  text-align: center;
  background-color: white;
  text-transform: uppercase;
  width: 50px;
}

.remove-habilita-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  cursor: pointer;
  font-size: 8px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-habilita-btn:hover {
  background-color: #dc2626;
}

.delete-materia-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.materia:hover .delete-materia-btn {
  opacity: 1;
}

.delete-materia-btn:hover {
  background-color: #dc2626;
}

.add-materia-btn {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: #f8fafc;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #6b7280;
  transition: all 0.2s;
}

.add-materia-btn:hover {
  background-color: #009149;
  border-color: #009149;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-group {
    min-width: 100%;
  }
  
  .export-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .export-btn,
  .import-btn,
  .clear-cache-btn {
    font-size: 14px;
    padding: 10px 20px;
    width: 100%;
    max-width: 250px;
  }
  
  .table-wrapper {
    padding: 5px 0;
  }
  
  .malla-table th,
  .malla-table td {
    width: 180px;
  }
}
</style>
