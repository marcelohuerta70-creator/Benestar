-- AGREGAR CAMPOS FALTANTES A MEDICIONES ANTROPOMETRÍA
-- =====================================================

ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS perimetro_brazo_cm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS perimetro_torax_cm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS perimetro_abdomen_cm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS perimetro_muslo_cm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS perimetro_pantorrilla_cm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS pliegue_tricipital_mm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS pliegue_bicipital_mm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS pliegue_subescapular_mm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS pliegue_suprailiaco_mm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS pliegue_abdominal_mm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS pliegue_muslo_mm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS pliegue_pantorrilla_mm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS envergadura_cm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS altura_sentado_cm DECIMAL(5,2);

-- AGREGAR CAMPOS FALTANTES A MEDICIONES BIOIMPEDANCIA
-- ====================================================

ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS masa_magra_kg DECIMAL(6,2);
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS masa_libre_grasa_kg DECIMAL(6,2);
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS agua_corporal_lt DECIMAL(6,2);
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS grasa_visceral DECIMAL(5,2);
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS proteina_corporal_kg DECIMAL(6,2);
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS masa_osea_kg DECIMAL(6,2);
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS metabolismo_basal_kcal INT;
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS edad_metabolica INT;
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS seg_brazo_izq DECIMAL(5,2);
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS seg_brazo_der DECIMAL(5,2);
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS seg_tronco DECIMAL(5,2);
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS seg_pierna_izq DECIMAL(5,2);
ALTER TABLE mediciones_bioimpedancia ADD COLUMN IF NOT EXISTS seg_pierna_der DECIMAL(5,2);

SELECT 'Campos de mediciones agregados correctamente' AS resultado;
