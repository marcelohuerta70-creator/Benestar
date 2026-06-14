# MAPEO PRECISO DE CAMPOS POR TABLA

**Fecha**: 2026-06-14

Este documento verifica que TODOS los campos esperados por el código TypeScript (lib/types.ts) existan en Supabase con los nombres correctos.

---

## 1. TABLA: PACIENTES

### ✅ CAMPOS QUE YA EXISTEN EN SQL
```
- id
- nombre_completo
- rut
- fecha_nacimiento
- sexo
- email
- telefono
- objetivo
- estado
- portal_activo
- created_at
```

### ❌ CAMPOS FALTANTES (Requeridos por types.ts)

| Campo | Tipo | Origen | Notas |
|-------|------|--------|-------|
| `genero` | VARCHAR | Paciente.genero | 'femenino', 'masculino', 'no_binario', 'otro', 'no_responde' |
| `direccion` | TEXT | Paciente.direccion | Domicilio general |
| `comuna` | VARCHAR | Paciente.comuna | Localidad |
| `ciudad` | VARCHAR | Paciente.ciudad | Ciudad |
| `contacto_emergencia` | VARCHAR | Paciente.contacto_emergencia | Nombre contacto |
| `telefono_emergencia` | VARCHAR | Paciente.telefono_emergencia | Teléfono contacto |
| `prevision` | VARCHAR | Paciente.prevision | 'fonasa', 'isapre', 'particular', 'otro' |
| `prevision_otro` | VARCHAR | Paciente.prevision_otro | Si prevision='otro' |
| `cesfam` | VARCHAR | Paciente.cesfam | Centro de salud |
| `medico_tratante` | VARCHAR | Paciente.medico_tratante | Médico general |
| `notas_generales` | TEXT | Paciente.notas_generales | Notas iniciales |
| `tipo_paciente` | VARCHAR | TAB "Tipo Paciente" | 'adulto', 'embarazada', 'deportista', etc |
| `tipo_paciente_datos` | JSONB | TAB "Tipo Paciente" | Campos dinámicos por tipo |
| `enfermedades` | TEXT | TAB "Ficha Clínica" | Enfermedades/diagnósticos |
| `alergias_farmacologicas` | TEXT | TAB "Ficha Clínica" | Alergias a medicamentos |
| `antecedentes_familiares` | TEXT | TAB "Ficha Clínica" | Historial familiar |
| `cirugias_previas` | TEXT | TAB "Ficha Clínica" | Cirugías previas |
| `observaciones_clinicas` | TEXT | TAB "Ficha Clínica" | Observaciones del profesional |
| `notas_clinica` | TEXT | TAB "Ficha Clínica" | Notas clínicas libres |
| `habito_actividad_fisica` | TEXT | TAB "Hábitos" | Actividad física general |
| `habito_consumo_agua` | TEXT | TAB "Hábitos" | Consumo de agua general |
| `habito_sueno` | TEXT | TAB "Hábitos" | Sueño general |
| `habito_alcohol` | TEXT | TAB "Hábitos" | Alcohol consumo general |
| `habito_tabaco` | TEXT | TAB "Hábitos" | Tabaco consumo general |
| `habito_drogas` | TEXT | TAB "Hábitos" | Otras sustancias |
| `habito_deposiciones` | TEXT | TAB "Hábitos" | Deposiciones |
| `notas_habitos` | TEXT | TAB "Hábitos" | Notas libres hábitos |
| `tipo_alimentacion` | VARCHAR | TAB "Alimentación" | 'omnivoro', 'vegetariano', 'vegano', 'pescetariano', 'otro' |
| `tipo_alimentacion_otro` | VARCHAR | TAB "Alimentación" | Si tipo_alimentacion='otro' |
| `preferencias_alimentarias` | TEXT | TAB "Alimentación" | Preferencias |
| `alergias_alimentarias` | TEXT | TAB "Alimentación" | Alergias/intolerancias |
| `alimentos_no_consume` | TEXT | TAB "Alimentación" | Alimentos prohibidos |
| `suplementos_habituales` | TEXT | TAB "Alimentación" | Suplementos actuales |
| `notas_alimentacion` | TEXT | TAB "Alimentación" | Notas de alimentación |
| `contraseña_hash` | VARCHAR | Portal Paciente | Hashed password para paciente |

### TOTAL: 12 campos actuales + 35 campos faltantes = 47 campos en Pacientes

---

## 2. TABLA: CONSULTAS

### ✅ CAMPOS QUE YA EXISTEN EN SQL
```
- id
- paciente_id
- profesional_id
- fecha
- hora
- peso_kg ❌ (DEBERÍA estar en mediciones_antropometria)
- nota_para_paciente
- created_at
- updated_at
```

### ❌ CAMPOS FALTANTES (Requeridos por types.ts)

| Campo | Tipo | Origen | Notas |
|-------|------|--------|-------|
| `tipo_consulta` | VARCHAR | "Información General" | 'primera_consulta', 'seguimiento', 'alta_nutricional' |
| `proxima_cita` | DATE | "Información General" | Fecha próxima consulta |
| `adherencia` | VARCHAR | "Evolución" | 'muy_buena', 'buena', 'regular', 'mala' |
| `cambios_observados` | TEXT | "Evolución" | Cambios notados |
| `dificultades_reportadas` | TEXT | "Evolución" | Dificultades del paciente |
| `observaciones_clinicas` | TEXT | "Evolución" | Observaciones clínicas |
| `ctrl_actividad_fisica` | TEXT | "Control de Hábitos" | Control actividad física en esta consulta |
| `ctrl_consumo_agua` | TEXT | "Control de Hábitos" | Control consumo agua |
| `ctrl_sueno` | TEXT | "Control de Hábitos" | Control sueño |
| `ctrl_deposiciones` | TEXT | "Control de Hábitos" | Control deposiciones |
| `ctrl_alcohol` | TEXT | "Control de Hábitos" | Control alcohol |
| `ctrl_tabaco` | TEXT | "Control de Hábitos" | Control tabaco |
| `diagnostico_nutricional` | TEXT | "Diagnóstico" | Diagnóstico |
| `indicaciones` | TEXT | "Diagnóstico" | Indicaciones |
| `objetivos_proximo_control` | TEXT | "Diagnóstico" | Objetivos |
| `adjuntos` | TEXT[] | Archivos adjuntos | Nombres de archivos |
| `archivos_urls` | TEXT[] | Archivos adjuntos | URLs de Storage |

### REMOVER:
- `peso_kg` (debe ir en mediciones_antropometria)

### CAMPOS LEGACY (para compatibilidad hacia atrás, opcionales):
- `motivo` (deprecated, usar `diagnostico_nutricional`)
- `diagnostico` (deprecated)
- `observaciones` (deprecated)

### TOTAL: 9 campos actuales - 1 (peso_kg) + 17 faltantes = 25 campos en Consultas

---

## 3. TABLA: MEDICIONES_ANTROPOMETRIA

### ✅ CAMPOS QUE YA EXISTEN EN SQL
```
- id
- paciente_id
- profesional_id ❌ (NO NECESARIO si vamos de paciente_id → paciente.profesional_id)
- fecha
- peso_kg ✅
- talla_cm ✅
- imc ✅
- perimetro_cintura_cm ✅
- perimetro_cadera_cm ✅
- perimetro_brazo_cm ⚠️ (SIN DIFERENCIAR relajado/contraído)
- perimetro_torax_cm ✅
- perimetro_abdomen_cm ✅
- perimetro_muslo_cm ✅
- perimetro_pantorrilla_cm ✅
- created_at
- updated_at
```

### ❌ CAMPOS FALTANTES / A CORREGIR

| Campo | Tipo | Acción | Notas |
|-------|------|--------|-------|
| `consulta_id` | UUID FK | AGREGAR | Vincular a consulta específica |
| `icc` | DECIMAL | AGREGAR | Índice cintura/cadera (calculado) |
| `clasificacion_nutricional` | VARCHAR | AGREGAR | Clasificación IMC |
| `per_brazo_relajado` | DECIMAL | CORREGIR | Separar de perimetro_brazo_cm |
| `per_brazo_contraido` | DECIMAL | CORREGIR | Separar de perimetro_brazo_cm |
| `per_torax` | DECIMAL | RENOMBRAR | perimetro_torax_cm → per_torax (por consistencia) |
| `per_abdomen` | DECIMAL | RENOMBRAR | perimetro_abdomen_cm → per_abdomen |
| `per_muslo` | DECIMAL | RENOMBRAR | perimetro_muslo_cm → per_muslo |
| `per_pantorrilla` | DECIMAL | RENOMBRAR | perimetro_pantorrilla_cm → per_pantorrilla |
| `pliegue_tricipital` | DECIMAL | AGREGAR | Pliegue mm |
| `pliegue_bicipital` | DECIMAL | AGREGAR | Pliegue mm |
| `pliegue_subescapular` | DECIMAL | AGREGAR | Pliegue mm |
| `pliegue_suprailiaco` | DECIMAL | AGREGAR | Pliegue mm |
| `pliegue_abdominal` | DECIMAL | AGREGAR | Pliegue mm |
| `pliegue_muslo` | DECIMAL | AGREGAR | Pliegue mm |
| `pliegue_pantorrilla` | DECIMAL | AGREGAR | Pliegue mm |
| `envergadura` | DECIMAL | AGREGAR | Envergadura brazos cm |
| `altura_sentado` | DECIMAL | AGREGAR | Altura sentado cm |

### TOTAL: 15 campos actuales + 5 a corregir/renombrar + 9 nuevos = 29 campos en Antropometria

---

## 4. TABLA: MEDICIONES_BIOIMPEDANCIA

### ✅ CAMPOS QUE YA EXISTEN EN SQL
```
- id
- paciente_id
- profesional_id ❌ (NO NECESARIO)
- fecha
- masa_grasa_kg ✅
- masa_grasa_pct ✅
- masa_magra_kg ✅
- agua_corporal_pct ✅
- agua_corporal_kg ❌ (debería ser agua_corporal_lt)
- masa_osea_kg ✅
- metabolismo_basal ⚠️ (debería ser metabolismo_basal_kcal)
- created_at
- updated_at
```

### ❌ CAMPOS FALTANTES / A CORREGIR

| Campo | Tipo | Acción | Notas |
|-------|------|--------|-------|
| `consulta_id` | UUID FK | AGREGAR | Vincular a consulta |
| `agua_corporal_lt` | DECIMAL | CORREGIR | agua_corporal_kg → agua_corporal_lt |
| `metabolismo_basal_kcal` | INT | RENOMBRAR | metabolismo_basal → metabolismo_basal_kcal |
| `edad_metabolica` | INT | AGREGAR | Edad metabólica |
| `masa_libre_grasa` | DECIMAL | AGREGAR | MLG kg |
| `grasa_visceral` | DECIMAL | AGREGAR | Grasa visceral % |
| `proteina_corporal` | DECIMAL | AGREGAR | Proteína kg |
| `seg_brazo_izq` | DECIMAL | AGREGAR | Segmental brazo izquierdo |
| `seg_brazo_der` | DECIMAL | AGREGAR | Segmental brazo derecho |
| `seg_tronco` | DECIMAL | AGREGAR | Segmental tronco |
| `seg_pierna_izq` | DECIMAL | AGREGAR | Segmental pierna izquierda |
| `seg_pierna_der` | DECIMAL | AGREGAR | Segmental pierna derecha |

### TOTAL: 12 campos actuales + 3 correcciones + 9 nuevos = 24 campos en Bioimpedancia

---

## 5. TABLA: EXÁMENES

### ✅ CAMPOS QUE YA EXISTEN EN SQL
```
- id
- paciente_id
- profesional_id
- fecha
- tipo ✅
- descripcion ⚠️ (NO está en types.ts)
- resultado ✅
- archivos ✅
- archivos_urls ✅
- created_at
- updated_at
```

### ❌ CAMPOS FALTANTES / A CORREGIR

| Campo | Tipo | Acción | Notas |
|-------|------|--------|-------|
| `notas` | TEXT | AGREGAR | Notas sobre examen |
| `archivo_nombre` | VARCHAR | CORREGIR | archivos → archivo_nombre (singular) |
| `archivo_tipo` | VARCHAR | AGREGAR | mime-type del archivo |
| `archivo_url` | VARCHAR | CORREGIR | archivos_urls → archivo_url (singular) |
| `archivo_size_kb` | INT | AGREGAR | Tamaño en KB |

### REMOVER:
- `descripcion` (no lo usa types.ts, usar resultado)

### TOTAL: 10 campos actuales + 2 correcciones + 3 nuevos = 15 campos en Exámenes

---

## 6. TABLA: PLANES (Minutas)

### ✅ CAMPOS QUE YA EXISTEN EN SQL
```
- id
- paciente_id
- profesional_id
- especialidad ✅
- fecha_inicio ✅
- fecha_fin ✅
- activo ✅
- estructura ✅ (JSONB)
- created_at
- updated_at
```

### ❌ CAMPOS FALTANTES (Requeridos por types.ts)

| Campo | Tipo | Acción | Notas |
|-------|------|--------|-------|
| `titulo` | VARCHAR | AGREGAR | Título del plan |
| `contenido` | TEXT | AGREGAR | Contenido texto libre (legacy) |

### TOTAL: 10 campos actuales + 2 nuevos = 12 campos en Planes

---

## 7. TABLA: SUPLEMENTOS

### ✅ CAMPOS QUE YA EXISTEN EN SQL
```
- id
- paciente_id
- profesional_id
- nombre ✅
- dosis ✅
- frecuencia ✅
- motivo ⚠️ (NO está en types.ts, pero puede ser útil)
- created_at
- updated_at
```

### ❌ CAMPOS FALTANTES (Requeridos por types.ts)

| Campo | Tipo | Acción | Notas |
|-------|------|--------|-------|
| `instrucciones` | TEXT | AGREGAR | Instrucciones de uso |
| `activo` | BOOLEAN | AGREGAR | Si está activo |
| `fecha_inicio` | DATE | AGREGAR | Cuando comenzó |

### TOTAL: 8 campos actuales + 3 nuevos = 11 campos en Suplementos

---

## 8. TABLA: NOTAS_CLINICAS

### ✅ CAMPOS QUE YA EXISTEN EN SQL
```
- id
- paciente_id
- profesional_id
- tipo ✅ ('clinica' o 'paciente')
- titulo ✅
- contenido ✅
- archivos ✅ (TEXT[])
- archivos_urls ✅ (TEXT[])
- created_at
- updated_at
```

### ❌ CAMPOS FALTANTES (Requeridos por types.ts)

| Campo | Tipo | Acción | Notas |
|-------|------|--------|-------|
| `archivos_size_kb` | INT[] | AGREGAR | Tamaños de archivos |

### TOTAL: 10 campos actuales + 1 nuevo = 11 campos en Notas Clínicas

---

## 9. TABLA: CITAS

### ✅ CAMPOS QUE YA EXISTEN EN SQL
```
- id
- paciente_id
- profesional_id
- fecha ✅
- hora ✅
- estado ✅
- motivo ✅
- notas ⚠️ (debería ser observaciones)
- created_at
- updated_at
```

### ❌ CAMPOS FALTANTES / A CORREGIR (Requeridos por types.ts)

| Campo | Tipo | Acción | Notas |
|-------|------|--------|-------|
| `paciente_nombre` | VARCHAR | AGREGAR | Desnormalizado para búsqueda |
| `duracion_min` | INT | AGREGAR | Duración en minutos |
| `observaciones` | TEXT | CORREGIR | notas → observaciones |

### TOTAL: 9 campos actuales + 3 nuevos = 12 campos en Citas

---

## 10. TABLA: PERFILES_PROFESIONALES

### ✅ CAMPOS QUE YA EXISTEN EN SQL
```
- id
- profesional_id (UNIQUE) ✅
- nombre ✅
- profesion ✅
- numero_registro ✅
- telefono ✅
- correo ✅
- direccion ✅
- color_principal ✅
- color_texto_header ✅
- plan_suscripcion ✅
- created_at
- updated_at
```

### ✅ TODOS LOS CAMPOS PRESENTES

---

## 11. TABLA: MEDICAMENTOS

### ✅ TABLA CREADA
```
- id
- paciente_id
- nombre
- dosis
- frecuencia
- created_at
```

### NOTAS
- Esta tabla ya existe y tiene todos los campos necesarios

---

## RESUMEN POR TABLA

| Tabla | Campos Actuales | Faltantes/Corregir | Total Final |
|-------|-----------------|-------------------|------------|
| `pacientes` | 12 | 35 | 47 |
| `consultas` | 9 | 17 | 25 |
| `mediciones_antropometria` | 15 | 14 | 29 |
| `mediciones_bioimpedancia` | 12 | 12 | 24 |
| `examenes` | 10 | 5 | 15 |
| `planes` | 10 | 2 | 12 |
| `suplementos` | 8 | 3 | 11 |
| `notas_clinicas` | 10 | 1 | 11 |
| `citas` | 9 | 3 | 12 |
| `medicamentos` | 6 | 0 | 6 |
| `perfiles_profesionales` | 12 | 0 | 12 |

**TOTALES**: 113 campos actuales + 92 cambios = **205 campos reales**

---

## PRIORIDAD DE CORRECCIONES

### 🔴 CRÍTICO (Afecta datos directamente):
1. Agregar todos los campos a `pacientes` (es el hub)
2. Agregar todos los campos a `consultas` (registra las visitas)
3. Corregir/agregar campos en `mediciones_antropometria` y `mediciones_bioimpedancia`
4. Agregar `consulta_id` a mediciones (relación con consulta)

### 🟡 IMPORTANTE (Afecta features):
5. Completar campos en `examenes`, `planes`, `suplementos`, `citas`
6. Renombrar campos inconsistentes (notas → observaciones)

### 🟢 MENOR (Mejora pero no rompe):
7. Agregar índices en campos de búsqueda frecuente

---

## VERIFICACIÓN

Después de aplicar cambios, verificar:
- [ ] TypeScript compila sin errores
- [ ] Tipos en `lib/types.ts` reflejan exactamente Supabase
- [ ] No hay campos huérfanos (en TypeScript pero no en SQL)
- [ ] No hay campos en SQL no usados en TypeScript
- [ ] Nombres de campos son consistentes (ej: no mix de `perimetro_` y `per_`)
