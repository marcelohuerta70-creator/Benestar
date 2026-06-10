-- ============================================
-- BENESTAR DATABASE SCHEMA (FIXED)
-- Usa SUPABASE AUTH como sistema único de usuarios
-- ============================================

-- CORE: PERFIL PROFESIONAL (conectado a auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS perfil_profesional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  profesion VARCHAR(255) NOT NULL,
  numero_registro VARCHAR(255),
  telefono VARCHAR(20),
  direccion TEXT,
  color_principal VARCHAR(7) DEFAULT '#059669',
  color_texto_header VARCHAR(7) DEFAULT '#ffffff',
  plan_suscripcion VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CORE: PACIENTES
-- ============================================

CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo VARCHAR(255) NOT NULL,
  rut VARCHAR(20) UNIQUE NOT NULL,
  fecha_nacimiento DATE,
  sexo VARCHAR(1),
  email VARCHAR(255),
  telefono VARCHAR(20),
  direccion TEXT,
  comuna VARCHAR(255),
  ciudad VARCHAR(255),
  contacto_emergencia VARCHAR(255),
  telefono_emergencia VARCHAR(20),
  prevision VARCHAR(50),
  cesfam VARCHAR(255),
  medico_tratante VARCHAR(255),
  objetivo TEXT,
  notas_generales TEXT,
  estado VARCHAR(50) DEFAULT 'activo',
  portal_activo BOOLEAN DEFAULT TRUE,
  tipo_paciente VARCHAR(50),
  enfermedades TEXT,
  alergias_farmacologicas TEXT,
  antecedentes_familiares TEXT,
  cirugias_previas TEXT,
  observaciones_clinicas TEXT,
  habito_actividad_fisica TEXT,
  habito_consumo_agua TEXT,
  habito_sueno TEXT,
  habito_alcohol TEXT,
  habito_tabaco TEXT,
  habito_drogas TEXT,
  habito_deposiciones TEXT,
  tipo_alimentacion VARCHAR(50),
  preferencias_alimentarias TEXT,
  alergias_alimentarias TEXT,
  alimentos_no_consume TEXT,
  suplementos_habituales TEXT,
  contraseña_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RELACIÓN: PACIENTE - PROFESIONAL (N:N, multi-especialidad)
-- ============================================

CREATE TABLE IF NOT EXISTS paciente_profesional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  especialidad VARCHAR(50) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  UNIQUE(paciente_id, profesional_id, especialidad)
);

-- CONSULTAS: genérica para todas las especialidades
-- ============================================

CREATE TABLE IF NOT EXISTS consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  especialidad VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  tipo_consulta VARCHAR(50),
  proxima_cita DATE,
  adherencia VARCHAR(50),
  cambios_observados TEXT,
  dificultades_reportadas TEXT,
  observaciones_clinicas TEXT,
  diagnostico_nutricional TEXT,
  indicaciones TEXT,
  objetivos_proximo_control TEXT,
  nota_para_paciente TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PLANES: genérico (minutas, rehabilitación, etc.)
-- ============================================

CREATE TABLE IF NOT EXISTS planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  especialidad VARCHAR(50) NOT NULL,
  titulo VARCHAR(255),
  fecha_inicio DATE,
  fecha_fin DATE,
  contenido TEXT,
  estructura JSONB,
  activo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- MEDICIONES: ANTROPOMETRÍA
-- ============================================

CREATE TABLE IF NOT EXISTS mediciones_antropometria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  peso_kg NUMERIC(6,2) NOT NULL,
  talla_cm NUMERIC(5,1) NOT NULL,
  imc NUMERIC(5,2) NOT NULL,
  perimetro_cintura_cm NUMERIC(6,2),
  perimetro_cadera_cm NUMERIC(6,2),
  icc NUMERIC(5,2),
  clasificacion_nutricional VARCHAR(50),
  fotos_nombres TEXT[],
  fotos_urls TEXT[],
  fotos_size_kb INT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- MEDICIONES: BIOIMPEDANCIA
-- ============================================

CREATE TABLE IF NOT EXISTS mediciones_bioimpedancia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  masa_grasa_kg NUMERIC(6,2) NOT NULL,
  masa_grasa_pct NUMERIC(5,2) NOT NULL,
  masa_magra_kg NUMERIC(6,2) NOT NULL,
  agua_corporal_lt NUMERIC(6,2) NOT NULL,
  agua_corporal_pct NUMERIC(5,2) NOT NULL,
  metabolismo_basal_kcal NUMERIC(8,0),
  edad_metabolica INT,
  fotos_nombres TEXT[],
  fotos_urls TEXT[],
  fotos_size_kb INT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- EXÁMENES
-- ============================================

CREATE TABLE IF NOT EXISTS examenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  especialidad VARCHAR(50),
  fecha DATE NOT NULL,
  tipo VARCHAR(255) NOT NULL,
  resultado TEXT,
  notas TEXT,
  archivo_nombre VARCHAR(255),
  archivo_tipo VARCHAR(50),
  archivo_url VARCHAR(500),
  archivo_size_kb INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- NOTAS CLÍNICAS
-- ============================================

CREATE TABLE IF NOT EXISTS notas_clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  especialidad VARCHAR(50),
  tipo VARCHAR(50),
  titulo VARCHAR(255),
  contenido TEXT NOT NULL,
  archivos TEXT[],
  archivos_urls TEXT[],
  archivos_size_kb INT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SUPLEMENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS suplementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  dosis VARCHAR(255),
  frecuencia VARCHAR(255),
  instrucciones TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CITAS
-- ============================================

CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  especialidad VARCHAR(50) NOT NULL,
  paciente_nombre VARCHAR(255),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  duracion_min INT DEFAULT 30,
  motivo TEXT,
  observaciones TEXT,
  estado VARCHAR(50) DEFAULT 'programada',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_perfil_user_id ON perfil_profesional(user_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_profesional_id ON pacientes(profesional_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_rut ON pacientes(rut);
CREATE INDEX IF NOT EXISTS idx_pacientes_estado ON pacientes(estado);
CREATE INDEX IF NOT EXISTS idx_consultas_paciente_id ON consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_fecha ON consultas(fecha);
CREATE INDEX IF NOT EXISTS idx_examenes_paciente_id ON examenes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_profesional_id ON citas(profesional_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);

-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE perfil_profesional ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paciente_profesional ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediciones_antropometria ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediciones_bioimpedancia ENABLE ROW LEVEL SECURITY;
ALTER TABLE examenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE suplementos ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- ============================================

-- Perfil: Solo el profesional ve su propio perfil
CREATE POLICY "perfil_can_view_own" ON perfil_profesional
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "perfil_can_update_own" ON perfil_profesional
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "perfil_can_insert_own" ON perfil_profesional
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pacientes: Solo el profesional asignado ve sus pacientes
CREATE POLICY "pacientes_select_own" ON pacientes
  FOR SELECT USING (auth.uid() = profesional_id);

CREATE POLICY "pacientes_insert_own" ON pacientes
  FOR INSERT WITH CHECK (auth.uid() = profesional_id);

CREATE POLICY "pacientes_update_own" ON pacientes
  FOR UPDATE USING (auth.uid() = profesional_id);

-- Consultas: Solo para pacientes del profesional
CREATE POLICY "consultas_select_own" ON consultas
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

CREATE POLICY "consultas_insert_own" ON consultas
  FOR INSERT WITH CHECK (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

-- Planes: Solo para pacientes del profesional
CREATE POLICY "planes_select_own" ON planes
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

CREATE POLICY "planes_insert_own" ON planes
  FOR INSERT WITH CHECK (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

-- Mediciones: Solo para pacientes del profesional
CREATE POLICY "antropometria_select_own" ON mediciones_antropometria
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

CREATE POLICY "bioimpedancia_select_own" ON mediciones_bioimpedancia
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

-- Exámenes: Solo para pacientes del profesional
CREATE POLICY "examenes_select_own" ON examenes
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

CREATE POLICY "examenes_insert_own" ON examenes
  FOR INSERT WITH CHECK (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

-- Notas: Solo para pacientes del profesional
CREATE POLICY "notas_select_own" ON notas_clinicas
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

CREATE POLICY "notas_insert_own" ON notas_clinicas
  FOR INSERT WITH CHECK (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

-- Suplementos: Solo para pacientes del profesional
CREATE POLICY "suplementos_select_own" ON suplementos
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE profesional_id = auth.uid()
    )
  );

-- Citas: Profesional ve sus propias citas
CREATE POLICY "citas_select_own" ON citas
  FOR SELECT USING (auth.uid() = profesional_id);

CREATE POLICY "citas_insert_own" ON citas
  FOR INSERT WITH CHECK (auth.uid() = profesional_id);
