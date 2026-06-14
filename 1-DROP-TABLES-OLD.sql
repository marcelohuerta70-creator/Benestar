-- ================================================================
-- ⚠️ SCRIPT DE LIMPIEZA - BORRA TODAS LAS TABLAS VIEJAS
-- ================================================================
-- ADVERTENCIA: ESTO ELIMINA TODOS LOS DATOS
-- Asegúrate de haber hecho BACKUP primero
-- ================================================================

-- Desactivar RLS temporalmente
ALTER TABLE IF EXISTS consultas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mediciones_antropometria DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mediciones_bioimpedancia DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS examenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS planes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS suplementos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notas_clinicas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS citas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS medicamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS perfiles_profesionales DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS paciente_profesional DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las tablas
DROP TABLE IF EXISTS paciente_profesional CASCADE;
DROP TABLE IF EXISTS perfiles_profesionales CASCADE;
DROP TABLE IF EXISTS medicamentos CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS notas_clinicas CASCADE;
DROP TABLE IF EXISTS suplementos CASCADE;
DROP TABLE IF EXISTS planes CASCADE;
DROP TABLE IF EXISTS examenes CASCADE;
DROP TABLE IF EXISTS mediciones_bioimpedancia CASCADE;
DROP TABLE IF EXISTS mediciones_antropometria CASCADE;
DROP TABLE IF EXISTS consultas CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;

SELECT '✅ Todas las tablas eliminadas' AS resultado;
