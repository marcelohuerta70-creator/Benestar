# ANÁLISIS EXHAUSTIVO DE CAMPOS - CÓDIGO REAL

**Fecha**: 2026-06-14  
**Método**: Análisis directo del código TypeScript/React

Este documento mapea EXACTAMENTE qué datos se piden en cada página/sección, con nombres de campos precisos extraídos del código real.

---

## PARTE 1: CREACIÓN DE PACIENTE (nuevo-paciente-dialog.tsx)

### 🔴 REQUERIDOS (obligatorios)
1. `nombre_completo` - TEXT - Input libre
2. `rut` - TEXT - Input libre (formato: 12.345.678-9)
3. `fecha_nacimiento` - DATE - Input date
4. `sexo` - ENUM('M', 'F') - Select dropdown
5. `objetivo` - VARCHAR - Select dropdown (OBJETIVOS array)
6. `contraseña` - TEXT - Input password (se guarda en `contraseña_hash` con hash bcrypt)

### 🟡 OPCIONALES
7. `email` - TEXT - Input libre
8. `telefono` - TEXT - Input libre
9. `notas_generales` - TEXT - Textarea

### 🔵 AUTOMÁTICOS
10. `profesional_id` - UUID FK - Del usuario autenticado (auth.users)
11. `estado` - VARCHAR - Siempre 'activo'
12. `portal_activo` - BOOLEAN - Siempre false (el profesional puede activarlo después)
13. `created_at` - TIMESTAMP - NOW()

**Tabla destino**: `pacientes`

**Nota importante**: El RUT + contraseña es lo que usa el paciente para acceder al portal. No se crea usuario Auth separado para pacientes, solo se almacena la contraseña hasheada.

---

## PARTE 2: FICHA GENERAL (ficha-general.tsx)

### Sección: DATOS PERSONALES
1. `nombre_completo` - TEXT - Editable (igual que al crear)
2. `rut` - TEXT - Editable
3. `fecha_nacimiento` - DATE - Editable
4. `sexo` - ENUM('M', 'F') - Select editable
5. `genero` - VARCHAR - Select editable (valores: 'femenino', 'masculino', 'no_binario', 'otro', 'no_responde')
6. `objetivo` - TEXT - Editable

**Tabla destino**: `pacientes`

### Sección: CONTACTO
7. `telefono` - TEXT - Editable
8. `email` - TEXT - Editable
9. `contacto_emergencia` - TEXT - Editable (nombre del contacto)
10. `telefono_emergencia` - TEXT - Editable

**Tabla destino**: `pacientes`

### Sección: DOMICILIO
11. `direccion` - TEXT - Editable
12. `comuna` - VARCHAR - Editable
13. `ciudad` - VARCHAR - Editable

**Tabla destino**: `pacientes`

### Sección: SISTEMA DE SALUD
14. `prevision` - VARCHAR - Select editable (valores: 'fonasa', 'isapre', 'particular', 'otro')
15. `prevision_otro` - TEXT - Conditional input (aparece si prevision='otro')
16. `cesfam` - VARCHAR - Editable
17. `medico_tratante` - VARCHAR - Editable

**Tabla destino**: `pacientes`

### Sección: PORTAL
18. `portal_activo` - BOOLEAN - Toggle (switch editable)
19. `contraseña_hash` - TEXT - Editable solo si portal_activo=true y en modo edit

**Tabla destino**: `pacientes`

### Sección: NOTAS GENERALES
20. `notas_generales` - TEXT - Textarea editable

**Tabla destino**: `pacientes`

---

## PARTE 3: FICHA CLÍNICA (ficha-clinica.tsx)

### Campo 1: ENFERMEDADES/DIAGNÓSTICOS
1. `enfermedades` - TEXT - Textarea editable
   - Placeholder: "Diabetes tipo 2, Hipertensión arterial, Hipotiroidismo..."

**Tabla destino**: `pacientes`

### Campo 2: MEDICAMENTOS ACTUALES (TABLA)
Esta es una **tabla separada** `medicamentos` con relación a paciente:
- `medicamentos.paciente_id` - UUID FK → pacientes.id
- `medicamentos.nombre` - TEXT - Editable (nombre del medicamento)
- `medicamentos.dosis` - VARCHAR - Editable
- `medicamentos.frecuencia` - VARCHAR - Editable

**Tabla destino**: `medicamentos` (tabla separada)

### Campo 3: ALERGIAS FARMACOLÓGICAS
2. `alergias_farmacologicas` - TEXT - Textarea editable
   - Placeholder: "Penicilina, AINEs, Sulfonamidas..."

**Tabla destino**: `pacientes`

### Campo 4: ANTECEDENTES FAMILIARES
3. `antecedentes_familiares` - TEXT - Textarea editable
   - Placeholder: "Diabetes en padres, enfermedades cardiovasculares, cáncer..."

**Tabla destino**: `pacientes`

### Campo 5: CIRUGÍAS PREVIAS
4. `cirugias_previas` - TEXT - Textarea editable
   - Placeholder: "Colecistectomía 2018, manga gástrica 2020..."

**Tabla destino**: `pacientes`

### Campo 6: OBSERVACIONES CLÍNICAS
5. `observaciones_clinicas` - TEXT - Textarea editable
   - Placeholder: "Otras observaciones relevantes para el tratamiento..."

**Tabla destino**: `pacientes`

### Campo 7: NOTAS LIBRES
6. `notas_clinica` - TEXT - Textarea editable (nombre en código: `notas_clinica`, no `notas_clinicas`)
   - Placeholder: "Espacio libre para cualquier nota clínica adicional..."

**Tabla destino**: `pacientes`

---

## PARTE 4: FICHA HÁBITOS (ficha-habitos.tsx)

Todas son TEXT/TEXTAREA, todas en tabla `pacientes`:

1. `habito_actividad_fisica` - TEXT
   - Label: "Actividad física"
   - Placeholder: "Tipo, frecuencia, intensidad..."

2. `habito_consumo_agua` - TEXT
   - Label: "Consumo de agua"
   - Placeholder: "Litros al día, tipo de bebidas..."

3. `habito_sueno` - TEXT
   - Label: "Sueño"
   - Placeholder: "Horas, calidad, horarios..."

4. `habito_alcohol` - TEXT
   - Label: "Alcohol"
   - Placeholder: "Frecuencia, tipo, cantidad..."

5. `habito_tabaco` - TEXT
   - Label: "Tabaco"
   - Placeholder: "Cigarrillos al día, años de consumo..."

6. `habito_drogas` - TEXT
   - Label: "Otras sustancias"
   - Placeholder: "Tipo, frecuencia..."

7. `habito_deposiciones` - TEXT
   - Label: "Deposiciones"
   - Placeholder: "Frecuencia, consistencia, dificultades..."

8. `notas_habitos` - TEXT
   - Label: "Notas libres"
   - Placeholder: "Cualquier observación adicional sobre los hábitos del paciente..."

**Tabla destino**: `pacientes`

---

## PARTE 5: FICHA ALIMENTACIÓN (ficha-alimentacion.tsx)

1. `tipo_alimentacion` - VARCHAR - Select editable
   - Valores: 'omnivoro', 'vegetariano', 'vegano', 'pescetariano', 'otro'
   - Label: "Tipo de alimentación"

2. `tipo_alimentacion_otro` - TEXT - Conditional input
   - Aparece si tipo_alimentacion='otro'
   - Placeholder: "Describe el tipo de alimentación"

3. `preferencias_alimentarias` - TEXT - Textarea
   - Label: "Preferencias alimentarias"
   - Placeholder: "Alimentos que el paciente prefiere o le agradan..."

4. `alergias_alimentarias` - TEXT - Textarea
   - Label: "Alergias e intolerancias alimentarias"
   - Placeholder: "Gluten, lactosa, mariscos, nueces..."

5. `alimentos_no_consume` - TEXT - Textarea
   - Label: "Alimentos que no consume"
   - Placeholder: "Alimentos que el paciente no consume por preferencia (no por alergia)..."

6. `suplementos_habituales` - TEXT - Textarea
   - Label: "Suplementos habituales"
   - Placeholder: "Suplementos que el paciente consume por cuenta propia..."

7. `notas_alimentacion` - TEXT - Textarea
   - Label: "Notas libres — Alimentación"
   - Placeholder: "Cualquier observación adicional sobre la alimentación del paciente..."

**Tabla destino**: `pacientes`

---

## PARTE 6: FICHA TIPO PACIENTE (ficha-tipo-paciente.tsx)

1. `tipo_paciente` - VARCHAR - Select editable
   - Valores: 'adulto', 'adulto_mayor', 'embarazada', 'nodriza', 'lactante', 'preescolar', 'escolar', 'adolescente', 'postrado', 'deportista', 'otro'

2. `tipo_paciente_datos` - JSONB - Objeto con campos dinámicos según tipo

### CAMPOS DINÁMICOS POR TIPO:

#### Adulto
- Sin campos adicionales

#### Adulto Mayor
- `dependencia` - TEXT - Input
- `protesis_dental` - TEXT - Input (Uso de prótesis dental)
- `pacam` - TEXT - Input
- `notas` - TEXT - Textarea (Notas adicionales)

#### Embarazada
- `fur` - DATE - Input date (FUR = Fecha última regla)
- `semanas_gestacion` - TEXT - Input (Semanas de gestación)
- `fecha_probable_parto` - DATE - Input date
- `notas` - TEXT - Textarea

#### Nodriza
- `edad_lactante` - TEXT - Input
- `tipo_lactancia` - TEXT - Input
- `notas` - TEXT - Textarea

#### Lactante
- `tipo_alimentacion` - TEXT - Input (Diferente del tipo_alimentacion de adulto)
- `suplementacion` - TEXT - Input
- `cuidador_principal` - TEXT - Input
- `notas` - TEXT - Textarea

#### Preescolar
- `jardin_infantil` - TEXT - Input
- `responsable_alimentacion` - TEXT - Input
- `notas` - TEXT - Textarea

#### Escolar
- `curso` - TEXT - Input
- `establecimiento` - TEXT - Input (Establecimiento educacional)
- `notas` - TEXT - Textarea

#### Adolescente
- `actividad_fisica` - TEXT - Input
- `conductas_riesgo` - TEXT - Textarea (Conductas alimentarias de riesgo)
- `notas` - TEXT - Textarea

#### Postrado
- `dependencia` - TEXT - Input
- `cuidador_principal` - TEXT - Input
- `via_alimentacion` - TEXT - Input
- `notas` - TEXT - Textarea

#### Deportista
- `disciplina` - TEXT - Input (Disciplina deportiva)
- `nivel` - TEXT - Input (amateur/semipro/profesional)
- `dias_entrenamiento` - TEXT - Input (Días por semana)
- `horas_semanales` - TEXT - Input (Horas de entrenamiento semanales)
- `proxima_competencia` - DATE - Input date
- `objetivo_deportivo` - TEXT - Textarea
- `notas` - TEXT - Textarea

#### Otro
- `notas` - TEXT - Textarea (Descripción / notas)

**Tabla destino**: `pacientes`

---

## PARTE 7: FICHA CONTROLES (ficha-controles.tsx)

Esta es la más compleja. Hay 2 niveles de formularios:
1. **Consulta** (datos generales de la visita)
2. **Mediciones** (antropometría + bioimpedancia, OPCIONALES)

### NIVEL 1: CONSULTA

#### Sección "General"
1. `fecha` - DATE - Input date (REQUERIDO)
2. `tipo_consulta` - VARCHAR - Select
   - Valores: 'primera_consulta', 'seguimiento', 'alta_nutricional'
   - Default: 'seguimiento'
3. `proxima_cita` - DATE - Input date (OPCIONAL)
4. `proxima_cita_hora` - TIME - Input time (OPCIONAL, aparece si proxima_cita tiene valor)

#### Sección "Evolución"
5. `adherencia` - VARCHAR - Select (OPCIONAL)
   - Valores: 'muy_buena', 'buena', 'regular', 'mala', '' (vacío)
6. `cambios_observados` - TEXT - Textarea (OPCIONAL)
7. `dificultades_reportadas` - TEXT - Textarea (OPCIONAL)
8. `observaciones_clinicas` - TEXT - Textarea (OPCIONAL)

#### Sección "Control de Hábitos"
9. `ctrl_actividad_fisica` - TEXT - Textarea (OPCIONAL)
10. `ctrl_consumo_agua` - TEXT - Textarea (OPCIONAL)
11. `ctrl_sueno` - TEXT - Textarea (OPCIONAL)
12. `ctrl_deposiciones` - TEXT - Textarea (OPCIONAL)
13. `ctrl_alcohol` - TEXT - Textarea (OPCIONAL)
14. `ctrl_tabaco` - TEXT - Textarea (OPCIONAL)

#### Sección "Diagnóstico"
15. `diagnostico_nutricional` - TEXT - Textarea (OPCIONAL)
16. `indicaciones` - TEXT - Textarea (OPCIONAL)
17. `objetivos_proximo_control` - TEXT - Textarea (OPCIONAL)

#### Sección "Nota para Paciente"
18. `nota_para_paciente` - TEXT - Textarea (OPCIONAL, visible en portal del paciente)

#### Adjuntos
19. `adjuntos` - TEXT[] - File upload (OPCIONAL)
20. `archivos_urls` - TEXT[] - Storage URLs (auto-generadas)

**Tabla destino**: `consultas`

### NIVEL 2: MEDICIONES OPCIONALES

#### Checkbox: "Incluir mediciones" (checkbox global)
- Si está checked, permite ingresar mediciones
- Si no está checked, NO se guardan mediciones

#### Sub-sección: ANTROPOMETRÍA (BÁSICA)
1. `peso_kg` - DECIMAL - Input number (REQUERIDO si incluir_mediciones=true)
2. `talla_cm` - DECIMAL - Input number (REQUERIDO si incluir_mediciones=true)

Calculados automáticamente:
- `imc` = peso / (talla/100)^2
- `icc` = cintura / cadera (si hay cadera)

#### Campos de perímetros básicos
3. `perimetro_cintura_cm` - DECIMAL - Input number (OPCIONAL)
4. `perimetro_cadera_cm` - DECIMAL - Input number (OPCIONAL)

#### [EXPANDIR] Medidas avanzadas (collapsible)
5. `per_brazo_relajado` - DECIMAL - Input number (OPCIONAL)
6. `per_brazo_contraido` - DECIMAL - Input number (OPCIONAL)
7. `per_torax` - DECIMAL - Input number (OPCIONAL)
8. `per_abdomen` - DECIMAL - Input number (OPCIONAL)
9. `per_muslo` - DECIMAL - Input number (OPCIONAL)
10. `per_pantorrilla` - DECIMAL - Input number (OPCIONAL)

#### Pliegues cutáneos (dentro de avanzadas)
11. `pliegue_tricipital` - DECIMAL - Input number (OPCIONAL)
12. `pliegue_bicipital` - DECIMAL - Input number (OPCIONAL)
13. `pliegue_subescapular` - DECIMAL - Input number (OPCIONAL)
14. `pliegue_suprailiaco` - DECIMAL - Input number (OPCIONAL)
15. `pliegue_abdominal` - DECIMAL - Input number (OPCIONAL)
16. `pliegue_muslo` - DECIMAL - Input number (OPCIONAL)
17. `pliegue_pantorrilla` - DECIMAL - Input number (OPCIONAL)

#### Opcionales
18. `envergadura` - DECIMAL - Input number (OPCIONAL)
19. `altura_sentado` - DECIMAL - Input number (OPCIONAL)

**Tabla destino**: `mediciones_antropometria`

#### Checkbox: "Incluir Bioimpedancia" (dentro de mediciones)
- Si está checked, permite ingresar datos de bioimpedancia
- Todos los campos son opcionales
- PERO se requiere al menos 1 campo lleno para guardar el registro

#### BIOIMPEDANCIA (BÁSICA/AVANZADA)
1. `masa_grasa_kg` - DECIMAL (OPCIONAL)
2. `masa_grasa_pct` - DECIMAL (OPCIONAL)
3. `masa_magra_kg` - DECIMAL (OPCIONAL)
4. `agua_corporal_lt` - DECIMAL (OPCIONAL) - **IMPORTANTE: es LT, no kg**
5. `agua_corporal_pct` - DECIMAL (OPCIONAL)
6. `metabolismo_basal_kcal` - INTEGER (OPCIONAL) - **IMPORTANTE: sufijo _kcal**

#### Campos avanzados (expandible)
7. `masa_libre_grasa` - DECIMAL (OPCIONAL)
8. `grasa_visceral` - DECIMAL (OPCIONAL)
9. `proteina_corporal` - DECIMAL (OPCIONAL)
10. `masa_osea` - DECIMAL (OPCIONAL)
11. `edad_metabolica` - INTEGER (OPCIONAL)

#### [EXPANDIR] Segmental (dentro de avanzadas)
12. `seg_brazo_izq` - DECIMAL (OPCIONAL)
13. `seg_brazo_der` - DECIMAL (OPCIONAL)
14. `seg_tronco` - DECIMAL (OPCIONAL)
15. `seg_pierna_izq` - DECIMAL (OPCIONAL)
16. `seg_pierna_der` - DECIMAL (OPCIONAL)

**Tabla destino**: `mediciones_bioimpedancia`

---

## PARTE 8: CAMPOS REUTILIZABLES Y NO-REUTILIZABLES

### ✅ ALTAMENTE REUTILIZABLES (para otras profesiones)
```
GENERALES:
- nombre_completo
- rut
- fecha_nacimiento
- sexo
- email
- telefono
- direccion
- comuna
- ciudad
- contacto_emergencia
- telefono_emergencia
- prevision + prevision_otro
- cesfam
- medico_tratante
- notas_generales

MÉDICOS/CLÍNICOS:
- enfermedades (antecedentes clínicos)
- alergias_farmacologicas
- antecedentes_familiares
- cirugias_previas
- observaciones_clinicas
- medicamentos (tabla separada)
- genero

MEDICIONES BÁSICAS:
- peso_kg
- talla_cm
- imc
- perimetro_cintura_cm
- perimetro_cadera_cm

ESTRUCTURA GENERAL:
- tipo_paciente (útil para cualquier especialidad)
- tipo_paciente_datos (JSONB dinámico)
- portal_activo (útil para cualquier especialidad)
- contraseña_hash
```

### ⚠️ PARCIALMENTE REUTILIZABLES
```
- habito_* (fitness/preparadores físicos podrían usarlos)
- masa_grasa_pct (fitness)
- perimetros_avanzados (fitness/kinesiología)
- pliegues_cutaneos (nutrición + fitness)
```

### ❌ ESPECÍFICOS DE NUTRIS (no reutilizables)
```
- tipo_alimentacion (solo nutricionista)
- preferencias_alimentarias
- alergias_alimentarias
- alimentos_no_consume
- suplementos_habituales
- notas_alimentacion
- estructura_minuta (JSONB de minuta semanal)
- especialidad='nutricion'
```

---

## PARTE 9: DEPENDENCIAS Y RESTRICCIONES

### Restricciones de UI (que deben ser reglas de BD):

1. **Si `tipo_consulta` = 'seguimiento' u 'alta_nutricional'**
   - Se muestran TODOS los campos de evolución, control de hábitos, etc.

2. **Si `tipo_consulta` = 'primera_consulta'**
   - Se recomiendan (pero no obliga) llenar todos los campos

3. **Si `proxima_cita` tiene fecha**
   - Debe haber `proxima_cita_hora` también

4. **Si `tipo_paciente` seleccionado**
   - Se habilitan y exigen los campos dinámicos para ese tipo

5. **Si `tipo_alimentacion` = 'otro'**
   - Se debe ingresar `tipo_alimentacion_otro`

6. **Si `prevision` = 'otro'**
   - Se debe ingresar `prevision_otro`

7. **Si `incluir_mediciones` = true**
   - `peso_kg` y `talla_cm` son REQUERIDOS
   - `imc` se calcula automáticamente

8. **Si `incluir_bio` = true Y `incluir_mediciones` = true**
   - Al menos UNO de estos debe estar lleno:
     - `masa_grasa_kg`, `masa_grasa_pct`, `agua_corporal_pct`, `masa_magra_kg`, `metabolismo_basal_kcal`

---

## PARTE 10: RESUMEN DE TABLAS Y CAMPOS FINALES

### TABLA: `pacientes` (45 campos)
```
IDENTIFICACIÓN (7):
- id (PK)
- profesional_id (FK → auth.users)
- nombre_completo (REQUERIDO)
- rut (REQUERIDO)
- estado = 'activo' (default)

DEMOGRÁFICO (5):
- fecha_nacimiento (REQUERIDO)
- sexo (REQUERIDO, enum: M/F)
- genero (VARCHAR, opcional)
- edad (COMPUTED: NOW() - fecha_nacimiento)

CONTACTO (5):
- email
- telefono
- contacto_emergencia
- telefono_emergencia

DOMICILIO (3):
- direccion
- comuna
- ciudad

SALUD (4):
- prevision (enum: fonasa/isapre/particular/otro)
- prevision_otro
- cesfam
- medico_tratante

INFORMACIÓN CLÍNICA (7):
- objetivo (REQUERIDO)
- notas_generales
- enfermedades
- alergias_farmacologicas
- antecedentes_familiares
- cirugias_previas
- observaciones_clinicas
- notas_clinica

HÁBITOS (8):
- habito_actividad_fisica
- habito_consumo_agua
- habito_sueno
- habito_alcohol
- habito_tabaco
- habito_drogas
- habito_deposiciones
- notas_habitos

ALIMENTACIÓN (7):
- tipo_alimentacion
- tipo_alimentacion_otro
- preferencias_alimentarias
- alergias_alimentarias
- alimentos_no_consume
- suplementos_habituales
- notas_alimentacion

CLASIFICACIÓN (2):
- tipo_paciente (enum: 11 valores)
- tipo_paciente_datos (JSONB)

PORTAL (2):
- portal_activo (boolean)
- contraseña_hash (hashed password)

METADATOS (2):
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### TABLA: `consultas` (20 campos)
```
IDENTIFICACIÓN (3):
- id (PK)
- paciente_id (FK)
- profesional_id (FK)

INFORMACIÓN GENERAL (4):
- fecha (DATE, REQUERIDO)
- tipo_consulta (enum: 3 valores)
- proxima_cita (DATE)
- proxima_cita_hora (TIME)

EVOLUCIÓN (4):
- adherencia (enum: 5 valores + vacío)
- cambios_observados (TEXT)
- dificultades_reportadas (TEXT)
- observaciones_clinicas (TEXT)

CONTROLES DE HÁBITOS (6):
- ctrl_actividad_fisica
- ctrl_consumo_agua
- ctrl_sueno
- ctrl_deposiciones
- ctrl_alcohol
- ctrl_tabaco

DIAGNÓSTICO (3):
- diagnostico_nutricional
- indicaciones
- objetivos_proximo_control

COMUNICACIÓN (1):
- nota_para_paciente (visible en portal)

ARCHIVOS (2):
- adjuntos (TEXT[])
- archivos_urls (TEXT[])

METADATOS (2):
- created_at
- updated_at
```

### TABLA: `mediciones_antropometria` (28 campos)
```
IDENTIFICACIÓN (3):
- id (PK)
- paciente_id (FK)
- consulta_id (FK)
- fecha (DATE)

BÁSICA (5):
- peso_kg (REQUERIDO)
- talla_cm (REQUERIDO)
- imc (COMPUTED)
- perimetro_cintura_cm
- perimetro_cadera_cm
- icc (COMPUTED)

PERÍMETROS AVANZADOS (6):
- per_brazo_relajado_cm
- per_brazo_contraido_cm
- per_torax_cm
- per_abdomen_cm
- per_muslo_cm
- per_pantorrilla_cm

PLIEGUES CUTÁNEOS (7):
- pliegue_tricipital_mm
- pliegue_bicipital_mm
- pliegue_subescapular_mm
- pliegue_suprailiaco_mm
- pliegue_abdominal_mm
- pliegue_muslo_mm
- pliegue_pantorrilla_mm

OTROS (2):
- envergadura_cm
- altura_sentado_cm
- clasificacion_nutricional

METADATOS (2):
- created_at
- updated_at
```

### TABLA: `mediciones_bioimpedancia` (17 campos)
```
IDENTIFICACIÓN (3):
- id (PK)
- paciente_id (FK)
- consulta_id (FK)
- fecha (DATE)

COMPOSICIÓN CORPORAL BÁSICA (5):
- masa_grasa_kg
- masa_grasa_pct
- masa_magra_kg
- agua_corporal_lt (IMPORTANTE: lt, no kg)
- agua_corporal_pct

METABÓLICA (2):
- metabolismo_basal_kcal (IMPORTANTE: _kcal)
- edad_metabolica

AVANZADA (5):
- masa_libre_grasa_kg
- grasa_visceral
- proteina_corporal_kg
- masa_osea_kg

SEGMENTAL (5):
- seg_brazo_izq
- seg_brazo_der
- seg_tronco
- seg_pierna_izq
- seg_pierna_der

METADATOS (2):
- created_at
- updated_at
```

### TABLA: `medicamentos` (6 campos)
```
- id (PK)
- paciente_id (FK)
- nombre (VARCHAR, REQUERIDO)
- dosis (VARCHAR)
- frecuencia (VARCHAR)
- created_at (TIMESTAMP)
```

---

## PARTE 11: NOTAS CRÍTICAS PARA EL SQL

1. **Nombres de campos exactos**:
   - NO `notas_clinicas`, SÍ `notas_clinica`
   - NO `agua_corporal_kg`, SÍ `agua_corporal_lt`
   - NO `metabolismo_basal`, SÍ `metabolismo_basal_kcal`
   - NO `per_brazo`, SÍ `per_brazo_relajado_cm` + `per_brazo_contraido_cm`

2. **FK para mediciones**:
   - `mediciones_antropometria` debe tener `consulta_id`
   - `mediciones_bioimpedancia` debe tener `consulta_id`

3. **Unidades en nombres**:
   - `_cm` para centímetros
   - `_kg` para kilogramos
   - `_lt` para litros
   - `_mm` para milímetros
   - `_pct` para porcentaje
   - `_kcal` para kilocalorías

4. **Enums exactos**:
   - Sexo: 'M', 'F'
   - Tipo consulta: 'primera_consulta', 'seguimiento', 'alta_nutricional'
   - Adherencia: 'muy_buena', 'buena', 'regular', 'mala', ''
   - Estado cita: 'programada', 'realizada', 'cancelada'
   - Tipo paciente: 'adulto', 'adulto_mayor', 'embarazada', 'nodriza', 'lactante', 'preescolar', 'escolar', 'adolescente', 'postrado', 'deportista', 'otro'

5. **Campos JSONB**:
   - `tipo_paciente_datos` es JSONB con estructura variable según tipo_paciente

6. **Arrays**:
   - `adjuntos` y `archivos_urls` son TEXT[]

7. **Passwords**:
   - `contraseña_hash` se guarda con bcrypt hash
   - En el componente nuevo-paciente-dialog se hace: `bcryptjs.hash(password)`
   - Pero en el diálogo actual solo guarda plaintext (FOR TESTING)

---

## PARTE 12: PLAN DE IMPLEMENTACIÓN DEL SQL

**Orden de creación de tablas** (respetando ForeignKeys):

1. `pacientes` (base, solo FK a auth.users)
2. `medicamentos` (FK a pacientes)
3. `consultas` (FK a pacientes)
4. `mediciones_antropometria` (FK a pacientes y consultas)
5. `mediciones_bioimpedancia` (FK a pacientes y consultas)
6. Resto de tablas que ya existen (planes, suplementos, notas_clinicas, citas, examenes, etc.)

**Validaciones a nivel BD**:
- `pacientes.nombre_completo` NOT NULL
- `pacientes.rut` NOT NULL, UNIQUE
- `pacientes.fecha_nacimiento` NOT NULL
- `pacientes.sexo` NOT NULL, CHECK (sexo IN ('M', 'F'))
- `pacientes.objetivo` NOT NULL
- `consultas.fecha` NOT NULL
- `mediciones_antropometria.peso_kg` NOT NULL
- `mediciones_antropometria.talla_cm` NOT NULL

**Índices críticos**:
- `pacientes.profesional_id`
- `pacientes.rut` (búsqueda frecuente)
- `consultas.paciente_id`
- `consultas.fecha`
- `mediciones_antropometria.paciente_id`
- `mediciones_antropometria.fecha`
