-- AGREGAR CAMPOS DE ALIMENTACIÓN Y CLASIFICACIÓN A PACIENTES
-- ============================================================

-- Campo tipo_paciente (clasificación del paciente)
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS tipo_paciente VARCHAR(50);

-- Campo tipo_paciente_datos (JSONB para almacenar datos dinámicos según tipo_paciente)
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS tipo_paciente_datos JSONB DEFAULT NULL;

-- Campos de Alimentación
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS tipo_alimentacion VARCHAR(50);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS tipo_alimentacion_otro VARCHAR(255);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS preferencias_alimentarias TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS alergias_alimentarias TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS alimentos_no_consume TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS suplementos_habituales TEXT;

-- Confirmación
SELECT 'Campos de alimentación y clasificación agregados correctamente' AS resultado;
