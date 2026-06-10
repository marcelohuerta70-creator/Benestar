-- AGREGAR CAMPOS FALTANTES A TABLAS
-- ===================================

-- 1. AGREGAR CAMPOS A CONSULTAS
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS tipo_consulta VARCHAR(50);
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS adherencia VARCHAR(50);
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS cambios_observados TEXT;
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS dificultades_reportadas TEXT;
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS observaciones_clinicas TEXT;
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS diagnostico_nutricional TEXT;
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS indicaciones TEXT;
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS objetivos_proximo_control TEXT;

-- 2. AGREGAR CAMPO TITULO A PLANES
ALTER TABLE planes ADD COLUMN IF NOT EXISTS titulo VARCHAR(255);

-- 3. AGREGAR CAMPO CONSULTA_ID A MEDICIONES (si no existe)
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL;
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL;

-- Confirmación
SELECT 'Campos agregados exitosamente' AS resultado;
