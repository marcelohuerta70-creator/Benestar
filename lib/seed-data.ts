import type { Paciente, Consulta, Antropometria, Bioimpedancia, Examen, Minuta, Suplemento, PacienteProfesional } from './types'
import {
  pacientesStorage, consultasStorage, antropometriaStorage,
  bioimpedanciaStorage, examenesStorage, minutasStorage, suplementosStorage, pacienteProfesionalStorage, markSeeded
} from './storage'
import bcryptjs from 'bcryptjs'

// Pre-hashed passwords for demo (salt rounds: 10, password: 'benestar123')
const DEMO_PASSWORD_HASH = '$2b$10$Pxd7LpT/tyxSW97fTSaZQOq2LuOeGy0M5zRY/7VfrfB4NEGwQAge6'

export function seedDemoData() {
  const pacientes: Paciente[] = [
    {
      id: 'p1',
      nombre_completo: 'María González Riquelme',
      rut: '12.345.678-9',
      fecha_nacimiento: '1988-03-15',
      sexo: 'F',
      email: 'maria.gonzalez@gmail.com',
      telefono: '+56 9 8765 4321',
      objetivo: 'Pérdida de peso',
      notas_generales: 'Paciente motivada. Trabaja en oficina, actividad física baja. Duerme bien. Sin antecedentes mórbidos relevantes.',
      estado: 'activo',
      portal_activo: true,
      created_at: '2026-01-10T10:00:00Z',
      contraseña_hash: DEMO_PASSWORD_HASH,
    },
    {
      id: 'p2',
      nombre_completo: 'Carlos Muñoz Soto',
      rut: '15.234.567-K',
      fecha_nacimiento: '1995-07-22',
      sexo: 'M',
      email: 'carlos.munoz@gmail.com',
      telefono: '+56 9 7654 3210',
      objetivo: 'Ganancia muscular',
      notas_generales: 'Entrena 5 días a la semana. Trabaja como ingeniero. Alto consumo de proteínas previamente sin guía. Sin patologías.',
      estado: 'activo',
      portal_activo: true,
      created_at: '2026-01-15T10:00:00Z',
      contraseña_hash: DEMO_PASSWORD_HASH,
    },
    {
      id: 'p3',
      nombre_completo: 'Sofía Herrera Valdés',
      rut: '18.765.432-1',
      fecha_nacimiento: '1975-11-08',
      sexo: 'F',
      email: 'sofia.herrera@gmail.com',
      telefono: '+56 9 6543 2109',
      objetivo: 'Control de colesterol y glucosa',
      notas_generales: 'Hipertensión controlada con enalapril. Colesterol LDL elevado 160 mg/dL. Pre-diabética. Sedentaria. Se reforzó actividad caminata.',
      estado: 'activo',
      portal_activo: true,
      created_at: '2026-02-01T10:00:00Z',
      contraseña_hash: DEMO_PASSWORD_HASH,
    },
    {
      id: 'p4',
      nombre_completo: 'Andrés Morales Pérez',
      rut: '20.123.456-5',
      fecha_nacimiento: '2001-04-30',
      sexo: 'M',
      email: 'andres.morales@gmail.com',
      telefono: '+56 9 5432 1098',
      objetivo: 'Nutrición deportiva — Atletismo',
      notas_generales: 'Atleta amateur, corre medios maratones. Déficit de hierro detectado. Necesita plan específico para carga y competencia.',
      estado: 'activo',
      portal_activo: true,
      created_at: '2026-02-10T10:00:00Z',
      contraseña_hash: DEMO_PASSWORD_HASH,
    },
  ]

  const consultas: Consulta[] = [
    // María
    { id: 'c1', paciente_id: 'p1', fecha: '2026-01-10', motivo: 'Primera consulta', diagnostico: 'Sobrepeso moderado. IMC 28.4. Alimentación alta en ultraprocesados y azúcares simples.', observaciones: 'Se estableció plan de alimentación deficit 500 kcal. Reforzar fibra y proteína.', nota_para_paciente: 'Recuerda tomar agua antes de cada comida. Tu próximo objetivo: bajar 2 kg al mes.', proxima_cita: '2026-02-10', created_at: '2026-01-10T10:00:00Z' },
    { id: 'c2', paciente_id: 'p1', fecha: '2026-02-10', motivo: 'Control mensual', diagnostico: 'Progreso favorable. Bajó 1.8 kg. Adherencia 80%.', observaciones: 'Ajustamos colaciones. Agregar proteína en desayuno. Mantener minuta.', nota_para_paciente: '¡Excelente progreso! Bajaste casi 2 kg. Sigue con el plan de desayuno proteico.', proxima_cita: '2026-03-10', created_at: '2026-02-10T10:00:00Z' },
    { id: 'c3', paciente_id: 'p1', fecha: '2026-03-10', motivo: 'Control mensual', diagnostico: 'Plateau en semana 3. Ajuste calórico necesario. Adherencia 75%.', observaciones: 'Reducimos 150 kcal más. Aumentar proteína a 1.6g/kg. Incorporar ayuno 12/12.', nota_para_paciente: 'El plateau es normal, tu cuerpo se está adaptando. Sigue el plan ajustado.', proxima_cita: '2026-04-10', created_at: '2026-03-10T10:00:00Z' },
    // Carlos
    { id: 'c4', paciente_id: 'p2', fecha: '2026-01-15', motivo: 'Primera consulta', diagnostico: 'Masa magra adecuada. Déficit calórico previo no intencional. Proteína insuficiente en timing post-entreno.', observaciones: 'Plan hipercalórico 300 kcal sobre mantenimiento. Proteína 2.0g/kg distribuida.', nota_para_paciente: 'Tu meta: +0.5 kg de masa magra por mes. Consume proteína dentro de los 30 min post-entreno.', proxima_cita: '2026-02-15', created_at: '2026-01-15T10:00:00Z' },
    { id: 'c5', paciente_id: 'p2', fecha: '2026-02-15', motivo: 'Control mensual', diagnostico: 'Ganó 0.9 kg de masa magra. Grasa estable. Responde bien al plan.', observaciones: 'Excelente adherencia. Mantener plan actual. Agregar creatina 5g/día.', nota_para_paciente: '¡Muy buen resultado! Casi 1 kg de músculo en un mes. Incorpora la creatina según indicación.', proxima_cita: '2026-03-15', created_at: '2026-02-15T10:00:00Z' },
    // Sofía
    { id: 'c6', paciente_id: 'p3', fecha: '2026-02-01', motivo: 'Primera consulta', diagnostico: 'Dislipidemia + pre-diabetes. Dieta alta en grasas saturadas. Nula actividad física.', observaciones: 'Dieta mediterránea adaptada. Reducir grasas saturadas, aumentar omega-3 y fibra soluble.', nota_para_paciente: 'Tu aliado principal es la fibra. Come avena cada mañana y agrega nueces a tu dieta.', proxima_cita: '2026-03-01', created_at: '2026-02-01T10:00:00Z' },
    { id: 'c7', paciente_id: 'p3', fecha: '2026-03-01', motivo: 'Control mensual', diagnostico: 'Colesterol LDL bajó a 140 mg/dL. Glucosa estable. Bajó 1.5 kg.', observaciones: 'Progreso en lípidos muy bueno. Mantener fibra soluble y omega-3. Control médico en 3 meses.', nota_para_paciente: 'Tu colesterol bajó 20 puntos. Es un gran logro para un mes de trabajo.', proxima_cita: '2026-04-01', created_at: '2026-03-01T10:00:00Z' },
    // Andrés
    { id: 'c8', paciente_id: 'p4', fecha: '2026-02-10', motivo: 'Primera consulta', diagnostico: 'Ferritina baja 12 ng/mL. Déficit de hierro sin anemia. Ingesta insuficiente de hierro hem.', observaciones: 'Plan con carnes rojas 3x semana, legumbres con vitamina C. Suplemento hierro bisglicianato indicado por médico.', nota_para_paciente: 'Tu rendimiento mejorará cuando subamos el hierro. Toma el suplemento lejos de té y café.', proxima_cita: '2026-03-10', created_at: '2026-02-10T10:00:00Z' },
    { id: 'c9', paciente_id: 'p4', fecha: '2026-03-10', motivo: 'Control mensual', diagnostico: 'Ferritina subió a 28 ng/mL. Reporta mejor energía. Preparación para medio maratón en 8 semanas.', observaciones: 'Plan de carga progresiva de carbohidratos para entrenamiento. Aumentar total calórico 10%.', nota_para_paciente: 'Tu hierro ya está en rangos normales. Ahora enfocamos en prepararte para el maratón.', proxima_cita: '2026-04-10', created_at: '2026-03-10T10:00:00Z' },
  ]

  const antropometria: Antropometria[] = [
    // María
    { id: 'a1', paciente_id: 'p1', consulta_id: 'c1', fecha: '2026-01-10', peso_kg: 72.5, talla_cm: 162, imc: 27.6, perimetro_cintura_cm: 86, perimetro_cadera_cm: 98, icc: 0.88, created_at: '2026-01-10T10:00:00Z' },
    { id: 'a2', paciente_id: 'p1', consulta_id: 'c2', fecha: '2026-02-10', peso_kg: 70.7, talla_cm: 162, imc: 26.9, perimetro_cintura_cm: 83, perimetro_cadera_cm: 97, icc: 0.86, created_at: '2026-02-10T10:00:00Z' },
    { id: 'a3', paciente_id: 'p1', consulta_id: 'c3', fecha: '2026-03-10', peso_kg: 69.8, talla_cm: 162, imc: 26.6, perimetro_cintura_cm: 81, perimetro_cadera_cm: 96, icc: 0.84, created_at: '2026-03-10T10:00:00Z' },
    // Carlos
    { id: 'a4', paciente_id: 'p2', consulta_id: 'c4', fecha: '2026-01-15', peso_kg: 78.0, talla_cm: 178, imc: 24.6, perimetro_cintura_cm: 82, perimetro_cadera_cm: 95, icc: 0.86, created_at: '2026-01-15T10:00:00Z' },
    { id: 'a5', paciente_id: 'p2', consulta_id: 'c5', fecha: '2026-02-15', peso_kg: 79.2, talla_cm: 178, imc: 25.0, perimetro_cintura_cm: 81, perimetro_cadera_cm: 95, icc: 0.85, created_at: '2026-02-15T10:00:00Z' },
    // Sofía
    { id: 'a6', paciente_id: 'p3', consulta_id: 'c6', fecha: '2026-02-01', peso_kg: 68.0, talla_cm: 158, imc: 27.2, perimetro_cintura_cm: 88, perimetro_cadera_cm: 100, icc: 0.88, created_at: '2026-02-01T10:00:00Z' },
    { id: 'a7', paciente_id: 'p3', consulta_id: 'c7', fecha: '2026-03-01', peso_kg: 66.5, talla_cm: 158, imc: 26.6, perimetro_cintura_cm: 85, perimetro_cadera_cm: 99, icc: 0.86, created_at: '2026-03-01T10:00:00Z' },
    // Andrés
    { id: 'a8', paciente_id: 'p4', consulta_id: 'c8', fecha: '2026-02-10', peso_kg: 68.5, talla_cm: 175, imc: 22.4, perimetro_cintura_cm: 76, perimetro_cadera_cm: 90, icc: 0.84, created_at: '2026-02-10T10:00:00Z' },
    { id: 'a9', paciente_id: 'p4', consulta_id: 'c9', fecha: '2026-03-10', peso_kg: 69.0, talla_cm: 175, imc: 22.5, perimetro_cintura_cm: 75, perimetro_cadera_cm: 90, icc: 0.83, created_at: '2026-03-10T10:00:00Z' },
  ]

  const bioimpedancia: Bioimpedancia[] = [
    // María
    { id: 'b1', paciente_id: 'p1', consulta_id: 'c1', fecha: '2026-01-10', masa_grasa_kg: 26.1, masa_grasa_pct: 36.0, masa_magra_kg: 46.4, agua_corporal_lt: 33.5, agua_corporal_pct: 46.2, metabolismo_basal_kcal: 1380, edad_metabolica: 42, created_at: '2026-01-10T10:00:00Z' },
    { id: 'b2', paciente_id: 'p1', consulta_id: 'c2', fecha: '2026-02-10', masa_grasa_kg: 24.8, masa_grasa_pct: 35.1, masa_magra_kg: 45.9, agua_corporal_lt: 34.1, agua_corporal_pct: 48.2, metabolismo_basal_kcal: 1365, edad_metabolica: 40, created_at: '2026-02-10T10:00:00Z' },
    { id: 'b3', paciente_id: 'p1', consulta_id: 'c3', fecha: '2026-03-10', masa_grasa_kg: 23.9, masa_grasa_pct: 34.2, masa_magra_kg: 45.9, agua_corporal_lt: 34.5, agua_corporal_pct: 49.4, metabolismo_basal_kcal: 1358, edad_metabolica: 38, created_at: '2026-03-10T10:00:00Z' },
    // Carlos
    { id: 'b4', paciente_id: 'p2', consulta_id: 'c4', fecha: '2026-01-15', masa_grasa_kg: 10.9, masa_grasa_pct: 14.0, masa_magra_kg: 67.1, agua_corporal_lt: 48.5, agua_corporal_pct: 62.2, metabolismo_basal_kcal: 1920, edad_metabolica: 22, created_at: '2026-01-15T10:00:00Z' },
    { id: 'b5', paciente_id: 'p2', consulta_id: 'c5', fecha: '2026-02-15', masa_grasa_kg: 10.7, masa_grasa_pct: 13.5, masa_magra_kg: 68.5, agua_corporal_lt: 49.5, agua_corporal_pct: 62.5, metabolismo_basal_kcal: 1960, edad_metabolica: 21, created_at: '2026-02-15T10:00:00Z' },
    // Sofía
    { id: 'b6', paciente_id: 'p3', consulta_id: 'c6', fecha: '2026-02-01', masa_grasa_kg: 23.8, masa_grasa_pct: 35.0, masa_magra_kg: 44.2, agua_corporal_lt: 31.0, agua_corporal_pct: 45.6, metabolismo_basal_kcal: 1280, edad_metabolica: 58, created_at: '2026-02-01T10:00:00Z' },
    { id: 'b7', paciente_id: 'p3', consulta_id: 'c7', fecha: '2026-03-01', masa_grasa_kg: 22.8, masa_grasa_pct: 34.3, masa_magra_kg: 43.7, agua_corporal_lt: 31.8, agua_corporal_pct: 47.8, metabolismo_basal_kcal: 1270, edad_metabolica: 56, created_at: '2026-03-01T10:00:00Z' },
  ]

  const examenes: Examen[] = [
    { id: 'e1', paciente_id: 'p1', fecha: '2026-01-08', tipo: 'Hemograma', resultado: 'Normal', notas: 'Sin anemia. Ferritina 35. Vitamina D baja (22 ng/mL), se recomienda suplementar.', archivo_nombre: 'hemograma_enero_2026.pdf', created_at: '2026-01-08T10:00:00Z' },
    { id: 'e2', paciente_id: 'p1', fecha: '2026-01-08', tipo: 'Perfil lipídico', resultado: 'LDL 115 mg/dL, HDL 52 mg/dL, TG 130 mg/dL', notas: 'Leve hipertrigliceridemia. Reducir azúcares simples.', archivo_nombre: 'lipidos_enero_2026.pdf', created_at: '2026-01-08T10:00:00Z' },
    { id: 'e3', paciente_id: 'p2', fecha: '2026-01-13', tipo: 'Hormonal', resultado: 'Testosterona total 540 ng/dL, normal', notas: 'Sin alteraciones. Cortisol matutino normal. Sin necesidad de suplementación hormonal.', archivo_nombre: 'hormonal_enero_2026.pdf', created_at: '2026-01-13T10:00:00Z' },
    { id: 'e4', paciente_id: 'p3', fecha: '2026-01-30', tipo: 'Perfil lipídico + Glicemia', resultado: 'LDL 160 mg/dL, Glicemia ayunas 102 mg/dL', notas: 'Colesterol LDL elevado. Glicemia borderline. Inicio plan nutricional.', archivo_nombre: 'metabolico_enero_2026.pdf', created_at: '2026-01-30T10:00:00Z' },
    { id: 'e5', paciente_id: 'p3', fecha: '2026-02-28', tipo: 'Control lipídico + Glicemia', resultado: 'LDL 140 mg/dL, Glicemia 98 mg/dL', notas: 'Mejora de 20 puntos en LDL en 1 mes. Glicemia normalizada. Continuar plan.', archivo_nombre: 'metabolico_febrero_2026.pdf', created_at: '2026-02-28T10:00:00Z' },
    { id: 'e6', paciente_id: 'p4', fecha: '2026-02-08', tipo: 'Hemograma + Ferritina', resultado: 'Ferritina 12 ng/mL (baja), Hemoglobina 13.8 (normal)', notas: 'Déficit de hierro sin anemia. Iniciar plan de recuperación de hierro y suplemento.', archivo_nombre: 'hemograma_feb_2026.pdf', created_at: '2026-02-08T10:00:00Z' },
  ]

  const minutas: Minuta[] = [
    {
      id: 'm1', paciente_id: 'p1', titulo: 'Plan Déficit Calórico — Mes 2',
      fecha_inicio: '2026-02-10', fecha_fin: '2026-03-10',
      contenido: `DESAYUNO (7:00-8:00)
• 1 taza de avena cocida con leche descremada
• 1 huevo revuelto o duro
• 1 fruta mediana (manzana, pera o naranja)
• 1 taza de café o té sin azúcar

COLACIÓN AM (10:30)
• 1 yogur natural sin azúcar
• Puñado de almendras (20g)

ALMUERZO (13:00)
• Ensalada grande con vegetales crudos + aceite de oliva
• 120g proteína magra (pechuga, merluza, lentejas)
• 1 taza de arroz integral o quinoa
• 1 taza de agua

COLACIÓN PM (16:30)
• 1 fruta o zanahoria con hummus

CENA (20:00)
• Sopa de verduras casera
• 100g proteína magra
• Ensalada simple

HIDRATACIÓN: 2 litros de agua al día mínimo
CALORÍAS APROXIMADAS: 1.500-1.600 kcal`,
      activa: true,
      created_at: '2026-02-10T10:00:00Z',
    },
    {
      id: 'm2', paciente_id: 'p1', titulo: 'Plan Inicial — Mes 1',
      fecha_inicio: '2026-01-10', fecha_fin: '2026-02-09',
      contenido: `Plan inicial básico de reducción calórica. 1.700 kcal/día. Énfasis en reducción de ultraprocesados y azúcares simples. Aumentar consumo de verduras y proteína magra.`,
      activa: false,
      created_at: '2026-01-10T10:00:00Z',
    },
    {
      id: 'm3', paciente_id: 'p2', titulo: 'Plan Hipercalórico — Ganancia Muscular',
      fecha_inicio: '2026-01-15', fecha_fin: '',
      contenido: `DESAYUNO (7:00)
• 3 huevos revueltos con 2 claras adicionales
• 1 taza de avena con leche entera + plátano
• 1 tostada integral con palta

PRE-ENTRENO (30 min antes)
• Plátano + 30g proteína en polvo o atún

POST-ENTRENO (dentro de 30 min)
• 40g proteína en polvo + dextrosa 30g
• O: 200g pollo + 1 taza de arroz

ALMUERZO (13:00)
• 180g carne o pollo o pescado graso
• 1.5 tazas de arroz, pasta o papa
• Ensalada con aceite de oliva

COLACIÓN PM
• 30g proteína en polvo + fruta + avena

CENA (20:00)
• 150g proteína magra
• 1 taza de legumbres o arroz
• Verduras salteadas

CALORÍAS: 3.200-3.400 kcal | PROTEÍNA: 158g | META: +0.5kg/mes`,
      activa: true,
      created_at: '2026-01-15T10:00:00Z',
    },
    {
      id: 'm4', paciente_id: 'p3', titulo: 'Dieta Mediterránea Adaptada — Control Metabólico',
      fecha_inicio: '2026-02-01', fecha_fin: '',
      contenido: `PRINCIPIOS:
• Abundante aceite de oliva extra virgen (3 cdas/día)
• Pescado graso 3x semana (salmón, sardina, atún)
• Legumbres 4x semana
• Nueces y semillas diariamente
• Frutas y verduras de temporada

DESAYUNO
• Avena con leche vegetal + semillas de chía + nueces
• 1 fruta

COLACIÓN AM
• Yogur griego + fruta

ALMUERZO
• Ensalada mediterránea grande
• 1 porción de legumbres o pescado
• Pan integral (opcional, 1 rebanada)

CENA
• Verduras asadas con aceite de oliva
• Huevo o queso cottage o atún

ALIMENTOS A EVITAR:
• Embutidos, cecinas, comida frita
• Azúcar y bebidas azucaradas
• Grasas trans y ultraprocesados`,
      activa: true,
      created_at: '2026-02-01T10:00:00Z',
    },
  ]

  const suplementos: Suplemento[] = [
    { id: 's1', paciente_id: 'p1', nombre: 'Vitamina D3', dosis: '2.000 UI', frecuencia: 'Una vez al día con el almuerzo', instrucciones: 'Tomar con comida que contenga grasa para mejor absorción.', activo: true, fecha_inicio: '2026-01-10', created_at: '2026-01-10T10:00:00Z' },
    { id: 's2', paciente_id: 'p2', nombre: 'Creatina monohidrato', dosis: '5g', frecuencia: 'Una vez al día post-entreno', instrucciones: 'Disolver en agua o en el shake post-entreno. Sin fase de carga necesaria.', activo: true, fecha_inicio: '2026-02-15', created_at: '2026-02-15T10:00:00Z' },
    { id: 's3', paciente_id: 'p2', nombre: 'Proteína en polvo (Whey)', dosis: '30g (1 scoop)', frecuencia: 'Post-entreno inmediato', instrucciones: 'Mezclar con 250ml agua o leche. Dentro de los 30 minutos post-entrenamiento.', activo: true, fecha_inicio: '2026-01-15', created_at: '2026-01-15T10:00:00Z' },
    { id: 's4', paciente_id: 'p3', nombre: 'Omega-3 (EPA+DHA)', dosis: '2g al día (2 cápsulas)', frecuencia: 'Con el almuerzo', instrucciones: 'Tomar con comida para evitar reflujo. Guardar refrigerado.', activo: true, fecha_inicio: '2026-02-01', created_at: '2026-02-01T10:00:00Z' },
    { id: 's5', paciente_id: 'p3', nombre: 'Psyllium (fibra soluble)', dosis: '10g', frecuencia: 'Una vez al día en el desayuno', instrucciones: 'Disolver en un vaso grande de agua y beber inmediatamente. Aumentar ingesta de agua.', activo: true, fecha_inicio: '2026-02-01', created_at: '2026-02-01T10:00:00Z' },
    { id: 's6', paciente_id: 'p4', nombre: 'Hierro bisglicianato', dosis: '36mg', frecuencia: 'Una vez al día en ayunas', instrucciones: 'Tomar con jugo de naranja para mejorar absorción. Separar 2 horas de café, té y lácteos.', activo: true, fecha_inicio: '2026-02-10', created_at: '2026-02-10T10:00:00Z' },
    { id: 's7', paciente_id: 'p4', nombre: 'Vitamina C', dosis: '500mg', frecuencia: 'Con el suplemento de hierro', instrucciones: 'Tomar junto con el hierro para potenciar absorción.', activo: true, fecha_inicio: '2026-02-10', created_at: '2026-02-10T10:00:00Z' },
  ]

  const pacientesProfesional: PacienteProfesional[] = [
    // María - Nutrición
    { rut: '12.345.678-9', profesional_id: 'laura', profesional_nombre: 'Nutricionista Laura', especialidad: 'nutricion', fecha_registro: '2026-01-10' },
    // Carlos - Nutrición
    { rut: '15.234.567-K', profesional_id: 'laura', profesional_nombre: 'Nutricionista Laura', especialidad: 'nutricion', fecha_registro: '2026-01-15' },
    // Sofía - Nutrición
    { rut: '18.765.432-1', profesional_id: 'laura', profesional_nombre: 'Nutricionista Laura', especialidad: 'nutricion', fecha_registro: '2026-02-01' },
    // Andrés - Nutrición
    { rut: '20.123.456-5', profesional_id: 'laura', profesional_nombre: 'Nutricionista Laura', especialidad: 'nutricion', fecha_registro: '2026-02-10' },
  ]

  // Persist all
  pacientes.forEach(p => pacientesStorage.save(p))
  pacientesProfesional.forEach(pp => pacienteProfesionalStorage.save(pp))
  consultas.forEach(c => consultasStorage.save(c))
  antropometria.forEach(a => antropometriaStorage.save(a))
  bioimpedancia.forEach(b => bioimpedanciaStorage.save(b))
  examenes.forEach(e => examenesStorage.save(e))
  minutas.forEach(m => minutasStorage.save(m))
  suplementos.forEach(s => suplementosStorage.save(s))
  markSeeded()
}
