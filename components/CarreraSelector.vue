<template>
  <div class="selector-container">
    <label for="carrera-select">Selecciona una carrera:</label>
    <select 
      id="carrera-select" 
      :value="selectedCarrera" 
      @change="$emit('carrera-changed', $event.target.value)"
      class="carrera-select"
    >
      <option value="">Selecciona una carrera</option>
      <option 
        v-for="malla in availableMallas" 
        :key="malla.value" 
        :value="malla.value"
      >
        {{ malla.label }}
      </option>
      <option value="personalizado">Personalizado</option>
    </select>
    
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
  emits: ['carrera-changed', 'toggle-simulate', 'toggle-edit']
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

.carrera-select {
  padding: 10px 15px;
  font-size: flex;
  border: 2px solid #007a3d;
  border-radius: 8px;
  background-color: #007a3d;
  min-width: 300px;
  cursor: pointer;
  transition: border-color 0.2s;
  color: white;
}

/* Responsive: en móviles, ancho completo */
@media (max-width: 768px) {
  .carrera-select {
    min-width: 250px;
    width: 100%;
    max-width: 300px;
  }
}

.carrera-select:focus {
  outline: none;
  border-color: #007a3d;
  box-shadow: 0 0 0 3px rgba(0, 145, 73, 0.2);
}
</style>
