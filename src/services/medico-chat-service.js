// Servicio orchestrator del chat de IA para médicos.
// No reimplementa lógica de negocio: delega siempre a la instancia de DoctorService
// ya wireada (buscarPacientePorDni, getHistorialClinico, createConsulta).

import { callGemini } from '../configs/gemini-client.js';

const SYSTEM_INSTRUCTION = `Sos un asistente para médicos dentro de un sistema de historia clínica (MedEx). Los médicos que te usan pueden no tener experiencia con tecnología, así que tus respuestas deben ser simples, breves y directas, sin jerga técnica.

Reglas que tenés que seguir siempre:
- Si falta el DNI del paciente y no hay uno ya identificado en esta conversación, pedíselo al médico antes de intentar cualquier acción.
- Cuando ya identificaste un paciente en la conversación (por DNI), no le vuelvas a pedir el DNI para acciones siguientes sobre el mismo paciente.
- Antes de llamar a la función crear_consulta, si el médico no aclaró explícitamente si quiere agregar una nota a la consulta, preguntale "¿querés agregar alguna nota a la consulta?". Nunca asumas que no quiere nota — preguntá siempre que no lo haya dicho.
- Nunca inventes datos médicos, DNIs, nombres ni resultados de historial. Si no tenés la información, preguntala en vez de completarla vos.
- Crear una consulta es una acción sensible: la función crear_consulta no la ejecuta de inmediato, solo prepara los datos para que el médico la confirme después. Llamala solo cuando ya tengas todos los datos necesarios (incluida la respuesta del médico sobre la nota).`;

const TOOLS = [
  {
    name: 'buscar_paciente_por_dni',
    description: 'Busca un paciente registrado en el sistema por su número de DNI. Usar cuando el médico menciona un DNI o pide buscar/atender a un paciente.',
    parameters: {
      type: 'OBJECT',
      properties: {
        dni: { type: 'STRING', description: 'Número de DNI del paciente.' }
      },
      required: ['dni']
    }
  },
  {
    name: 'ver_historial_paciente',
    description: 'Devuelve el historial clínico completo de un paciente (alergias, condiciones crónicas, consultas previas, estudios, antecedentes). Si ya se identificó un paciente antes en esta conversación, no es necesario pasar pacienteId.',
    parameters: {
      type: 'OBJECT',
      properties: {
        pacienteId: { type: 'STRING', description: 'ID interno del paciente (perfiles_paciente.id). Opcional si ya hay un paciente identificado en la conversación.' }
      },
      required: []
    }
  },
  {
    name: 'crear_consulta',
    description: 'Registra una nueva consulta médica para un paciente. IMPORTANTE: no llamar a esta función hasta haberle preguntado al médico si quiere agregar una nota, salvo que ya lo haya aclarado.',
    parameters: {
      type: 'OBJECT',
      properties: {
        dni: { type: 'STRING', description: 'DNI del paciente. Opcional si ya hay un paciente identificado en la conversación.' },
        notas: { type: 'STRING', description: 'Nota clínica de la consulta, en texto libre. Omitir si el médico confirmó explícitamente que no quiere agregar nota.' },
        tipo_consulta: {
          type: 'STRING',
          description: 'Tipo de consulta.',
          enum: ['primera_vez', 'seguimiento', 'control', 'urgencia', 'telemedicina']
        }
      },
      required: []
    }
  }
];

const MAX_TOOL_ROUNDS = 5;

export class MedicoChatService {
  constructor(doctorService) {
    this.doctorService = doctorService;

    // Estado de conversación en memoria: conversationId -> { historial, contexto }.
    // Se pierde si el proceso reinicia o corre en más de una instancia — aceptable
    // para esta v1. Si se necesita sobrevivir reinicios o escalar horizontalmente,
    // esto tendría que moverse a un store externo (Redis, tabla en Supabase, etc.).
    this.conversaciones = new Map();
  }

  _getConversacion(conversationId) {
    if (!conversationId) {
      throw new Error('conversationId es requerido');
    }

    if (!this.conversaciones.has(conversationId)) {
      this.conversaciones.set(conversationId, {
        historial: [],
        contexto: { pacienteId: null, dni: null, nombrePaciente: null }
      });
    }

    return this.conversaciones.get(conversationId);
  }

  async _ejecutarBuscarPaciente(conversacion, args) {
    const dni = args?.dni;
    if (!dni) {
      return { error: 'Falta el DNI del paciente.' };
    }

    try {
      const paciente = await this.doctorService.buscarPacientePorDni(dni);
      conversacion.contexto.pacienteId = paciente.paciente_id;
      conversacion.contexto.dni = paciente.dni;
      conversacion.contexto.nombrePaciente = `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim() || null;
      return paciente;
    } catch (error) {
      return { error: error.message };
    }
  }

  async _ejecutarVerHistorial(conversacion, args) {
    const pacienteId = args?.pacienteId || conversacion.contexto.pacienteId;

    if (!pacienteId) {
      return { error: 'No hay un paciente identificado en esta conversación. Hay que pedirle el DNI al médico y buscarlo primero con buscar_paciente_por_dni.' };
    }

    try {
      return await this.doctorService.getHistorialClinico(pacienteId);
    } catch (error) {
      return { error: error.message };
    }
  }

  _prepararConfirmacionCrearConsulta(conversacion, args) {
    const dni = args?.dni || conversacion.contexto.dni;

    if (!dni) {
      return { error: 'Falta el DNI del paciente para crear la consulta.' };
    }

    return {
      requiereConfirmacion: true,
      accion: 'crear_consulta',
      parametros: {
        dni,
        notas: args?.notas ?? null,
        tipo_consulta: args?.tipo_consulta ?? null
      }
    };
  }

  _resumirCreacionConsulta(parametros, contexto) {
    const nombre = contexto?.nombrePaciente ? ` para ${contexto.nombrePaciente}` : '';
    const tipoTexto = parametros.tipo_consulta ? ` (tipo: ${parametros.tipo_consulta})` : '';
    const notaTexto = parametros.notas ? ` con la nota: "${parametros.notas}"` : ' sin notas';
    return `Voy a crear una consulta${nombre} (DNI ${parametros.dni})${tipoTexto}${notaTexto}. ¿Confirmás?`;
  }

  async _llamarTool(conversacion, name, args) {
    if (name === 'buscar_paciente_por_dni') {
      return this._ejecutarBuscarPaciente(conversacion, args);
    }
    if (name === 'ver_historial_paciente') {
      return this._ejecutarVerHistorial(conversacion, args);
    }
    return { error: `Función desconocida: ${name}` };
  }

  async procesarMensaje(conversationId, mensajeUsuario) {
    const conversacion = this._getConversacion(conversationId);

    conversacion.historial.push({ role: 'user', parts: [{ text: mensajeUsuario }] });

    for (let ronda = 0; ronda < MAX_TOOL_ROUNDS; ronda++) {
      const respuesta = await callGemini({
        systemInstruction: SYSTEM_INSTRUCTION,
        contents: conversacion.historial,
        tools: TOOLS
      });

      const parts = respuesta?.candidates?.[0]?.content?.parts || [];
      const functionCallPart = parts.find(p => p.functionCall);

      if (!functionCallPart) {
        const texto = parts.map(p => p.text || '').join('').trim() || 'No obtuve una respuesta del asistente.';
        conversacion.historial.push({ role: 'model', parts: [{ text: texto }] });
        return { tipo: 'mensaje', mensaje: texto };
      }

      const { name, args, id } = functionCallPart.functionCall;
      const functionCallEcho = { name, args, ...(id ? { id } : {}) };

      // Registrar el turno del modelo (la llamada a función) en el historial
      conversacion.historial.push({ role: 'model', parts: [{ functionCall: functionCallEcho }] });

      if (name === 'crear_consulta') {
        const resultado = this._prepararConfirmacionCrearConsulta(conversacion, args);

        if (resultado.error) {
          // Le devolvemos el error al modelo (como resultado de la función) para que
          // le pida el dato faltante al médico, en vez de romper el flujo.
          conversacion.historial.push({
            role: 'user',
            parts: [{ functionResponse: { name, response: resultado, ...(id ? { id } : {}) } }]
          });
          continue;
        }

        return {
          tipo: 'confirmacion_requerida',
          mensaje: this._resumirCreacionConsulta(resultado.parametros, conversacion.contexto),
          accion: resultado.accion,
          parametros: resultado.parametros
        };
      }

      const resultadoTool = await this._llamarTool(conversacion, name, args);

      conversacion.historial.push({
        role: 'user',
        parts: [{ functionResponse: { name, response: resultadoTool, ...(id ? { id } : {}) } }]
      });
      // Sigue el loop: se vuelve a llamar a Gemini con el resultado de la tool en el historial.
    }

    const mensajeLimite = 'No pude completar la solicitud después de varios intentos. Probá reformular el pedido.';
    conversacion.historial.push({ role: 'model', parts: [{ text: mensajeLimite }] });
    return { tipo: 'mensaje', mensaje: mensajeLimite };
  }

  async confirmarAccion(conversationId, accion, parametros, perfilProfesional) {
    const conversacion = this._getConversacion(conversationId);

    if (accion !== 'crear_consulta') {
      throw new Error(`Acción no soportada: ${accion}`);
    }

    // Igual que en DoctorController.crearConsulta: el profesional y su organización
    // se derivan siempre del médico autenticado, nunca de los parámetros propuestos
    // por el modelo/frontend, para evitar que se falsifiquen.
    if (!perfilProfesional?.id) {
      throw new Error('No se encontró el perfil profesional del médico autenticado');
    }
    if (!perfilProfesional.organizacion_id) {
      throw new Error('El médico no tiene una organización asociada');
    }

    const data = await this.doctorService.createConsulta({
      ...parametros,
      profesional_id: perfilProfesional.id,
      organizacion_id: perfilProfesional.organizacion_id
    }, null);

    conversacion.historial.push({
      role: 'model',
      parts: [{ text: `Consulta creada correctamente (id: ${data?.id || 'sin id'}).` }]
    });

    return { tipo: 'mensaje', mensaje: 'Consulta creada correctamente', consultaCreada: data };
  }
}
