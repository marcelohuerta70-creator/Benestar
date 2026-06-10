-- AGREGAR CAMPOS SEPARADOS PARA BRAZO RELAJADO Y CONTRAÍDO
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS per_brazo_relajado_cm DECIMAL(5,2);
ALTER TABLE mediciones_antropometria ADD COLUMN IF NOT EXISTS per_brazo_contraido_cm DECIMAL(5,2);
