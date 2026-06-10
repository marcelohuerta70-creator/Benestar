-- CREAR TABLA MEDICAMENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  dosis VARCHAR(255),
  frecuencia VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_medicamentos_paciente_id ON medicamentos(paciente_id);

-- RLS
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "medicamentos_select_own" ON medicamentos;
DROP POLICY IF EXISTS "medicamentos_insert_own" ON medicamentos;
DROP POLICY IF EXISTS "medicamentos_delete_own" ON medicamentos;

CREATE POLICY "medicamentos_select_own" ON medicamentos
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "medicamentos_insert_own" ON medicamentos
  FOR INSERT WITH CHECK (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );

CREATE POLICY "medicamentos_delete_own" ON medicamentos
  FOR DELETE USING (
    paciente_id IN (SELECT id FROM pacientes WHERE profesional_id = auth.uid())
  );
