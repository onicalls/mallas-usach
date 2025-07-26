<template>
  <div class="legend-container">
    <div v-if="isSimulating" class="legend-item">
      <div class="legend-color approved-color"></div>
      <span class="legend-text">Materias Aprobadas</span>
    </div>
    <div class="legend-item">
      <div class="legend-color prerequisite-color"></div>
      <span class="legend-text">Prerrequisitos</span>
    </div>
    <div class="legend-item">
      <div class="legend-color selected-color"></div>
      <span class="legend-text">Materia Seleccionada</span>
    </div>
    <div class="legend-item">
      <div class="legend-color enabled-color"></div>
      <span class="legend-text">Materias Habilitadas</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MallaLegend',
  props: {
    isSimulating: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
/* Estilos para la leyenda */
.legend-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 30px;
  gap: 40px;
  flex-wrap: wrap;
}

/* Responsive: en móviles, reducir gap de la leyenda */
@media (max-width: 768px) {
  .legend-container {
    gap: 20px;
  }
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid;
}

.selected-color {
  background-color: #f2f2fe;
  border-color: #c0c0c0;
}

.enabled-color {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

.prerequisite-color {
  background-color: #fffbeb;
  border-color: #f59e0b;
}

.approved-color {
  background-color: #f0f9f0;
  border-color: #9BC99E;
}

.legend-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}
</style>
