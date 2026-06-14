# VALIDACIÓN DE CAMPOS CRÍTICOS

Extrae esta información del código y valida que los nombres sean correctos.

---

## TABLA 1: PACIENTES (Datos que pide cada página)

### De "Nuevo Paciente" (nuevo-paciente-dialog.tsx)
```javascript
nombre_completo        // Input libre
rut                    // Input libre
fecha_nacimiento       // Input date
sexo                   // Select: 'M' o 'F'
email                  // Input libre
telefono               // Input libre
objetivo               // Select dropdown
notas_generales        // Textarea
contraseña_hash        // Password → bcrypt
```

### De "Ficha General" (ficha-general.tsx)
```javascript
// Datos personales
nombre_completo, rut, fecha_nacimiento, sexo
genero                 // Select: femenino, masculino, no_binario, otro, no_responde
objetivo

// Contacto
telefono
email
contacto_emergencia    // Nombre del contacto
telefono_emergencia

// Domicilio
direccion
comuna
ciudad

// Sistema de salud
prevision              // Select: fonasa, isapre, particular, otro
prevision_otro         // Si prevision='otro'
cesfam
medico_tratante

// Portal
portal_activo          // BOOLEAN
contraseña_hash        // Editable

// Notas
notas_generales
```

### De "Ficha Clínica" (ficha-clinica.tsx)
```javascript
enfermedades
alergias_farmacologicas
antecedentes_familiares
cirugias_previas
observaciones_clinicas
notas_clinica          // ⚠️ IMPORTANTE: NO es "notas_clinicas" (sin la 's')
```

### De "Ficha Hábitos" (ficha-habitos.tsx)
```javascript
habito_actividad_fisica
habito_consumo_agua
habito_sueno
habito_alcohol
habito_tabaco
habito_drogas
habito_deposiciones
notas_habitos
```

### De "Ficha Alimentación" (ficha-alimentacion.tsx)
```javascript
tipo_alimentacion      // Select: omnivoro, vegetariano, vegano, pescetariano, otro
tipo_alimentacion_otro // Si tipo_alimentacion='otro'
preferencias_alimentarias
alergias_alimentarias
alimentos_no_consume
suplementos_habituales
notas_alimentacion
```

### De "Ficha Tipo Paciente" (ficha-tipo-paciente.tsx)
```javascript
tipo_paciente          // Select: 11 valores
tipo_paciente_datos    // JSONB con campos dinámicos
```

**TOTAL EN PACIENTES: 45 campos**

---

## TABLA 2: CONSULTAS (Datos de cada consulta en "Ficha Controles")

Del código de `ficha-controles.tsx`, líneas 49-69:

```javascript
const FORM_EMPTY = {
  fecha: '',
  tipo_consulta: 'seguimiento',      // ✅ Nombre correcto
  proxima_cita: '',
  proxima_cita_hora: '09:00',        // ⚠️ Este campo NO va a tabla, es local
  adherencia: '',
  cambios_observados: '',
  dificultades_reportadas: '',
  observaciones_clinicas: '',
  ctrl_actividad_fisica: '',         // ✅ Nombres ctrl_* correctos
  ctrl_consumo_agua: '',
  ctrl_sueno: '',
  ctrl_deposiciones: '',
  ctrl_alcohol: '',
  ctrl_tabaco: '',
  diagnostico_nutricional: '',       // ✅ Nombres correctos
  indicaciones: '',
  objetivos_proximo_control: '',
  nota_para_paciente: '',
  adjuntos: [],                      // TEXT[] array
}
```

En el código de guardado (líneas 183-198):
```javascript
const consultaData = {
  paciente_id: pacienteId,
  profesional_id: user.id,
  fecha: form.fecha,
  tipo_consulta: form.tipo_consulta || null,
  adherencia: form.adherencia || null,
  cambios_observados: form.cambios_observados || null,
  dificultades_reportadas: form.dificultades_reportadas || null,
  observaciones_clinicas: form.observaciones_clinicas || null,
  diagnostico_nutricional: form.diagnostico_nutricional || null,
  indicaciones: form.indicaciones || null,
  objetivos_proximo_control: form.objetivos_proximo_control || null,
  nota_para_paciente: form.nota_para_paciente || null,
  adjuntos: form.adjuntos.length > 0 ? form.adjuntos.map(a => a.nombre) : null,
  archivos_urls: form.adjuntos.length > 0 ? form.adjuntos.map(a => a.url) : null,
}
```

**TOTAL EN CONSULTAS: 20 campos (18 de datos + paciente_id + profesional_id)**

---

## TABLA 3: MEDICIONES_ANTROPOMETRIA (Del código)

Del código de `ficha-controles.tsx`, líneas 71-77:

```javascript
const ANTROP_EMPTY = {
  peso_kg: '',
  talla_cm: '',
  perimetro_cintura_cm: '',
  perimetro_cadera_cm: '',
  per_brazo_relajado: '',            // ⚠️ SIN _cm en form, SE AGREGA EN BD
  per_brazo_contraido: '',           // ⚠️ SIN _cm en form, SE AGREGA EN BD
  per_torax: '',                     // ⚠️ En BD es perimetro_torax_cm
  per_abdomen: '',                   // ⚠️ En BD es perimetro_abdomen_cm
  per_muslo: '',                     // ⚠️ En BD es perimetro_muslo_cm
  per_pantorrilla: '',               // ⚠️ En BD es perimetro_pantorrilla_cm
  pliegue_tricipital: '',
  pliegue_bicipital: '',
  pliegue_subescapular: '',
  pliegue_suprailiaco: '',
  pliegue_abdominal: '',
  pliegue_muslo: '',
  pliegue_pantorrilla: '',
  envergadura: '',
  altura_sentado: '',
}
```

En el código de guardado (líneas 241-272):
```javascript
const antropData: any = {
  paciente_id: pacienteId,
  fecha: form.fecha,
  peso_kg: peso,
  talla_cm: talla,
  imc,                                    // Calculado

  perimetro_cintura_cm: n(...),
  perimetro_cadera_cm: n(...),
  per_brazo_relajado_cm: n(...),         // ✅ Agregar _cm
  per_brazo_contraido_cm: n(...),        // ✅ Agregar _cm
  perimetro_torax_cm: n(...),            // ✅ perimetro_torax_cm
  perimetro_abdomen_cm: n(...),          // ✅ perimetro_abdomen_cm
  perimetro_muslo_cm: n(...),            // ✅ perimetro_muslo_cm
  perimetro_pantorrilla_cm: n(...),      // ✅ perimetro_pantorrilla_cm
  pliegue_tricipital_mm: n(...),         // ✅ Sufijo _mm
  pliegue_bicipital_mm: n(...),
  pliegue_subescapular_mm: n(...),
  pliegue_suprailiaco_mm: n(...),
  pliegue_abdominal_mm: n(...),
  pliegue_muslo_mm: n(...),
  pliegue_pantorrilla_mm: n(...),
  envergadura_cm: n(...),                // ✅ Sufijo _cm
  altura_sentado_cm: n(...),             // ✅ Sufijo _cm
}
```

**TOTAL EN MEDICIONES_ANTROPOMETRIA: 28 campos**

---

## TABLA 4: MEDICIONES_BIOIMPEDANCIA

Del código de `ficha-controles.tsx`, líneas 79-84:

```javascript
const BIO_EMPTY = {
  masa_grasa_kg: '',
  masa_grasa_pct: '',
  masa_magra_kg: '',
  masa_libre_grasa: '',
  agua_corporal_lt: '',               // ⚠️ IMPORTANTE: es _lt, NO _kg
  agua_corporal_pct: '',
  grasa_visceral: '',
  proteina_corporal: '',
  masa_osea: '',
  metabolismo_basal_kcal: '',         // ⚠️ IMPORTANTE: sufijo _kcal
  edad_metabolica: '',
  seg_brazo_izq: '',
  seg_brazo_der: '',
  seg_tronco: '',
  seg_pierna_izq: '',
  seg_pierna_der: '',
}
```

En el código de guardado (líneas 293-300):
```javascript
const bioData: any = {
  paciente_id: pacienteId,
  fecha: form.fecha,

  masa_grasa_kg: n(formBio.masa_grasa_kg),
  masa_grasa_pct: n(formBio.masa_grasa_pct),
  masa_magra_kg: n(formBio.masa_magra_kg),
  masa_libre_grasa_kg: n(formBio.masa_libre_grasa),    // ✅ _kg
  agua_corporal_lt: n(formBio.agua_corporal_lt),       // ✅ _lt
  agua_corporal_pct: n(formBio.agua_corporal_pct),
  grasa_visceral: n(formBio.grasa_visceral),
  proteina_corporal_kg: n(formBio.proteina_corporal),  // ✅ _kg
  masa_osea_kg: n(formBio.masa_osea),                  // ✅ _kg
  metabolismo_basal_kcal: n(...),                      // ✅ _kcal
  edad_metabolica: n(formBio.edad_metabolica),
  seg_brazo_izq: n(...),
  seg_brazo_der: n(...),
  seg_tronco: n(...),
  seg_pierna_izq: n(...),
  seg_pierna_der: n(...),
}
```

**TOTAL EN MEDICIONES_BIOIMPEDANCIA: 17 campos**

---

## ✅ VALIDACIÓN CHECKLIST

Revisa estos puntos CRÍTICOS:

### Nombres exactos (sin typos):
- [ ] `notas_clinica` (NO `notas_clinicas`)
- [ ] `agua_corporal_lt` (NO `agua_corporal_kg`)
- [ ] `metabolismo_basal_kcal` (NO `metabolismo_basal`)
- [ ] `per_brazo_relajado_cm` (separado de `per_brazo_contraido_cm`)
- [ ] `perimetro_torax_cm`, `perimetro_abdomen_cm`, etc. (NO mezclar con `per_`)

### Sufijos correctos:
- [ ] Centímetros: `_cm`
- [ ] Kilogramos: `_kg`
- [ ] Litros: `_lt` (SOLO para agua_corporal)
- [ ] Milímetros: `_mm` (SOLO para pliegues)
- [ ] Kilocalorías: `_kcal` (SOLO para metabolismo_basal)
- [ ] Porcentaje: `_pct`

### Campos dinámicos (JSONB):
- [ ] `tipo_paciente_datos` es JSONB con estructura variable por tipo

### Enums correctos:
- [ ] Sexo: 'M' o 'F' ✅
- [ ] Tipo consulta: 'primera_consulta', 'seguimiento', 'alta_nutricional' ✅
- [ ] Adherencia: 'muy_buena', 'buena', 'regular', 'mala' ✅
- [ ] Tipo paciente: 11 valores (adulto, adulto_mayor, embarazada, ...) ✅

### Reutilización correcta:
- [ ] Datos como RUT, nombre, dirección están en tabla `pacientes` (no duplicados) ✅
- [ ] Medicamentos en tabla separada `medicamentos` ✅
- [ ] Mediciones vinculadas a consulta con `consulta_id` ✅

---

## 🚨 PUNTOS CRÍTICOS ENCONTRADOS

1. **`agua_corporal_lt`**: El código usa form como `agua_corporal_lt`, pero antes tenía `agua_corporal_kg`. En Supabase DEBE ser `agua_corporal_lt`.

2. **`metabolismo_basal_kcal`**: En SQL actual era solo `metabolismo_basal`. DEBE ser `metabolismo_basal_kcal`.

3. **`notas_clinica`**: El código USA `notas_clinica` (singular), pero la tabla se llama `notas_clinicas` (plural). DEBE ser `notas_clinica`.

4. **Perímetros avanzados**: El código del formulario dice `per_`, pero en la BD se guardan como `perimetro_*_cm` o nombres específicos. Validar que el mapeo sea correcto.

5. **FK faltante**: `mediciones_antropometria` y `mediciones_bioimpedancia` DEBEN tener `consulta_id` (no está en SQL actual).

---

## 📋 Resumen para aprobar

**¿Están estos nombres correctos en el código?**

```
PACIENTES:
✅ nombre_completo, rut, fecha_nacimiento, sexo, email, telefono, objetivo
✅ direccion, comuna, ciudad
✅ contacto_emergencia, telefono_emergencia
✅ prevision, prevision_otro, cesfam, medico_tratante
✅ enfermedades, alergias_farmacologicas, antecedentes_familiares, cirugias_previas
✅ observaciones_clinicas, notas_clinica (singular)
✅ habito_actividad_fisica, habito_consumo_agua, habito_sueno, habito_alcohol, habito_tabaco, habito_drogas, habito_deposiciones, notas_habitos
✅ tipo_alimentacion, tipo_alimentacion_otro, preferencias_alimentarias, alergias_alimentarias, alimentos_no_consume, suplementos_habituales, notas_alimentacion
✅ tipo_paciente, tipo_paciente_datos
✅ portal_activo, contraseña_hash
✅ notas_generales, genero

CONSULTAS:
✅ fecha, tipo_consulta, proxima_cita, proxima_cita_hora
✅ adherencia, cambios_observados, dificultades_reportadas, observaciones_clinicas
✅ ctrl_actividad_fisica, ctrl_consumo_agua, ctrl_sueno, ctrl_deposiciones, ctrl_alcohol, ctrl_tabaco
✅ diagnostico_nutricional, indicaciones, objetivos_proximo_control
✅ nota_para_paciente
✅ adjuntos, archivos_urls

ANTROPOMETRIA:
✅ peso_kg, talla_cm, perimetro_cintura_cm, perimetro_cadera_cm
✅ per_brazo_relajado_cm, per_brazo_contraido_cm
✅ perimetro_torax_cm, perimetro_abdomen_cm, perimetro_muslo_cm, perimetro_pantorrilla_cm
✅ pliegue_tricipital_mm, pliegue_bicipital_mm, pliegue_subescapular_mm, pliegue_suprailiaco_mm, pliegue_abdominal_mm, pliegue_muslo_mm, pliegue_pantorrilla_mm
✅ envergadura_cm, altura_sentado_cm, imc, icc

BIOIMPEDANCIA:
✅ masa_grasa_kg, masa_grasa_pct, masa_magra_kg
✅ agua_corporal_lt (LITROS, no kg)
✅ agua_corporal_pct
✅ masa_libre_grasa_kg, grasa_visceral, proteina_corporal_kg, masa_osea_kg
✅ metabolismo_basal_kcal (con _kcal)
✅ edad_metabolica
✅ seg_brazo_izq, seg_brazo_der, seg_tronco, seg_pierna_izq, seg_pierna_der
```

---

**¿Todo correcto? Aprobado para generar el SQL final.**
