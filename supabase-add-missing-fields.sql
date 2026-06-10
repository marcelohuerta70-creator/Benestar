-- AGREGAR CAMPOS FALTANTES A TABLA PACIENTES
-- ============================================

ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS medicamentos_actuales TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS notas_clinica TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS notas_habitos TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS notas_alimentacion TEXT;

-- Verificación
-- SELECT column_name FROM information_schema.columns WHERE table_name='pacientes';
