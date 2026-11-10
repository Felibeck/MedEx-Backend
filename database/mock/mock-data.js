// Datos mock para desarrollo (NO usar en producción).
//
// Todo usuario mock tiene un email con el prefijo "mock." y dominio @example.com
// (ej: mock.valeria.sosa@example.com). El prefijo es lo que permite borrarlos sin tocar
// los usuarios @example.com que ya existían antes (ver database/mock/delete_mock_data.sql).
//
// Este archivo NO contiene contraseñas: las genera scripts/seed-mock-data.js en tiempo de
// ejecución y las guarda en .mock-credentials.local.json (ignorado por git).
//
// Los valores de tipo_consulta son los del ENUM existente: primera_vez, seguimiento,
// control, urgencia, telemedicina.

// Organizaciones: no existe endpoint para crearlas, se insertan con
// database/mock/001_mock_organizaciones.sql. `key` se resuelve por nombre en el script.
export const ORGANIZACIONES = {
  clinica: 'Clínica Santa Rita',
  instituto: 'Instituto Médico Belgrano'
};

export const MEDICOS = [
  {
    key: 'sosa',
    titulo: 'Dra.',
    email: 'mock.valeria.sosa@example.com',
    firstName: 'Valeria',
    lastName: 'Sosa Ferrari',
    specialty: 'Clínica Médica',
    licenseNumber: 'MN-90417',
    phoneNumber: '+54 11 5550-2301',
    yearsOfExperience: 14,
    hospital: 'Clínica Santa Rita',
    organizacion: 'clinica',
    address: 'Av. Cabildo 2150',
    city: 'Ciudad Autónoma de Buenos Aires',
    consultationFee: 45000
  },
  {
    key: 'echeverria',
    titulo: 'Dr.',
    email: 'mock.martin.echeverria@example.com',
    firstName: 'Martín',
    lastName: 'Echeverría',
    specialty: 'Cardiología',
    licenseNumber: 'MN-84236',
    phoneNumber: '+54 11 5550-2302',
    yearsOfExperience: 19,
    hospital: 'Clínica Santa Rita',
    organizacion: 'clinica',
    address: 'Av. Cabildo 2150',
    city: 'Ciudad Autónoma de Buenos Aires',
    consultationFee: 60000
  },
  {
    key: 'benitez',
    titulo: 'Dra.',
    email: 'mock.lucia.benitez@example.com',
    firstName: 'Lucía',
    lastName: 'Benítez Aguirre',
    specialty: 'Ginecología y Obstetricia',
    licenseNumber: 'MN-77158',
    phoneNumber: '+54 11 5550-2303',
    yearsOfExperience: 11,
    hospital: 'Instituto Médico Belgrano',
    organizacion: 'instituto',
    address: 'Juramento 1840',
    city: 'Ciudad Autónoma de Buenos Aires',
    consultationFee: 52000
  }
];

export const PACIENTES = [
  {
    key: 'sofia',
    email: 'mock.sofia.gutierrez@example.com',
    firstName: 'Sofía',
    lastName: 'Gutiérrez',
    dni: '34218765',
    dateOfBirth: '1989-03-14',
    gender: 'femenino',
    phoneNumber: '+54 11 5532-8841',
    historial: {
      ant: 'Hipotiroidismo diagnosticado en 2019, en tratamiento con levotiroxina. Sin internaciones previas.',
      ago: 'Menarca a los 12 años. Ciclos regulares de 28 días. G0. PAP anual.',
      ahf: 'Madre con hipotiroidismo. Padre con hipertensión arterial.',
      mx: 'Mamografía bilateral 2026: BI-RADS 1.',
      eco: 'Ecografía ginecológica transvaginal 2026 sin hallazgos patológicos.',
      ef: 'Peso 63 kg, talla 1,65 m, IMC 23,1. TA 110/70. Tiroides sin nódulos palpables.',
      otros: 'Sin hábitos tóxicos. Actividad física leve, dos veces por semana.'
    }
  },
  {
    key: 'joaquin',
    email: 'mock.joaquin.alvarez@example.com',
    firstName: 'Joaquín',
    lastName: 'Álvarez',
    dni: '25904412',
    dateOfBirth: '1976-11-02',
    gender: 'masculino',
    phoneNumber: '+54 11 5532-8842',
    historial: {
      ant: 'Hipertensión arterial desde 2026. Dislipemia. Ex fumador (suspendió en 2026). Apendicectomía en la adolescencia.',
      ago: null,
      ahf: 'Padre fallecido por infarto agudo de miocardio a los 61 años. Madre hipertensa.',
      mx: null,
      eco: 'Ecocardiograma 2026: fracción de eyección 60%, sin valvulopatías.',
      ef: 'Peso 88 kg, talla 1,78 m, IMC 27,8. TA 126/80. Ruidos cardíacos normofonéticos.',
      otros: 'Trabajo de oficina, sedentario. Consumo de alcohol social.'
    }
  },
  {
    key: 'camila',
    email: 'mock.camila.dominguez@example.com',
    firstName: 'Camila',
    lastName: 'Domínguez',
    dni: '38560127',
    dateOfBirth: '1995-07-21',
    gender: 'femenino',
    phoneNumber: '+54 11 5532-8843',
    historial: {
      ant: 'Asma bronquial desde la infancia. Sin internaciones en los últimos 5 años.',
      ago: 'Menarca a los 13 años. Ciclos regulares. G0.',
      ahf: 'Hermano con asma. Madre con rinitis alérgica.',
      mx: null,
      eco: null,
      ef: 'Peso 58 kg, talla 1,62 m. Saturación 98% a aire ambiente. Murmullo vesicular conservado.',
      otros: 'No fumadora. Convive con una mascota (gato).'
    }
  },
  {
    key: 'tomas',
    email: 'mock.tomas.fernandez@example.com',
    firstName: 'Tomás',
    lastName: 'Fernández',
    dni: '42133596',
    dateOfBirth: '2001-01-30',
    gender: 'masculino',
    phoneNumber: '+54 11 5532-8844',
    historial: {
      ant: 'Sin antecedentes patológicos relevantes. Esquema de vacunación completo.',
      ago: null,
      ahf: 'Padre con rinitis alérgica.',
      mx: null,
      eco: null,
      ef: 'Peso 74 kg, talla 1,77 m, IMC 23,6. TA 114/72.',
      otros: 'Estudiante universitario. Practica fútbol dos veces por semana.'
    }
  },
  {
    key: 'marta',
    email: 'mock.marta.acosta@example.com',
    firstName: 'Marta Beatriz',
    lastName: 'Acosta',
    dni: '12874339',
    dateOfBirth: '1958-05-09',
    gender: 'femenino',
    phoneNumber: '+54 11 5532-8845',
    historial: {
      ant: 'Diabetes mellitus tipo 2 desde 2012. Hipertensión arterial desde 2008. Osteopenia. Colecistectomía en 2005.',
      ago: 'Menarca a los 12 años. Menopausia a los 50. G3 P3 A0.',
      ahf: 'Madre con diabetes tipo 2 y fractura de cadera. Hermana con cáncer de mama.',
      mx: 'Mamografía bilateral 2026: BI-RADS 2, hallazgos benignos.',
      eco: null,
      ef: 'Peso 72 kg, talla 1,58 m, IMC 28,8. TA 134/80. Pulsos pedios presentes, sin lesiones en los pies.',
      otros: 'Retinografía anual. Dieta hipoglúcida. Camina 30 minutos diarios.'
    }
  },
  {
    key: 'lautaro',
    email: 'mock.lautaro.medina@example.com',
    firstName: 'Lautaro',
    lastName: 'Medina',
    dni: '30476218',
    dateOfBirth: '1983-09-17',
    gender: 'masculino',
    phoneNumber: '+54 11 5532-8846',
    historial: {
      ant: 'Enfermedad por reflujo gastroesofágico desde 2026. Sin cirugías previas.',
      ago: null,
      ahf: 'Padre con gastritis crónica. Sin antecedentes de cáncer digestivo.',
      mx: null,
      eco: null,
      ef: 'Peso 92 kg, talla 1,80 m, IMC 28,4. Abdomen blando, depresible, indoloro.',
      otros: 'Consume café y comidas copiosas por la noche. Fumador social ocasional.'
    }
  },
  {
    key: 'valentina',
    email: 'mock.valentina.rios@example.com',
    firstName: 'Valentina',
    lastName: 'Ríos',
    dni: '36781904',
    dateOfBirth: '1992-12-05',
    gender: 'femenino',
    phoneNumber: '+54 11 5532-8847',
    historial: {
      ant: 'Sin antecedentes patológicos de relevancia. Grupo y factor O Rh negativo.',
      ago: 'Menarca a los 12 años. Ciclos regulares de 30 días. G1 P0 A0, embarazo en curso (FUM 10/02/2026).',
      ahf: 'Madre con diabetes gestacional.',
      mx: null,
      eco: 'Ecografía morfológica a las 24 semanas: sin alteraciones.',
      ef: 'Peso previo al embarazo 61 kg, actual 68 kg. TA 112/70. Altura uterina acorde a edad gestacional.',
      otros: 'Suplementación con ácido fólico y hierro. No fuma ni consume alcohol.'
    }
  },
  {
    key: 'ramiro',
    email: 'mock.ramiro.castro@example.com',
    firstName: 'Ramiro',
    lastName: 'Castro',
    dni: '20915378',
    dateOfBirth: '1968-04-26',
    gender: 'masculino',
    phoneNumber: '+54 11 5532-8848',
    historial: {
      ant: 'Síndrome coronario agudo sin elevación del ST en febrero de 2026, angioplastia con stent farmacológico en arteria descendente anterior. Hipertensión arterial. Dislipemia. Ex fumador desde 2026 (30 paquetes-año).',
      ago: null,
      ahf: 'Padre con infarto agudo de miocardio a los 58 años. Hermano con diabetes tipo 2.',
      mx: null,
      eco: 'Ecocardiograma 2026: hipoquinesia leve del segmento apical anterior, fracción de eyección 52%.',
      ef: 'Peso 85 kg, talla 1,72 m, IMC 28,7. TA 124/76, FC 62 lpm. Sin signos de insuficiencia cardíaca.',
      otros: 'Medicación crónica: aspirina, clopidogrel, atorvastatina, bisoprolol, enalapril. En rehabilitación cardiovascular.'
    }
  },
  {
    key: 'agustina',
    email: 'mock.agustina.pereyra@example.com',
    firstName: 'Agustina',
    lastName: 'Pereyra',
    dni: '41208664',
    dateOfBirth: '1999-08-11',
    gender: 'femenino',
    phoneNumber: '+54 11 5532-8849',
    historial: {
      ant: 'Sin antecedentes patológicos. Sin cirugías previas.',
      ago: 'Menarca a los 12 años. Ciclos regulares de 28 días. G0. Inicio de relaciones sexuales a los 18 años. Anticonceptivo oral combinado desde abril de 2026.',
      ahf: 'Abuela materna con cáncer de mama a los 70 años.',
      mx: null,
      eco: null,
      ef: 'Peso 56 kg, talla 1,64 m, IMC 20,8. TA 110/70.',
      otros: 'No fuma. Actividad física regular (running).'
    }
  }
];

// Consultas: cada una la crea el médico indicado (por su JWT) sobre el paciente por DNI.
// `diag` NO lo guarda el endpoint (createConsulta no lo acepta); se completa con
// database/mock/002_mock_enrichment.sql, que cruza por (dni, fecha).
// solicitud_* : estudio / receta / cita próxima.
export const CONSULTAS = [
  // --- Sofía Gutiérrez ---
  { paciente: 'sofia', medico: 'benitez', fecha: '2026-03-10', tipo_consulta: 'primera_vez', solicitud_estudio: true,
    notas: 'Paciente de 37 años consulta por control ginecológico anual. Ciclos regulares de 28 días, sin dismenorrea ni dispareunia. Sin flujo patológico. Examen mamario sin nódulos palpables. Se realiza PAP y colposcopía. Se solicita ecografía ginecológica transvaginal y mamografía bilateral.' },
  { paciente: 'sofia', medico: 'benitez', fecha: '2026-04-22', tipo_consulta: 'seguimiento',
    notas: 'Trae resultados: PAP negativo para lesión intraepitelial, ecografía ginecológica sin hallazgos patológicos y mamografía BI-RADS 1. Se indica continuar con controles anuales.' },
  { paciente: 'sofia', medico: 'sosa', fecha: '2026-07-08', tipo_consulta: 'control', solicitud_estudio: true, solicitud_receta: true,
    notas: 'Refiere astenia y aumento de peso de 3 kg en dos meses. Antecedente de hipotiroidismo en tratamiento con levotiroxina 75 mcg. Se solicita TSH, T4 libre y hemograma de control. Se mantiene la dosis hasta tener resultados.' },
  { paciente: 'sofia', medico: 'sosa', fecha: '2026-09-02', tipo_consulta: 'seguimiento', solicitud_receta: true, solicitud_citaprox: true,
    notas: 'TSH 5,8 uUI/ml (valor previo 3,1). Se ajusta levotiroxina a 88 mcg en ayunas, 30 minutos antes del desayuno. Control con laboratorio en 8 semanas.' },

  // --- Joaquín Álvarez ---
  { paciente: 'joaquin', medico: 'sosa', fecha: '2026-02-17', tipo_consulta: 'primera_vez', solicitud_estudio: true,
    notas: 'Hombre de 49 años que consulta por cefalea occipital matutina de dos semanas de evolución. TA 156/96 en dos tomas. Sedentario, fumador de 10 cigarrillos diarios. Se solicita laboratorio completo, ECG y MAPA de 24 horas. Se indican medidas higiénico-dietéticas.' },
  { paciente: 'joaquin', medico: 'echeverria', fecha: '2026-03-12', tipo_consulta: 'primera_vez', solicitud_receta: true, solicitud_citaprox: true,
    notas: 'Derivado por clínica médica por hipertensión arterial. ECG: ritmo sinusal, FC 74 lpm, sin signos de hipertrofia ventricular. Ecocardiograma con fracción de eyección conservada (60%). MAPA con promedio diurno 148/92. Se inicia enalapril 10 mg cada 12 horas.' },
  { paciente: 'joaquin', medico: 'echeverria', fecha: '2026-05-14', tipo_consulta: 'seguimiento', solicitud_receta: true,
    notas: 'TA en consultorio 132/84 con enalapril. Refiere tos seca nocturna, se rota a losartán 50 mg cada 24 horas. Perfil lipídico con LDL 148 mg/dl, se indica atorvastatina 20 mg. Se insiste con la cesación tabáquica.' },
  { paciente: 'joaquin', medico: 'echeverria', fecha: '2026-10-15', tipo_consulta: 'control', solicitud_citaprox: true,
    notas: 'Buena adherencia al tratamiento. TA 126/80. Dejó de fumar hace 4 meses. LDL 96 mg/dl. Se continúa con losartán 50 mg y atorvastatina 20 mg. Próximo control en 6 meses con laboratorio.' },

  // --- Camila Domínguez ---
  { paciente: 'camila', medico: 'sosa', fecha: '2026-04-07', tipo_consulta: 'urgencia', solicitud_receta: true,
    notas: 'Consulta por disnea y sibilancias de 24 horas de evolución, desencadenadas por un cuadro respiratorio viral. Saturación 94% a aire ambiente, sibilancias espiratorias bilaterales. Se indica salbutamol en aerosol con aerocámara y prednisona 40 mg por 5 días. Se explican pautas de alarma.' },
  { paciente: 'camila', medico: 'sosa', fecha: '2026-04-21', tipo_consulta: 'seguimiento', solicitud_estudio: true, solicitud_receta: true,
    notas: 'Evoluciona sin disnea. Pico flujo 410 l/min. Se indica budesonida/formoterol 160/4,5 como tratamiento de mantenimiento, dos inhalaciones cada 12 horas, y salbutamol de rescate. Se solicita espirometría.' },
  { paciente: 'camila', medico: 'sosa', fecha: '2026-08-26', tipo_consulta: 'control',
    notas: 'Espirometría con patrón obstructivo reversible tras broncodilatador. Sin crisis en los últimos 4 meses. Técnica inhalatoria correcta. Se mantiene el tratamiento y se indica vacuna antigripal.' },

  // --- Tomás Fernández ---
  { paciente: 'tomas', medico: 'sosa', fecha: '2026-06-03', tipo_consulta: 'primera_vez', solicitud_receta: true,
    notas: 'Joven de 25 años que consulta por estornudos, prurito ocular y congestión nasal de predominio primaveral. Sin antecedentes de asma. Se indica loratadina 10 mg cada 24 horas y lavados nasales con solución salina.' },
  { paciente: 'tomas', medico: 'sosa', fecha: '2026-10-20', tipo_consulta: 'telemedicina', solicitud_receta: true,
    notas: 'Consulta virtual. Persisten síntomas nasales con la llegada de la primavera, con respuesta parcial a loratadina. Se agrega mometasona nasal, una aplicación por fosa cada 24 horas. Si no mejora, se evaluará derivación a alergología.' },

  // --- Marta Beatriz Acosta ---
  { paciente: 'marta', medico: 'sosa', fecha: '2026-01-27', tipo_consulta: 'seguimiento', solicitud_estudio: true, solicitud_receta: true,
    notas: 'Paciente de 67 años con diabetes tipo 2 e hipertensión. Glucemia en ayunas 142 mg/dl, HbA1c 7,6%. Refiere calambres en miembros inferiores. Se ajusta metformina a 850 mg cada 12 horas y se solicitan fondo de ojo y microalbuminuria.' },
  { paciente: 'marta', medico: 'echeverria', fecha: '2026-03-19', tipo_consulta: 'control', solicitud_receta: true,
    notas: 'Control cardiovascular. TA 138/82 con enalapril 10 mg y amlodipina 5 mg. ECG sin cambios isquémicos. LDL 112 mg/dl. Se agrega rosuvastatina 10 mg por riesgo cardiovascular alto asociado a la diabetes.' },
  { paciente: 'marta', medico: 'benitez', fecha: '2026-06-11', tipo_consulta: 'control', solicitud_estudio: true,
    notas: 'Control ginecológico posmenopáusico. Sin sangrado ni síntomas urinarios. Se solicita mamografía bilateral y densitometría ósea por antecedente familiar de osteoporosis.' },
  { paciente: 'marta', medico: 'sosa', fecha: '2026-08-05', tipo_consulta: 'seguimiento', solicitud_receta: true,
    notas: 'HbA1c 6,9%. Densitometría con osteopenia en columna lumbar (T-score -1,8). Se indica calcio 1200 mg y vitamina D 2000 UI diarios y actividad física con carga. Control en 6 meses.' },
  { paciente: 'marta', medico: 'sosa', fecha: '2026-10-28', tipo_consulta: 'control', solicitud_citaprox: true,
    notas: 'Refiere buena adherencia. Glucemia en ayunas 118 mg/dl. Se aplica vacuna antigripal y se actualiza el esquema antineumocócico. Examen de pies sin lesiones.' },

  // --- Lautaro Medina ---
  { paciente: 'lautaro', medico: 'sosa', fecha: '2026-05-06', tipo_consulta: 'primera_vez', solicitud_receta: true,
    notas: 'Consulta por acidez retroesternal y regurgitación postprandial de tres meses de evolución, que empeora al acostarse. Sin disfagia ni pérdida de peso. Se indica omeprazol 20 mg en ayunas por 8 semanas, medidas posturales y dietarias. Se solicitará endoscopía digestiva alta si no hay mejoría.' },
  { paciente: 'lautaro', medico: 'sosa', fecha: '2026-07-14', tipo_consulta: 'seguimiento', solicitud_estudio: true,
    notas: 'Mejoría parcial de los síntomas. Persisten episodios nocturnos. Se solicita videoendoscopía digestiva alta y se mantiene omeprazol 20 mg.' },
  { paciente: 'lautaro', medico: 'sosa', fecha: '2026-09-30', tipo_consulta: 'control', solicitud_receta: true,
    notas: 'Endoscopía con esofagitis grado A de Los Ángeles, sin esófago de Barrett. Test de ureasa negativo. Se continúa omeprazol 20 mg por 8 semanas adicionales y luego a demanda.' },

  // --- Valentina Ríos ---
  { paciente: 'valentina', medico: 'benitez', fecha: '2026-03-24', tipo_consulta: 'primera_vez', solicitud_estudio: true, solicitud_receta: true,
    notas: 'Consulta por amenorrea de 6 semanas y test de embarazo positivo. FUM 10/02/2026. Ecografía transvaginal: saco gestacional intrauterino con embrión único y latido cardíaco positivo. Se indica ácido fólico 5 mg diarios y se solicita laboratorio prenatal.' },
  { paciente: 'valentina', medico: 'benitez', fecha: '2026-05-12', tipo_consulta: 'control',
    notas: 'Embarazo de 13 semanas. Sin metrorragia ni náuseas importantes. TA 108/66, peso estable. Translucencia nucal dentro de parámetros. Laboratorio: hemoglobina 12,1 g/dl, serologías negativas, grupo O Rh negativo, Coombs indirecta negativa. Se programa gammaglobulina anti-D a las 28 semanas.' },
  { paciente: 'valentina', medico: 'benitez', fecha: '2026-07-28', tipo_consulta: 'control', solicitud_estudio: true,
    notas: 'Embarazo de 24 semanas. Movimientos fetales presentes, altura uterina acorde. Ecografía morfológica normal. Se solicita prueba de tolerancia oral a la glucosa. TA 112/70.' },
  { paciente: 'valentina', medico: 'benitez', fecha: '2026-09-22', tipo_consulta: 'control', solicitud_estudio: true, solicitud_citaprox: true,
    notas: 'Embarazo de 32 semanas. Sin edemas ni cefalea. Altura uterina 31 cm, latidos fetales 144 lpm. Gammaglobulina anti-D aplicada en la semana 28 según carnet. Se solicita ecografía del tercer trimestre y monitoreo fetal desde la semana 36.' },

  // --- Ramiro Castro ---
  { paciente: 'ramiro', medico: 'echeverria', fecha: '2026-02-10', tipo_consulta: 'urgencia', solicitud_estudio: true,
    notas: 'Dolor opresivo precordial de 30 minutos de duración, irradiado a brazo izquierdo, con sudoración. ECG con descenso del ST en V4-V6 y troponina elevada. Se deriva a guardia para internación en unidad coronaria con diagnóstico presuntivo de síndrome coronario agudo sin elevación del ST.' },
  { paciente: 'ramiro', medico: 'echeverria', fecha: '2026-03-03', tipo_consulta: 'seguimiento', solicitud_receta: true,
    notas: 'Alta sanatorial tras cateterismo con angioplastia y colocación de stent farmacológico en arteria descendente anterior. Se indican aspirina 100 mg, clopidogrel 75 mg, atorvastatina 80 mg, bisoprolol 2,5 mg y enalapril 5 mg. Inicia rehabilitación cardiovascular.' },
  { paciente: 'ramiro', medico: 'echeverria', fecha: '2026-06-16', tipo_consulta: 'control', solicitud_estudio: true,
    notas: 'Asintomático. Prueba ergométrica graduada submáxima sin isquemia a 8 METs. TA 124/76, FC 62 lpm. Continúa doble antiagregación hasta completar 12 meses. Se refuerza el abandono del tabaco.' },
  { paciente: 'ramiro', medico: 'sosa', fecha: '2026-10-27', tipo_consulta: 'control', solicitud_estudio: true,
    notas: 'Control clínico general. Mantiene abstinencia tabáquica. Laboratorio: LDL 68 mg/dl, glucemia 98 mg/dl. Se solicita ecocardiograma de control a pedido de cardiología. Vacunas antigripal y anti-COVID actualizadas.' },

  // --- Agustina Pereyra ---
  { paciente: 'agustina', medico: 'benitez', fecha: '2026-04-14', tipo_consulta: 'primera_vez', solicitud_receta: true,
    notas: 'Consulta por método anticonceptivo. Ciclos regulares, sin antecedentes trombóticos, TA 110/70, no fumadora. Se indica anticonceptivo oral combinado de drospirenona/etinilestradiol, un comprimido diario. Se explica la conducta ante olvidos y se solicita PAP.' },
  { paciente: 'agustina', medico: 'benitez', fecha: '2026-07-21', tipo_consulta: 'control', solicitud_receta: true,
    notas: 'Buena tolerancia, sin cefalea ni metrorragia intermenstrual. PAP negativo. Se continúa con el mismo anticonceptivo y se entrega receta por 6 meses.' },
  { paciente: 'agustina', medico: 'benitez', fecha: '2026-10-13', tipo_consulta: 'telemedicina', solicitud_receta: true,
    notas: 'Consulta virtual por flujo vaginal blanquecino con prurito de 3 días. Sin fiebre ni dolor pélvico. Se indica clotrimazol en óvulos de 500 mg, dosis única, y se recomienda consulta presencial si persiste.' }
];
