-- ============================================
-- BENESTAR DATABASE SCHEMA
-- Profesional, escalable, multi-especialidad
-- ============================================

-- CORE: USUARIOS Y PERFILES
-- ============================================

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  plan_suscripcion VARCHAR(50) DEFAULT 'free',
  estado VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS perfil_profesional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(255),
  profesion VARCHAR(255),
  numero_registro VARCHAR(255),
  telefono VARCHAR(20),
  correo VARCHAR(255),
  direccion TEXT,
  color_principal VARCHAR(7) DEFAULT '#059669',
  color_texto_header VARCHAR(7) DEFAULT '#ffffff',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CORE: PACIENTES
-- ============================================

CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
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
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  especialidad VARCHAR(50) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  UNIQUE(paciente_id, usuario_id, especialidad)
);

-- AUDITORÍA: registro de cambios en datos críticos
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tabla VARCHAR(255) NOT NULL,
  registro_id UUID NOT NULL,
  accion VARCHAR(50) NOT NULL,
  datos_antes JSONB,
  datos_despues JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
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

-- MEDICIONES: NUTRICIÓN
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
  per_brazo_relajado NUMERIC(6,2),
  per_brazo_contraido NUMERIC(6,2),
  per_torax NUMERIC(6,2),
  per_abdomen NUMERIC(6,2),
  per_muslo NUMERIC(6,2),
  per_pantorrilla NUMERIC(6,2),
  pliegue_tricipital NUMERIC(6,2),
  pliegue_bicipital NUMERIC(6,2),
  pliegue_subescapular NUMERIC(6,2),
  pliegue_suprailiaco NUMERIC(6,2),
  pliegue_abdominal NUMERIC(6,2),
  pliegue_muslo NUMERIC(6,2),
  pliegue_pantorrilla NUMERIC(6,2),
  envergadura NUMERIC(6,2),
  altura_sentado NUMERIC(6,2),
  fotos_nombres TEXT[],
  fotos_urls TEXT[],
  fotos_size_kb INT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mediciones_bioimpedancia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  masa_grasa_kg NUMERIC(6,2) NOT NULL,
  masa_grasa_pct NUMERIC(5,2) NOT NULL,
  masa_magra_kg NUMERIC(6,2) NOT NULL,
  masa_libre_grasa NUMERIC(6,2),
  agua_corporal_lt NUMERIC(6,2) NOT NULL,
  agua_corporal_pct NUMERIC(5,2) NOT NULL,
  grasa_visceral NUMERIC(6,2),
  proteina_corporal NUMERIC(6,2),
  masa_osea NUMERIC(6,2),
  metabolismo_basal_kcal NUMERIC(8,0),
  edad_metabolica INT,
  seg_brazo_izq NUMERIC(6,2),
  seg_brazo_der NUMERIC(6,2),
  seg_tronco NUMERIC(6,2),
  seg_pierna_izq NUMERIC(6,2),
  seg_pierna_der NUMERIC(6,2),
  fotos_nombres TEXT[],
  fotos_urls TEXT[],
  fotos_size_kb INT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- MEDICIONES: KINESIOLOGÍA (template para expansión)
-- ============================================

CREATE TABLE IF NOT EXISTS mediciones_rango_movimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  articulacion VARCHAR(255) NOT NULL,
  movimiento VARCHAR(255) NOT NULL,
  rango_grados NUMERIC(5,1),
  lado VARCHAR(10),
  dolor_presente BOOLEAN DEFAULT FALSE,
  restriccion_movimiento TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PRESCRIPCIONES: SUPLEMENTOS (Nutrición)
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

-- PRESCRIPCIONES: MEDICAMENTOS (todas las especialidades)
-- ============================================

CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  especialidad VARCHAR(50),
  nombre VARCHAR(255) NOT NULL,
  dosis VARCHAR(255),
  frecuencia VARCHAR(255),
  indicaciones TEXT,
  contraindicaciones TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PRESCRIPCIONES: EJERCICIOS (Kinesiología)
-- ============================================

CREATE TABLE IF NOT EXISTS ejercicios_kinesioterapia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES planes(id) ON DELETE SET NULL,
  nombre VARCHAR(255) NOT NULL,
  series INT,
  repeticiones INT,
  duracion_minutos INT,
  intensidad VARCHAR(50),
  indicaciones TEXT,
  contraindicaciones TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_inicio DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DOCUMENTACIÓN: EXÁMENES (genérico)
-- Archivos permitidos: jpg, jpeg, png, heic, webp, gif, pdf
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

-- DOCUMENTACIÓN: NOTAS CLÍNICAS (genérico)
-- Archivos permitidos: jpg, jpeg, png, heic, webp, gif, pdf
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

-- AGENDA: CITAS (genérico)
-- ============================================

CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
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

-- ÍNDICES: Optimización de queries
-- ============================================

CREATE INDEX idx_pacientes_usuario_id ON pacientes(usuario_id);
CREATE INDEX idx_pacientes_rut ON pacientes(rut);
CREATE INDEX idx_pacientes_estado ON pacientes(estado);

CREATE INDEX idx_paciente_profesional_usuario_id ON paciente_profesional(usuario_id);
CREATE INDEX idx_paciente_profesional_especialidad ON paciente_profesional(especialidad);

CREATE INDEX idx_consultas_paciente_id ON consultas(paciente_id);
CREATE INDEX idx_consultas_especialidad ON consultas(especialidad);
CREATE INDEX idx_consultas_fecha ON consultas(fecha);

CREATE INDEX idx_planes_paciente_id ON planes(paciente_id);
CREATE INDEX idx_planes_especialidad ON planes(especialidad);
CREATE INDEX idx_planes_activo ON planes(activo);

CREATE INDEX idx_mediciones_antropometria_paciente ON mediciones_antropometria(paciente_id);
CREATE INDEX idx_mediciones_antropometria_fecha ON mediciones_antropometria(fecha);

CREATE INDEX idx_mediciones_bioimpedancia_paciente ON mediciones_bioimpedancia(paciente_id);
CREATE INDEX idx_mediciones_bioimpedancia_fecha ON mediciones_bioimpedancia(fecha);

CREATE INDEX idx_suplementos_paciente ON suplementos(paciente_id);
CREATE INDEX idx_suplementos_activo ON suplementos(activo);

CREATE INDEX idx_medicamentos_paciente ON medicamentos(paciente_id);
CREATE INDEX idx_medicamentos_activo ON medicamentos(activo);

CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_citas_usuario ON citas(usuario_id);
CREATE INDEX idx_citas_especialidad ON citas(especialidad);
CREATE INDEX idx_citas_fecha ON citas(fecha);

CREATE INDEX idx_audit_log_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_log_tabla ON audit_log(tabla);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_profesional ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paciente_profesional ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediciones_antropometria ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediciones_bioimpedancia ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediciones_rango_movimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE suplementos ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ejercicios_kinesioterapia ENABLE ROW LEVEL SECURITY;
ALTER TABLE examenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS: Profesional solo ve sus pacientes
-- ============================================

-- Los profesionales solo ven sus propios pacientes
CREATE POLICY "usuarios_can_view_self" ON usuarios
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "perfil_can_view_own" ON perfil_profesional
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "pacientes_only_own" ON pacientes
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

-- Relaciones, consultas, planes, mediciones y demás solo para sus pacientes
CREATE POLICY "paciente_profesional_only_own" ON paciente_profesional
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "consultas_only_own_pacientes" ON consultas
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "planes_only_own_pacientes" ON planes
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "mediciones_antropometria_only_own" ON mediciones_antropometria
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "mediciones_bioimpedancia_only_own" ON mediciones_bioimpedancia
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "suplementos_only_own" ON suplementos
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "medicamentos_only_own" ON medicamentos
  FOR SELECT USING (
    paciente_id IN (
      SELECT id FROM pacientes WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "citas_only_own" ON citas
  FOR SELECT USING (
    usuario_id = auth.uid() OR
    paciente_id IN (SELECT id FROM pacientes WHERE usuario_id = auth.uid())
  );

CREATE POLICY "audit_log_only_own" ON audit_log
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

-- POLÍTICA RLS: Permitir INSERT en perfil_profesional para signup
CREATE POLICY "perfil_can_insert_own" ON perfil_profesional
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);
