-- MIGRACIÓN COMPLETA A SUPABASE
-- Crear todas las tablas necesarias para eliminar localStorage
-- ============================================================

-- 1. TABLA CONSULTAS (controles/visitas del paciente)
CREATE TABLE IF NOT EXISTS consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora VARCHAR(5),
  peso_kg DECIMAL(5,2),
  nota_para_paciente TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_profesional ON consultas(profesional_id);
CREATE INDEX IF NOT EXISTS idx_consultas_fecha ON consultas(fecha);

-- 2. TABLA MEDICIONES ANTROPOMETRÍA
CREATE TABLE IF NOT EXISTS mediciones_antropometria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  peso_kg DECIMAL(6,2) NOT NULL,
  talla_cm DECIMAL(5,2),
  imc DECIMAL(5,2),
  perimetro_cintura_cm DECIMAL(5,2),
  perimetro_cadera_cm DECIMAL(5,2),
  perimetro_brazo_cm DECIMAL(5,2),
  perimetro_torax_cm DECIMAL(5,2),
  perimetro_abdomen_cm DECIMAL(5,2),
  perimetro_muslo_cm DECIMAL(5,2),
  perimetro_pantorrilla_cm DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_antrop_paciente ON mediciones_antropometria(paciente_id);
CREATE INDEX IF NOT EXISTS idx_antrop_profesional ON mediciones_antropometria(profesional_id);
CREATE INDEX IF NOT EXISTS idx_antrop_fecha ON mediciones_antropometria(fecha);

-- 3. TABLA MEDICIONES BIOIMPEDANCIA
CREATE TABLE IF NOT EXISTS mediciones_bioimpedancia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  masa_grasa_kg DECIMAL(6,2),
  masa_grasa_pct DECIMAL(5,2),
  masa_magra_kg DECIMAL(6,2),
  agua_corporal_pct DECIMAL(5,2),
  agua_corporal_kg DECIMAL(6,2),
  masa_osea_kg DECIMAL(6,2),
  metabolismo_basal INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bio_paciente ON mediciones_bioimpedancia(paciente_id);
CREATE INDEX IF NOT EXISTS idx_bio_profesional ON mediciones_bioimpedancia(profesional_id);
CREATE INDEX IF NOT EXISTS idx_bio_fecha ON mediciones_bioimpedancia(fecha);

-- 4. TABLA EXÁMENES (laboratorios, etc)
CREATE TABLE IF NOT EXISTS examenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo VARCHAR(100),
  descripcion TEXT,
  resultado TEXT,
  archivos TEXT[],
  archivos_urls TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_examenes_paciente ON examenes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_examenes_profesional ON examenes(profesional_id);
CREATE INDEX IF NOT EXISTS idx_examenes_fecha ON examenes(fecha);

-- 5. TABLA PLANES (MINUTAS)
CREATE TABLE IF NOT EXISTS planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  especialidad VARCHAR(50),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT TRUE,
  estructura JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planes_paciente ON planes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_planes_profesional ON planes(profesional_id);
CREATE INDEX IF NOT EXISTS idx_planes_activo ON planes(activo);

-- 6. TABLA SUPLEMENTOS
CREATE TABLE IF NOT EXISTS suplementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  dosis VARCHAR(100),
  frecuencia VARCHAR(100),
  motivo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suplementos_paciente ON suplementos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_suplementos_profesional ON suplementos(profesional_id);

-- 7. TABLA NOTAS CLÍNICAS (con tipo para distinguir)
CREATE TABLE IF NOT EXISTS notas_clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'profesional' o 'paciente'
  titulo VARCHAR(255),
  contenido TEXT NOT NULL,
  archivos TEXT[],
  archivos_urls TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notas_paciente ON notas_clinicas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_notas_profesional ON notas_clinicas(profesional_id);
CREATE INDEX IF NOT EXISTS idx_notas_tipo ON notas_clinicas(tipo);

-- 8. TABLA CITAS (AGENDA)
CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora VARCHAR(5) NOT NULL,
  estado VARCHAR(50) DEFAULT 'programada', -- 'programada', 'realizada', 'cancelada'
  motivo TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_profesional ON citas(profesional_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);

-- 9. TABLA PERFILES PROFESIONALES
CREATE TABLE IF NOT EXISTS perfiles_profesionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255),
  profesion VARCHAR(100),
  numero_registro VARCHAR(50),
  telefono VARCHAR(20),
  correo VARCHAR(255),
  direccion TEXT,
  color_principal VARCHAR(7) DEFAULT '#059669',
  color_texto_header VARCHAR(7) DEFAULT '#ffffff',
  plan_suscripcion VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfiles_profesional ON perfiles_profesionales(profesional_id);

-- ============================================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================================

-- CONSULTAS
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "consultas_profesional_read" ON consultas;
DROP POLICY IF EXISTS "consultas_profesional_write" ON consultas;
DROP POLICY IF EXISTS "consultas_paciente_read" ON consultas;

CREATE POLICY "consultas_profesional_read" ON consultas
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "consultas_profesional_write" ON consultas
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "consultas_profesional_delete" ON consultas
  FOR DELETE USING (profesional_id = auth.uid());
CREATE POLICY "consultas_paciente_read" ON consultas
  FOR SELECT USING (paciente_id = auth.uid());

-- MEDICIONES ANTROPOMETRÍA
ALTER TABLE mediciones_antropometria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "antrop_profesional_read" ON mediciones_antropometria;
DROP POLICY IF EXISTS "antrop_profesional_write" ON mediciones_antropometria;
DROP POLICY IF EXISTS "antrop_paciente_read" ON mediciones_antropometria;

CREATE POLICY "antrop_profesional_read" ON mediciones_antropometria
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "antrop_profesional_write" ON mediciones_antropometria
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "antrop_profesional_delete" ON mediciones_antropometria
  FOR DELETE USING (profesional_id = auth.uid());
CREATE POLICY "antrop_paciente_read" ON mediciones_antropometria
  FOR SELECT USING (paciente_id = auth.uid());

-- MEDICIONES BIOIMPEDANCIA
ALTER TABLE mediciones_bioimpedancia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bio_profesional_read" ON mediciones_bioimpedancia;
DROP POLICY IF EXISTS "bio_profesional_write" ON mediciones_bioimpedancia;
DROP POLICY IF EXISTS "bio_paciente_read" ON mediciones_bioimpedancia;

CREATE POLICY "bio_profesional_read" ON mediciones_bioimpedancia
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "bio_profesional_write" ON mediciones_bioimpedancia
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "bio_profesional_delete" ON mediciones_bioimpedancia
  FOR DELETE USING (profesional_id = auth.uid());
CREATE POLICY "bio_paciente_read" ON mediciones_bioimpedancia
  FOR SELECT USING (paciente_id = auth.uid());

-- EXÁMENES
ALTER TABLE examenes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "examenes_profesional_read" ON examenes;
DROP POLICY IF EXISTS "examenes_profesional_write" ON examenes;
DROP POLICY IF EXISTS "examenes_paciente_read" ON examenes;

CREATE POLICY "examenes_profesional_read" ON examenes
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "examenes_profesional_write" ON examenes
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "examenes_profesional_delete" ON examenes
  FOR DELETE USING (profesional_id = auth.uid());
CREATE POLICY "examenes_paciente_read" ON examenes
  FOR SELECT USING (paciente_id = auth.uid());

-- PLANES
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "planes_profesional_read" ON planes;
DROP POLICY IF EXISTS "planes_profesional_write" ON planes;
DROP POLICY IF EXISTS "planes_paciente_read" ON planes;

CREATE POLICY "planes_profesional_read" ON planes
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "planes_profesional_write" ON planes
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "planes_profesional_delete" ON planes
  FOR DELETE USING (profesional_id = auth.uid());
CREATE POLICY "planes_paciente_read" ON planes
  FOR SELECT USING (paciente_id = auth.uid());

-- SUPLEMENTOS
ALTER TABLE suplementos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "suplementos_profesional_read" ON suplementos;
DROP POLICY IF EXISTS "suplementos_profesional_write" ON suplementos;
DROP POLICY IF EXISTS "suplementos_paciente_read" ON suplementos;

CREATE POLICY "suplementos_profesional_read" ON suplementos
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "suplementos_profesional_write" ON suplementos
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "suplementos_profesional_delete" ON suplementos
  FOR DELETE USING (profesional_id = auth.uid());
CREATE POLICY "suplementos_paciente_read" ON suplementos
  FOR SELECT USING (paciente_id = auth.uid());

-- NOTAS CLÍNICAS
ALTER TABLE notas_clinicas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notas_profesional_read" ON notas_clinicas;
DROP POLICY IF EXISTS "notas_profesional_write" ON notas_clinicas;
DROP POLICY IF EXISTS "notas_paciente_read" ON notas_clinicas;

CREATE POLICY "notas_profesional_read" ON notas_clinicas
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "notas_profesional_write" ON notas_clinicas
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "notas_profesional_delete" ON notas_clinicas
  FOR DELETE USING (profesional_id = auth.uid());
CREATE POLICY "notas_paciente_read" ON notas_clinicas
  FOR SELECT USING (paciente_id = auth.uid() AND tipo = 'paciente');

-- CITAS
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "citas_profesional_read" ON citas;
DROP POLICY IF EXISTS "citas_profesional_write" ON citas;
DROP POLICY IF EXISTS "citas_paciente_read" ON citas;

CREATE POLICY "citas_profesional_read" ON citas
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "citas_profesional_write" ON citas
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "citas_profesional_delete" ON citas
  FOR DELETE USING (profesional_id = auth.uid());
CREATE POLICY "citas_paciente_read" ON citas
  FOR SELECT USING (paciente_id = auth.uid());

-- PERFILES PROFESIONALES
ALTER TABLE perfiles_profesionales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "perfiles_read" ON perfiles_profesionales;
DROP POLICY IF EXISTS "perfiles_write" ON perfiles_profesionales;

CREATE POLICY "perfiles_read" ON perfiles_profesionales
  FOR SELECT USING (profesional_id = auth.uid() OR TRUE);
CREATE POLICY "perfiles_write" ON perfiles_profesionales
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "perfiles_update" ON perfiles_profesionales
  FOR UPDATE USING (profesional_id = auth.uid());

SELECT 'Migración completa lista para ejecutar' AS resultado;
