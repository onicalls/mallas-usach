<template>
  <div class="selector-container">
    <label for="carrera-select">Selecciona una carrera:</label>
    <div class="autocomplete-container">
      <input
        id="carrera-select"
        v-model="searchText"
        @input="filterMallas"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @click="handleClick"
        placeholder="Escribe o selecciona una carrera..."
        class="carrera-input"
        autocomplete="off"
      />
      <div v-if="showDropdown && (filteredMallas.length > 0 || searchText.length > 0)" class="dropdown">
        <div
          v-for="(malla, index) in filteredMallas"
          :key="malla.value"
          :class="['dropdown-item', { 'highlighted': highlightedIndex === index }]"
          @mousedown="selectMalla(malla)"
          @mouseenter="highlightedIndex = index"
        >
          {{ malla.label }}
        </div>
        <div
          :class="['dropdown-item', { 'highlighted': highlightedIndex === filteredMallas.length }]"
          @mousedown="selectMalla({ value: 'personalizado', label: 'Personalizado' })"
          @mouseenter="highlightedIndex = filteredMallas.length"
        >
          Personalizado
        </div>
      </div>
    </div>
    
    <!-- Toggle de Editar - Solo aparece cuando la carrera es personalizada -->
    <div v-if="selectedCarrera === 'personalizado'" class="simulate-toggle-container">
      <label class="simulate-label">Editar</label>
      <div class="toggle-switch" @click="$emit('toggle-edit')">
        <div class="toggle-slider" :class="{ 'active': isEditing }"></div>
      </div>
    </div>

    <!-- Toggle de Simular - Solo aparece cuando hay una carrera seleccionada -->
    <div v-if="selectedCarrera" class="simulate-toggle-container">
      <label class="simulate-label">Simular</label>
      <div class="toggle-switch" @click="$emit('toggle-simulate')">
        <div class="toggle-slider" :class="{ 'active': isSimulating }"></div>
      </div>
    </div>
    
    <!-- Botón para limpiar simulación - Solo aparece cuando está simulando -->
    <div v-if="selectedCarrera && isSimulating" class="clear-simulation-container">
      <button 
        @click="$emit('clear-simulation')" 
        class="clear-simulation-btn"
        :title="selectedCarrera === 'personalizado' ? 'Limpiar malla personalizada y simulación' : 'Limpiar progreso de simulación para esta malla'"
      >
        🗑️ {{ selectedCarrera === 'personalizado' ? 'Limpiar Todo' : 'Limpiar Simulación' }}
      </button>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'CarreraSelector',
  props: {
    selectedCarrera: {
      type: String,
      default: ''
    },
    availableMallas: {
      type: Array,
      default: () => []
    },
    isSimulating: {
      type: Boolean,
      default: false
    },
    isEditing: {
      type: Boolean,
      default: true
    }
  },
  emits: ['carrera-changed', 'toggle-simulate', 'toggle-edit', 'clear-simulation'],
  data() {
    return {
      searchText: '',
      showDropdown: false,
      filteredMallas: [],
      highlightedIndex: -1
    }
  },
  watch: {
    selectedCarrera: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          if (newValue === 'personalizado') {
            this.searchText = 'Personalizado'
          } else {
            const selectedMalla = this.availableMallas.find(m => m.value === newValue)
            this.searchText = selectedMalla ? selectedMalla.label : ''
          }
        } else {
          this.searchText = ''
        }
      }
    },
    availableMallas: {
      immediate: true,
      handler() {
        this.filteredMallas = [...this.availableMallas]
      }
    }
  },
  methods: {
    normalizeText(text) {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    },
    handleClick() {
      // Limpiar el contenido al hacer clic para mostrar todas las opciones
      this.searchText = ''
      this.filteredMallas = [...this.availableMallas]
      this.showDropdown = true
      this.highlightedIndex = -1
    },
    handleFocus() {
      // También limpiar al enfocar si no se ha hecho clic recientemente
      this.showDropdown = true
    },
    filterMallas() {
      const search = this.normalizeText(this.searchText)
      if (search === '') {
        this.filteredMallas = [...this.availableMallas]
      } else {
        this.filteredMallas = this.availableMallas.filter(malla =>
          this.normalizeText(malla.label).includes(search)
        )
      }
      this.highlightedIndex = -1
      this.showDropdown = true
    },
    selectMalla(malla) {
      this.searchText = malla.label
      this.showDropdown = false
      this.highlightedIndex = -1
      this.$emit('carrera-changed', malla.value)
    },
    handleBlur() {
      // Delay hiding dropdown to allow click events
      setTimeout(() => {
        this.showDropdown = false
        this.highlightedIndex = -1
        
        // If no valid selection, revert to current selection
        if (this.selectedCarrera) {
          if (this.selectedCarrera === 'personalizado') {
            this.searchText = 'Personalizado'
          } else {
            const selectedMalla = this.availableMallas.find(m => m.value === this.selectedCarrera)
            this.searchText = selectedMalla ? selectedMalla.label : ''
          }
        } else {
          this.searchText = ''
        }
      }, 150)
    },
    handleKeydown(event) {
      if (!this.showDropdown) return

      const totalItems = this.filteredMallas.length + 1 // +1 for "Personalizado"

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          this.highlightedIndex = Math.min(this.highlightedIndex + 1, totalItems - 1)
          break
        case 'ArrowUp':
          event.preventDefault()
          this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1)
          break
        case 'Enter':
          event.preventDefault()
          if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredMallas.length) {
            this.selectMalla(this.filteredMallas[this.highlightedIndex])
          } else if (this.highlightedIndex === this.filteredMallas.length) {
            this.selectMalla({ value: 'personalizado', label: 'Personalizado' })
          }
          break
        case 'Escape':
          this.showDropdown = false
          this.highlightedIndex = -1
          break
      }
    }
  }
}
</script>

<style scoped>
.selector-container {
  margin-bottom: 30px;
  background-color: #009149;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

/* Responsive: en móviles, disposición vertical */
@media (max-width: 768px) {
  .selector-container {
    flex-direction: column;
    gap: 10px;
    margin-bottom: 0;
  }
}

/* Estilos para el toggle de simular */
.simulate-toggle-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.simulate-label {
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin: 0;
}

.toggle-switch {
  width: 50px;
  height: 25px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-switch:hover {
  background-color: rgba(255, 255, 255, 0.4);
}

.toggle-slider {
  width: 21px;
  height: 21px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-slider.active {
  transform: translateX(25px);
  background-color: #007a3d;
}

.selector-container label {
  margin: 0;
  font-weight: bold;
  font-size: 16px;
  color: white;
  white-space: nowrap;
}

.autocomplete-container {
  position: relative;
  min-width: 300px;
}

.carrera-input {
  padding: 10px 15px;
  font-size: 16px;
  border: 2px solid #007a3d;
  border-radius: 8px;
  background-color: #007a3d;
  width: 100%;
  cursor: pointer;
  transition: border-color 0.2s;
  color: white;
  box-sizing: border-box;
}

.carrera-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.carrera-input:focus {
  outline: none;
  border-color: #007a3d;
  box-shadow: 0 0 0 3px rgba(0, 145, 73, 0.2);
  cursor: text;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 2px solid #007a3d;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  color: #333;
  transition: background-color 0.2s;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover,
.dropdown-item.highlighted {
  background-color: #f0f8f0;
  color: #007a3d;
}

/* Responsive: en móviles, ancho completo */
@media (max-width: 768px) {
  .autocomplete-container {
    min-width: 250px;
    width: 100%;
    max-width: 300px;
  }
}

.clear-simulation-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.clear-simulation-btn {
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid #dc3545;
  border-radius: 6px;
  background-color: #dc3545;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-simulation-btn:hover {
  background-color: #c82333;
  border-color: #c82333;
  transform: translateY(-1px);
}

.clear-simulation-btn:active {
  transform: translateY(0);
}
</style>
