-- DROPEAR TODAS LAS POLICIES EXISTENTES
-- ============================================

DROP POLICY IF EXISTS "perfil_can_view_own" ON perfil_profesional;
DROP POLICY IF EXISTS "perfil_can_update_own" ON perfil_profesional;
DROP POLICY IF EXISTS "perfil_can_insert_own" ON perfil_profesional;

DROP POLICY IF EXISTS "pacientes_select_own" ON pacientes;
DROP POLICY IF EXISTS "pacientes_insert_own" ON pacientes;
DROP POLICY IF EXISTS "pacientes_update_own" ON pacientes;

DROP POLICY IF EXISTS "consultas_select_own" ON consultas;
DROP POLICY IF EXISTS "consultas_insert_own" ON consultas;
DROP POLICY IF EXISTS "consultas_update_own" ON consultas;
DROP POLICY IF EXISTS "consultas_delete_own" ON consultas;

DROP POLICY IF EXISTS "planes_select_own" ON planes;
DROP POLICY IF EXISTS "planes_insert_own" ON planes;
DROP POLICY IF EXISTS "planes_update_own" ON planes;
DROP POLICY IF EXISTS "planes_delete_own" ON planes;

DROP POLICY IF EXISTS "antropometria_select_own" ON mediciones_antropometria;
DROP POLICY IF EXISTS "antropometria_insert_own" ON mediciones_antropometria;
DROP POLICY IF EXISTS "antropometria_delete_own" ON mediciones_antropometria;

DROP POLICY IF EXISTS "bioimpedancia_select_own" ON mediciones_bioimpedancia;
DROP POLICY IF EXISTS "bioimpedancia_insert_own" ON mediciones_bioimpedancia;
DROP POLICY IF EXISTS "bioimpedancia_delete_own" ON mediciones_bioimpedancia;

DROP POLICY IF EXISTS "examenes_select_own" ON examenes;
DROP POLICY IF EXISTS "examenes_insert_own" ON examenes;
DROP POLICY IF EXISTS "examenes_update_own" ON examenes;
DROP POLICY IF EXISTS "examenes_delete_own" ON examenes;

DROP POLICY IF EXISTS "notas_select_own" ON notas_clinicas;
DROP POLICY IF EXISTS "notas_insert_own" ON notas_clinicas;
DROP POLICY IF EXISTS "notas_update_own" ON notas_clinicas;
DROP POLICY IF EXISTS "notas_delete_own" ON notas_clinicas;

DROP POLICY IF EXISTS "suplementos_select_own" ON suplementos;
DROP POLICY IF EXISTS "suplementos_insert_own" ON suplementos;
DROP POLICY IF EXISTS "suplementos_delete_own" ON suplementos;

DROP POLICY IF EXISTS "citas_select_own" ON citas;
DROP POLICY IF EXISTS "citas_insert_own" ON citas;

-- RECREAR TODAS LAS POLICIES
-- ============================================

-- Perfil: Solo el profesional ve su propio perfil
CREATE POLICY "perfil_can_view_own" ON perfil_profesional
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "perfil_can_update_own" ON perfil_profesional
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "perfil_can_insert_own" ON perfil_profesional
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pacientes: Solo el profesional asignado ve/modifica sus pacientes
CREATE POLICY "pacientes_select_own" ON pacientes
  FOR SELECT USING (auth.uid() = profesional_id);

CREATE POLICY "pacientes_insert_own" ON pacientes
  FOR INSERT WITH CHECK (auth.uid() = profesional_id);

CREATE POLICY "pacientes_update_own" ON pacientes
  FOR UPDATE USING (auth.uid() = profesional_id);

-- Consultas: Solo para pacientes del profesional (CRUD completo)
CREATE POLICY "consultas_select_own" ON consultas
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "consultas_insert_own" ON consultas
  FOR INSERT WITH CHECK (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "consultas_update_own" ON consultas
  FOR UPDATE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "consultas_delete_own" ON consultas
  FOR DELETE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

-- Planes: Solo para pacientes del profesional (CRUD completo)
CREATE POLICY "planes_select_own" ON planes
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "planes_insert_own" ON planes
  FOR INSERT WITH CHECK (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "planes_update_own" ON planes
  FOR UPDATE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "planes_delete_own" ON planes
  FOR DELETE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

-- Mediciones Antropometría: Solo para pacientes del profesional (CRUD)
CREATE POLICY "antropometria_select_own" ON mediciones_antropometria
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "antropometria_insert_own" ON mediciones_antropometria
  FOR INSERT WITH CHECK (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "antropometria_delete_own" ON mediciones_antropometria
  FOR DELETE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

-- Mediciones Bioimpedancia: Solo para pacientes del profesional (CRUD)
CREATE POLICY "bioimpedancia_select_own" ON mediciones_bioimpedancia
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "bioimpedancia_insert_own" ON mediciones_bioimpedancia
  FOR INSERT WITH CHECK (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "bioimpedancia_delete_own" ON mediciones_bioimpedancia
  FOR DELETE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

-- Exámenes: Solo para pacientes del profesional (CRUD completo)
CREATE POLICY "examenes_select_own" ON examenes
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "examenes_insert_own" ON examenes
  FOR INSERT WITH CHECK (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "examenes_update_own" ON examenes
  FOR UPDATE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "examenes_delete_own" ON examenes
  FOR DELETE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

-- Notas Clínicas: Solo para pacientes del profesional (CRUD completo)
CREATE POLICY "notas_select_own" ON notas_clinicas
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "notas_insert_own" ON notas_clinicas
  FOR INSERT WITH CHECK (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "notas_update_own" ON notas_clinicas
  FOR UPDATE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "notas_delete_own" ON notas_clinicas
  FOR DELETE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

-- Suplementos: Solo para pacientes del profesional
CREATE POLICY "suplementos_select_own" ON suplementos
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "suplementos_insert_own" ON suplementos
  FOR INSERT WITH CHECK (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "suplementos_delete_own" ON suplementos
  FOR DELETE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

-- Citas: Profesional ve/crea sus propias citas
CREATE POLICY "citas_select_own" ON citas
  FOR SELECT USING (auth.uid() = profesional_id);

CREATE POLICY "citas_insert_own" ON citas
  FOR INSERT WITH CHECK (auth.uid() = profesional_id);
