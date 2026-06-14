-- ================================================================
-- NUTRIS - SCHEMA SQL DEFINITIVO
-- Basado en análisis exhaustivo del código (2026-06-14)
-- NO REQUIERE MODIFICACIONES POSTERIORES
-- ================================================================

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. TABLA: PACIENTES (Hub central del sistema)
-- ================================================================
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación (requeridos)
  nombre_completo VARCHAR(255) NOT NULL,
  rut VARCHAR(20) NOT NULL UNIQUE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Demográfico (requeridos)
  fecha_nacimiento DATE NOT NULL,
  sexo CHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
  genero VARCHAR(50), -- valores: femenino, masculino, no_binario, otro, no_responde

  -- Objetivo (requerido)
  objetivo TEXT NOT NULL,

  -- Contacto
  email VARCHAR(255),
  telefono VARCHAR(20),
  contacto_emergencia VARCHAR(255),
  telefono_emergencia VARCHAR(20),

  -- Domicilio
  direccion TEXT,
  comuna VARCHAR(100),
  ciudad VARCHAR(100),

  -- Sistema de salud
  prevision VARCHAR(50), -- fonasa, isapre, particular, otro
  prevision_otro VARCHAR(100),
  cesfam VARCHAR(255),
  medico_tratante VARCHAR(255),

  -- Notas generales
  notas_generales TEXT,

  -- Ficha clínica
  enfermedades TEXT,
  alergias_farmacologicas TEXT,
  antecedentes_familiares TEXT,
  cirugias_previas TEXT,
  observaciones_clinicas TEXT,
  notas_clinica TEXT, -- IMPORTANTE: no es "notas_clinicas"

  -- Hábitos (generales del paciente)
  habito_actividad_fisica TEXT,
  habito_consumo_agua TEXT,
  habito_sueno TEXT,
  habito_alcohol TEXT,
  habito_tabaco TEXT,
  habito_drogas TEXT,
  habito_deposiciones TEXT,
  notas_habitos TEXT,

  -- Alimentación
  tipo_alimentacion VARCHAR(50), -- omnivoro, vegetariano, vegano, pescetariano, otro
  tipo_alimentacion_otro VARCHAR(100),
  preferencias_alimentarias TEXT,
  alergias_alimentarias TEXT,
  alimentos_no_consume TEXT,
  suplementos_habituales TEXT,
  notas_alimentacion TEXT,

  -- Clasificación del paciente (dinámica)
  tipo_paciente VARCHAR(50), -- adulto, adulto_mayor, embarazada, nodriza, lactante, preescolar, escolar, adolescente, postrado, deportista, otro
  tipo_paciente_datos JSONB, -- campos dinámicos por tipo_paciente

  -- Portal del paciente
  portal_activo BOOLEAN DEFAULT FALSE,
  contraseña_hash VARCHAR(255), -- bcryptjs hash

  -- Estado
  estado VARCHAR(50) NOT NULL DEFAULT 'activo', -- activo, inactivo, archivado

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pacientes_profesional ON pacientes(profesional_id);
CREATE INDEX idx_pacientes_rut ON pacientes(rut);
CREATE INDEX idx_pacientes_nombre ON pacientes(nombre_completo);
CREATE INDEX idx_pacientes_estado ON pacientes(estado);

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pacientes_profesional_read" ON pacientes
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "pacientes_profesional_write" ON pacientes
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "pacientes_profesional_update" ON pacientes
  FOR UPDATE USING (profesional_id = auth.uid());
CREATE POLICY "pacientes_profesional_delete" ON pacientes
  FOR DELETE USING (profesional_id = auth.uid());

-- ================================================================
-- 2. TABLA: CONSULTAS (Controles/Visitas)
-- ================================================================
CREATE TABLE IF NOT EXISTS consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información general
  fecha DATE NOT NULL,
  tipo_consulta VARCHAR(50), -- primera_consulta, seguimiento, alta_nutricional
  proxima_cita DATE,
  proxima_cita_hora TIME,

  -- Evolución
  adherencia VARCHAR(50), -- muy_buena, buena, regular, mala, o vacío
  cambios_observados TEXT,
  dificultades_reportadas TEXT,
  observaciones_clinicas TEXT,

  -- Control de hábitos (registrados en esta consulta)
  ctrl_actividad_fisica TEXT,
  ctrl_consumo_agua TEXT,
  ctrl_sueno TEXT,
  ctrl_deposiciones TEXT,
  ctrl_alcohol TEXT,
  ctrl_tabaco TEXT,

  -- Diagnóstico y plan
  diagnostico_nutricional TEXT,
  indicaciones TEXT,
  objetivos_proximo_control TEXT,

  -- Nota para el paciente (visible en portal)
  nota_para_paciente TEXT,

  -- Archivos adjuntos
  adjuntos TEXT[], -- nombres de archivos
  archivos_urls TEXT[], -- URLs en Storage

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_consultas_profesional ON consultas(profesional_id);
CREATE INDEX idx_consultas_fecha ON consultas(fecha);

ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consultas_profesional_read" ON consultas
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "consultas_profesional_write" ON consultas
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "consultas_profesional_update" ON consultas
  FOR UPDATE USING (profesional_id = auth.uid());
CREATE POLICY "consultas_profesional_delete" ON consultas
  FOR DELETE USING (profesional_id = auth.uid());
CREATE POLICY "consultas_paciente_read" ON consultas
  FOR SELECT USING (paciente_id = auth.uid());

-- ================================================================
-- 3. TABLA: MEDICAMENTOS (Tabla separada, relacionada a pacientes)
-- ================================================================
CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,

  nombre VARCHAR(255) NOT NULL,
  dosis VARCHAR(100),
  frecuencia VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medicamentos_paciente ON medicamentos(paciente_id);

ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medicamentos_profesional_read" ON medicamentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pacientes p
      WHERE p.id = medicamentos.paciente_id
      AND p.profesional_id = auth.uid()
    )
  );
CREATE POLICY "medicamentos_profesional_write" ON medicamentos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pacientes p
      WHERE p.id = medicamentos.paciente_id
      AND p.profesional_id = auth.uid()
    )
  );

-- ================================================================
-- 4. TABLA: MEDICIONES_ANTROPOMETRIA
-- ================================================================
CREATE TABLE IF NOT EXISTS mediciones_antropometria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,

  fecha DATE NOT NULL,

  -- Medidas básicas (requeridas si se registran)
  peso_kg DECIMAL(6,2) NOT NULL,
  talla_cm DECIMAL(5,2) NOT NULL,
  imc DECIMAL(5,2), -- calculado: peso / (talla/100)^2
  perimetro_cintura_cm DECIMAL(5,2),
  perimetro_cadera_cm DECIMAL(5,2),
  icc DECIMAL(5,2), -- calculado: cintura / cadera
  clasificacion_nutricional VARCHAR(100),

  -- Perímetros avanzados
  per_brazo_relajado_cm DECIMAL(5,2),
  per_brazo_contraido_cm DECIMAL(5,2),
  perimetro_torax_cm DECIMAL(5,2),
  perimetro_abdomen_cm DECIMAL(5,2),
  perimetro_muslo_cm DECIMAL(5,2),
  perimetro_pantorrilla_cm DECIMAL(5,2),

  -- Pliegues cutáneos (en milímetros)
  pliegue_tricipital_mm DECIMAL(5,2),
  pliegue_bicipital_mm DECIMAL(5,2),
  pliegue_subescapular_mm DECIMAL(5,2),
  pliegue_suprailiaco_mm DECIMAL(5,2),
  pliegue_abdominal_mm DECIMAL(5,2),
  pliegue_muslo_mm DECIMAL(5,2),
  pliegue_pantorrilla_mm DECIMAL(5,2),

  -- Opcionales
  envergadura_cm DECIMAL(5,2),
  altura_sentado_cm DECIMAL(5,2),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_antrop_paciente ON mediciones_antropometria(paciente_id);
CREATE INDEX idx_antrop_consulta ON mediciones_antropometria(consulta_id);
CREATE INDEX idx_antrop_fecha ON mediciones_antropometria(fecha);

ALTER TABLE mediciones_antropometria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "antrop_profesional_read" ON mediciones_antropometria
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pacientes p
      WHERE p.id = mediciones_antropometria.paciente_id
      AND p.profesional_id = auth.uid()
    )
  );
CREATE POLICY "antrop_profesional_write" ON mediciones_antropometria
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pacientes p
      WHERE p.id = mediciones_antropometria.paciente_id
      AND p.profesional_id = auth.uid()
    )
  );
CREATE POLICY "antrop_paciente_read" ON mediciones_antropometria
  FOR SELECT USING (paciente_id = auth.uid());

-- ================================================================
-- 5. TABLA: MEDICIONES_BIOIMPEDANCIA
-- ================================================================
CREATE TABLE IF NOT EXISTS mediciones_bioimpedancia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,

  fecha DATE NOT NULL,

  -- Composición corporal básica
  masa_grasa_kg DECIMAL(6,2),
  masa_grasa_pct DECIMAL(5,2),
  masa_magra_kg DECIMAL(6,2),
  agua_corporal_lt DECIMAL(6,2), -- IMPORTANTE: en LITROS, no kg
  agua_corporal_pct DECIMAL(5,2),

  -- Metabólica
  metabolismo_basal_kcal INTEGER, -- IMPORTANTE: sufijo _kcal
  edad_metabolica INTEGER,

  -- Avanzada
  masa_libre_grasa_kg DECIMAL(6,2),
  grasa_visceral DECIMAL(5,2),
  proteina_corporal_kg DECIMAL(6,2),
  masa_osea_kg DECIMAL(6,2),

  -- Segmental
  seg_brazo_izq DECIMAL(5,2),
  seg_brazo_der DECIMAL(5,2),
  seg_tronco DECIMAL(5,2),
  seg_pierna_izq DECIMAL(5,2),
  seg_pierna_der DECIMAL(5,2),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bio_paciente ON mediciones_bioimpedancia(paciente_id);
CREATE INDEX idx_bio_consulta ON mediciones_bioimpedancia(consulta_id);
CREATE INDEX idx_bio_fecha ON mediciones_bioimpedancia(fecha);

ALTER TABLE mediciones_bioimpedancia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bio_profesional_read" ON mediciones_bioimpedancia
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pacientes p
      WHERE p.id = mediciones_bioimpedancia.paciente_id
      AND p.profesional_id = auth.uid()
    )
  );
CREATE POLICY "bio_profesional_write" ON mediciones_bioimpedancia
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pacientes p
      WHERE p.id = mediciones_bioimpedancia.paciente_id
      AND p.profesional_id = auth.uid()
    )
  );
CREATE POLICY "bio_paciente_read" ON mediciones_bioimpedancia
  FOR SELECT USING (paciente_id = auth.uid());

-- ================================================================
-- 6. TABLA: PLANES (Minutas alimentarias)
-- ================================================================
CREATE TABLE IF NOT EXISTS planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  titulo VARCHAR(255),
  especialidad VARCHAR(50) DEFAULT 'nutricion',

  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT TRUE,

  -- Estructura semanal en JSONB
  estructura JSONB, -- { lunes: { desayuno, colacion_am, almuerzo, colacion_pm, cena, cena_tardia }, ... }

  -- Contenido texto libre (legacy)
  contenido TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_planes_paciente ON planes(paciente_id);
CREATE INDEX idx_planes_profesional ON planes(profesional_id);
CREATE INDEX idx_planes_activo ON planes(activo);

ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planes_profesional_read" ON planes
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "planes_profesional_write" ON planes
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "planes_profesional_update" ON planes
  FOR UPDATE USING (profesional_id = auth.uid());
CREATE POLICY "planes_paciente_read" ON planes
  FOR SELECT USING (paciente_id = auth.uid());

-- ================================================================
-- 7. TABLA: SUPLEMENTOS
-- ================================================================
CREATE TABLE IF NOT EXISTS suplementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  nombre VARCHAR(255) NOT NULL,
  dosis VARCHAR(100),
  frecuencia VARCHAR(100),
  instrucciones TEXT,

  activo BOOLEAN DEFAULT TRUE,
  fecha_inicio DATE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_suplementos_paciente ON suplementos(paciente_id);
CREATE INDEX idx_suplementos_profesional ON suplementos(profesional_id);

ALTER TABLE suplementos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suplementos_profesional_read" ON suplementos
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "suplementos_profesional_write" ON suplementos
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "suplementos_paciente_read" ON suplementos
  FOR SELECT USING (paciente_id = auth.uid());

-- ================================================================
-- 8. TABLA: NOTAS_CLINICAS
-- ================================================================
CREATE TABLE IF NOT EXISTS notas_clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  tipo VARCHAR(50) NOT NULL, -- 'clinica' (privada) o 'paciente' (visible en portal)
  titulo VARCHAR(255),
  contenido TEXT NOT NULL,

  archivos TEXT[], -- nombres de archivos
  archivos_urls TEXT[], -- URLs en Storage
  archivos_size_kb INTEGER[],

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notas_paciente ON notas_clinicas(paciente_id);
CREATE INDEX idx_notas_profesional ON notas_clinicas(profesional_id);
CREATE INDEX idx_notas_tipo ON notas_clinicas(tipo);

ALTER TABLE notas_clinicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notas_profesional_read" ON notas_clinicas
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "notas_profesional_write" ON notas_clinicas
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "notas_profesional_update" ON notas_clinicas
  FOR UPDATE USING (profesional_id = auth.uid());
CREATE POLICY "notas_paciente_read" ON notas_clinicas
  FOR SELECT USING (paciente_id = auth.uid() AND tipo = 'paciente');

-- ================================================================
-- 9. TABLA: CITAS (AGENDA)
-- ================================================================
CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  duracion_min INTEGER,

  paciente_nombre VARCHAR(255), -- desnormalizado para búsqueda

  motivo TEXT,
  observaciones TEXT,

  estado VARCHAR(50) DEFAULT 'programada', -- programada, realizada, cancelada

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_citas_profesional ON citas(profesional_id);
CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_citas_estado ON citas(estado);

ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "citas_profesional_read" ON citas
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "citas_profesional_write" ON citas
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "citas_profesional_update" ON citas
  FOR UPDATE USING (profesional_id = auth.uid());
CREATE POLICY "citas_paciente_read" ON citas
  FOR SELECT USING (paciente_id = auth.uid());

-- ================================================================
-- 10. TABLA: EXAMENES (Laboratorios, etc.)
-- ================================================================
CREATE TABLE IF NOT EXISTS examenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  fecha DATE NOT NULL,

  tipo VARCHAR(100),
  resultado TEXT,
  notas TEXT,

  archivo_nombre VARCHAR(255),
  archivo_tipo VARCHAR(50), -- mime-type
  archivo_url VARCHAR(500),
  archivo_size_kb INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_examenes_paciente ON examenes(paciente_id);
CREATE INDEX idx_examenes_profesional ON examenes(profesional_id);
CREATE INDEX idx_examenes_fecha ON examenes(fecha);

ALTER TABLE examenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "examenes_profesional_read" ON examenes
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "examenes_profesional_write" ON examenes
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "examenes_paciente_read" ON examenes
  FOR SELECT USING (paciente_id = auth.uid());

-- ================================================================
-- 11. TABLA: PERFILES_PROFESIONALES
-- ================================================================
CREATE TABLE IF NOT EXISTS perfiles_profesionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  nombre VARCHAR(255),
  profesion VARCHAR(100),
  numero_registro VARCHAR(50),
  telefono VARCHAR(20),
  correo VARCHAR(255),
  direccion TEXT,

  -- Identidad visual
  color_principal VARCHAR(7) DEFAULT '#059669',
  color_texto_header VARCHAR(7) DEFAULT '#ffffff',

  -- Suscripción
  plan_suscripcion VARCHAR(50) DEFAULT 'free', -- free, inicial, pro, ilimitado

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_perfiles_profesional ON perfiles_profesionales(profesional_id);

ALTER TABLE perfiles_profesionales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perfiles_read" ON perfiles_profesionales
  FOR SELECT USING (TRUE); -- Readable by all authenticated users
CREATE POLICY "perfiles_write" ON perfiles_profesionales
  FOR INSERT WITH CHECK (profesional_id = auth.uid());
CREATE POLICY "perfiles_update" ON perfiles_profesionales
  FOR UPDATE USING (profesional_id = auth.uid());

-- ================================================================
-- 12. TABLA: PACIENTE_PROFESIONAL (Relación many-to-many)
-- ================================================================
CREATE TABLE IF NOT EXISTS paciente_profesional (
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  especialidad VARCHAR(50) DEFAULT 'nutricion', -- nutricion, psicologia, kinesiologia, etc
  fecha_registro DATE DEFAULT CURRENT_DATE,

  PRIMARY KEY (paciente_id, profesional_id)
);

CREATE INDEX idx_pacprof_paciente ON paciente_profesional(paciente_id);
CREATE INDEX idx_pacprof_profesional ON paciente_profesional(profesional_id);

ALTER TABLE paciente_profesional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pacprof_read" ON paciente_profesional
  FOR SELECT USING (profesional_id = auth.uid());
CREATE POLICY "pacprof_write" ON paciente_profesional
  FOR INSERT WITH CHECK (profesional_id = auth.uid());

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================
SELECT '✅ Schema creado exitosamente' AS resultado;
