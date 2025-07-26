<template>
  <div v-if="mallaData" class="table-container">
    <div class="table-wrapper">
      <table class="malla-table">
      <thead>
        <tr>
          <th v-for="(materias, nivel) in mallaData" :key="nivel">
            {{ nivel.toUpperCase().replace('N', 'NIVEL ') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td v-for="(materias, nivel) in mallaData" :key="nivel">
            <div 
              v-for="materia in materias" 
              :key="materia[1]"
              class="materia"
              :class="{
                'approved': isSimulating && approvedMaterias.includes(materia[1]),
                'prerequisite': prerequisiteMaterias.includes(materia[1]) && !approvedMaterias.includes(materia[1]),
                'selected': selectedMateria === materia[1],
                'enabled': enabledMaterias.includes(materia[1]) && !prerequisiteMaterias.includes(materia[1]) && selectedMateria !== materia[1] && (!isSimulating || !approvedMaterias.includes(materia[1]))
              }"
              @click="$emit('materia-selected', materia)"
            >
              <div class="codigo">{{ materia[1] }}</div>
              <div class="nombre">{{ materia[0] }}</div>
            </div>
          </td>
        </tr>
      </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MallaTable',
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
  emits: ['materia-selected']
}
</script>

<style scoped>
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
  width: 150px;
  font-size: clamp(10px, 1vw, 15px);
}

.malla-table td {
  border: 1px;
  vertical-align: top;
  border-radius: 8px;
  width: 150px;
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
  height: 100px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
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

/* Materia seleccionada - color verde/rojizo */
.materia.selected {
  background-color: #f2f2fe;
  border-color: #c0c0c0;
}

/* Materias habilitadas - color azul */
.materia.enabled {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.materia.enabled .codigo {
  color: #1d4ed8;
  border-bottom-color: #3b82f6;
}

/* Materias prerequisito - color amarillo */
.materia.prerequisite {
  background-color: #fffbeb;
  border-color: #f59e0b;
  color: #d97706;
}

.materia.prerequisite .codigo {
  color: #d97706;
  border-bottom-color: #f59e0b;
}

/* Materias aprobadas - color verde */
.materia.approved {
  background-color: #f0f9f0;
  border-color: #9BC99E;
  color: #2d5a2f;
}

.materia.approved .codigo {
  color: #2d5a2f;
  border-bottom-color: #9BC99E;
}

/* Animación para materias habilitadas */
.materia.enabled {
  animation: pulse 2s infinite;
}

/* Animación para materias prerequisito */
.materia.prerequisite {
  animation: pulseYellow 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

@keyframes pulseYellow {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}

.codigo {
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: bold;
  color: #666;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 5px;
  width: 80%;
}

.nombre {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
}

/* Responsive: en móviles, reducir padding */
@media (max-width: 768px) {
  .table-wrapper {
    padding: 5px 0;
  }
}
</style>
