import { useState, type KeyboardEvent } from 'react';
import { useApp } from '../context/AppContext';

// Transcripciones de los videos educativos
const VIDEO_TRANSCRIPTS: Record<string, Record<string, string>> = {
  es: {
    plagios: `[00:00] Bienvenidos al video sobre integridad académica y plagio en eventos universitarios.
[00:08] El plagio consiste en presentar como propias las ideas, palabras o trabajos de otra persona sin el debido crédito.
[00:18] Existen diferentes tipos de plagio: directo (copia literal), paráfrasis sin citar, auto-plagio y plagio de imágenes o datos.
[00:30] Las consecuencias incluyen invalidación del trabajo, sanciones académicas y, en casos graves, consecuencias legales.
[00:40] Para evitarlo: cite siempre sus fuentes, use comillas para citas textuales y emplee herramientas anti-plagio antes de entregar.
[00:52] Recuerde: la honestidad académica es la base de una comunidad científica confiable. Fin del video.`,
    tutorias: `[00:00] Bienvenidos al video de orientación sobre el sistema de tutorías del evento.
[00:07] Las tutorías son sesiones personalizadas de apoyo disponibles para todos los participantes registrados.
[00:15] Puede agendar una tutoría directamente desde el panel de Agenda y Sesiones del sistema.
[00:24] Cada sesión de tutoría dura entre 20 y 30 minutos y puede realizarse de forma presencial o virtual.
[00:34] Los tutores son expertos temáticos designados por los organizadores del evento.
[00:42] Para solicitar una tutoría, acceda a su perfil, seleccione "Solicitar Tutoría" e indique el tema de consulta.
[00:53] El sistema le enviará una confirmación con los datos del tutor y el enlace de la sesión. Fin del video.`,
  },
  en: {
    plagios: `[00:00] Welcome to the video on academic integrity and plagiarism at university events.
[00:08] Plagiarism means presenting someone else's ideas, words, or work as your own without proper attribution.
[00:18] Types include: direct copy, paraphrasing without citation, self-plagiarism, and image or data plagiarism.
[00:30] Consequences may include invalidation of work, academic sanctions, and in serious cases, legal consequences.
[00:40] To avoid it: always cite your sources, use quotation marks for direct quotes, and use anti-plagiarism tools before submission.
[00:52] Remember: academic honesty is the foundation of a trustworthy scientific community. End of video.`,
    tutorias: `[00:00] Welcome to the tutorial orientation video for the event system.
[00:07] Tutoring sessions are personalized support meetings available to all registered participants.
[00:15] You can schedule a tutoring session directly from the Agenda & Sessions panel in the system.
[00:24] Each tutoring session lasts between 20 and 30 minutes and can be held in person or virtually.
[00:34] Tutors are subject-matter experts designated by event organizers.
[00:42] To request a session, go to your profile, select "Request Tutoring," and specify your topic.
[00:53] The system will send you a confirmation with the tutor's details and session link. End of video.`,
  },
};


// Normaliza un texto eliminando tildes y pasándolo a minúsculas
function normalizeText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Definición de categorías con palabras clave expandidas (ES + EN mezcladas para bilingüismo)
const BOT_CATEGORIES = [
  {
    id: 'saludo',
    // Frases de apertura — se evalúan por separado al inicio del mensaje
    greetingOnly: true,
    keywords: [
      'hola','buenos','buenas','hey','hi','hello','saludos','buen dia',
      'good morning','good afternoon','good evening','que tal','como estas',
      'buenas tardes','buenas noches','buenas dias','sup','whats up',
    ],
    response: (es: boolean) => es
      ? '¡Hola! 👋 Soy tu asistente virtual. Puedo ayudarte con inscripciones, eventos, boletos, accesibilidad, encuestas, atajos de teclado y más. ¿En qué te ayudo hoy?'
      : 'Hello! 👋 I\'m your virtual assistant. I can help with registration, events, tickets, accessibility, surveys, keyboard shortcuts and more. What can I do for you?',
  },
  {
    id: 'mis_boletos',
    // Debe ir ANTES de 'registro' para que "mis boletos" no caiga en el tema general de boletos
    priority: 10,
    keywords: [
      'mis boletos','mi boleto','my tickets','my ticket','ver boleto','ver mis',
      'cancelar inscripcion','cancel registration','cancelar boleto','cancel ticket',
      'historial','historial de entradas','ticket history','baja','darme de baja',
      'eliminar inscripcion','borrar inscripcion','quitar inscripcion',
    ],
    response: (es: boolean) => es
      ? '🎫 En "Mis Boletos" puedes ver el historial completo de tus inscripciones, el código QR de cada boleto y cancelar entradas activas. Accede desde el menú lateral o con Alt+M.'
      : '🎫 In "My Tickets" you can view all your registrations, QR codes, and cancel active entries. Access it from the sidebar or with Alt+M.',
  },
  {
    id: 'registro',
    keywords: [
      // ES
      'registr','inscri','boleto','ticket','entrada','anotar','anotarme','participar',
      'comprar','quiero entrar','quiero ir','como asisto','como me uno','unirme',
      'unirse','suscribirme','inscribirme','apuntarme','apuntarse','como compro',
      'donde compro','obtener entrada','conseguir boleto','necesito un boleto',
      'quiero un ticket','hacer una reserva','reservar','reserva',
      // EN
      'register','sign up','sign-up','join','enroll','buy ticket','get ticket',
      'purchase ticket','how to attend','how do i join','how to register','pass',
    ],
    response: (es: boolean) => es
      ? '📋 Para inscribirte en un evento:\n1. Ve a "Inscripción" en el menú lateral (o pulsa Alt+R).\n2. Completa los 4 pasos: datos personales → tipo de entrada → confirmación → boleto digital.\n3. Recibirás un correo de invitación simulado con tu código QR.\n\nSi ya estás registrado, puedes ver tus boletos en "Mis Boletos" (Alt+M).'
      : '📋 To register for an event:\n1. Go to "Registration" in the sidebar (or press Alt+R).\n2. Complete 4 steps: personal info → ticket type → confirmation → digital ticket.\n3. You\'ll receive a simulated invitation email with your QR code.\n\nAlready registered? Check your tickets under "My Tickets" (Alt+M).',
  },
  {
    id: 'eventos',
    keywords: [
      // ES
      'evento','eventos','calendario','buscar evento','programa','fechas','horario',
      'cuando es','que eventos','proximos eventos','hay eventos','ver eventos',
      'conferencia','taller','concierto','exposicion','actividades','que actividades',
      'que hay','que pasa','que ocurre','que fecha','fecha del evento',
      // EN
      'event','events','calendar','find event','schedule','dates','upcoming',
      'what events','conference','workshop','concert','exhibition','activities',
    ],
    response: (es: boolean) => es
      ? '📅 En el "Buscador y Calendario" (Alt+C) puedes:\n• Buscar eventos por nombre\n• Filtrar por tipo (conferencia, taller, concierto...)\n• Filtrar por ciudad o país\n• Marcar eventos como favoritos ⭐\n• Ver el programa completo de cada evento con sus sesiones'
      : '📅 In the "Event Search & Calendar" (Alt+C) you can:\n• Search events by name\n• Filter by type (conference, workshop, concert...)\n• Filter by city or country\n• Mark events as favorites ⭐\n• View the full program of each event with its sessions',
  },
  {
    id: 'accesibilidad_fisica',
    keywords: [
      // ES
      'rampa','rampas','bucle','magnetico','bano adapt','banos adapt','parking',
      'estacionamiento','silla de rueda','sillas de rueda','movilidad reducida',
      'acceso fisico','recinto','lugar','instalacion','infraestructura','entrada fisica',
      'puerta','discapacidad motriz','discapacidad fisica','movilidad',
      // EN
      'ramp','ramps','hearing loop','adapted toilet','wheelchair','accessible parking',
      'physical access','venue','facility','mobility','disability access','accessible entrance',
    ],
    response: (es: boolean) => es
      ? '♿ Cada evento registra sus recursos de accesibilidad física:\n• Rampas de acceso\n• Bucle magnético para audífonos\n• Baños adaptados para movilidad reducida\n• Estacionamiento accesible\n\nEsta información aparece en la tarjeta de cada evento en el Calendario y puede configurarse en "Lugar y Accesibilidad" (organizador).'
      : '♿ Each event records its physical accessibility resources:\n• Access ramps\n• Hearing loops\n• Adapted restrooms\n• Accessible parking\n\nThis info appears on each event card in the Calendar and can be set in "Venue & Accessibility" (organizer only).',
  },
  {
    id: 'accesibilidad_sistema',
    keywords: [
      // ES
      'accesibilidad','accesible','contraste','alto contraste','fuente','tamano de fuente',
      'dislexia','escala de gris','grises','subrayar','subrayado','enlaces','espaciado',
      'movimiento','animacion','idioma','cambiar idioma','lector de pantalla',
      'navegacion teclado','foco','interfaz accesible','wcag','panel de accesibilidad',
      // EN
      'accessibility','accessible','contrast','high contrast','font size','dyslexia',
      'grayscale','underline','links','spacing','motion','animation','language',
      'screen reader','keyboard navigation','focus','accessible interface',
    ],
    response: (es: boolean) => es
      ? '🎨 El Panel de Accesibilidad (Alt+A o ♿ en la cabecera) te permite:\n• Alto contraste (B&N puro)\n• Tamaño de fuente: Pequeño / Normal / Grande / Extra Grande\n• Espaciado ampliado de texto\n• Reducir movimiento y animaciones\n• Modo dislexia (fuente legible)\n• Escala de grises\n• Subrayar todos los enlaces\n• Cambiar idioma (Español / English)'
      : '🎨 The Accessibility Panel (Alt+A or ♿ in the header) lets you:\n• High contrast mode (pure B&W)\n• Font size: Small / Normal / Large / Extra Large\n• Expanded text spacing\n• Reduce motion and animations\n• Dyslexia mode (readable font)\n• Grayscale\n• Underline all links\n• Change language (Spanish / English)',
  },
  {
    id: 'atajos',
    keywords: [
      // ES
      'atajo','atajos','teclado','tecla','combinacion de teclas','alt','hotkey',
      'teclas rapidas','navegar teclado','acceso rapido','navegacion rapida',
      'como navego','sin raton','sin mouse','accesos directos',
      // EN
      'shortcut','shortcuts','keyboard','key','key combination','hotkey',
      'quick access','keyboard navigation','no mouse',
    ],
    response: (es: boolean) => es
      ? '⌨️ Atajos de teclado disponibles:\n• Alt+A → Panel de accesibilidad\n• Alt+K → Ver todos los atajos\n• Alt+R → Inscripción\n• Alt+C → Calendario\n• Alt+S → Encuesta\n• Alt+M → Mis Boletos\n• Alt+I → Incidencias\n• Alt+P → Panel Admin\n• Esc → Cerrar paneles\n\nHaz clic en el ícono ⌨ en la cabecera para ver el panel completo.'
      : '⌨️ Available keyboard shortcuts:\n• Alt+A → Accessibility panel\n• Alt+K → View all shortcuts\n• Alt+R → Registration\n• Alt+C → Calendar\n• Alt+S → Survey\n• Alt+M → My Tickets\n• Alt+I → Incidents\n• Alt+P → Admin Panel\n• Esc → Close panels\n\nClick the ⌨ icon in the header to see the full panel.',
  },
  {
    id: 'incidencias',
    keywords: [
      // ES
      'incidencia','incidente','emergencia','urgencia','accidente','medico',
      'evacuacion','evacuar','seguridad','peligro','alerta','alertar','reportar',
      'reporte','problema grave','ayuda emergencia','llamar','socorro','auxilio',
      // EN
      'incident','emergency','urgent','accident','medical','evacuation','evacuate',
      'security','danger','alert','report incident','help emergency','emergency report',
    ],
    response: (es: boolean) => es
      ? '⚠️ Para reportar una incidencia:\n1. Ve a "Incidencias" (Alt+I) en el menú del organizador.\n2. Selecciona el tipo: Médica, Seguridad/Evacuación u Operativa.\n3. Indica la ubicación exacta y nivel de gravedad.\n\n🔴 Si seleccionas gravedad "Alta", se activa automáticamente una barra de alerta roja visible en toda la aplicación para todos los usuarios.'
      : '⚠️ To report an incident:\n1. Go to "Incidents" (Alt+I) in the organizer menu.\n2. Select the type: Medical, Security/Evacuation, or Operational.\n3. Provide the exact location and severity level.\n\n🔴 If you select "High" severity, a red alert banner automatically appears across the entire application.',
  },
  {
    id: 'encuesta',
    keywords: [
      // ES
      'encuesta','satisfaccion','opinion','valoracion','puntuar','puntuacion',
      'calificar','calificacion','comentario','resena','que te parecio',
      'como fue el evento','evaluar','evaluacion','feedback','como opino',
      'dejar una resena','dar mi opinion','nota',
      // EN
      'survey','satisfaction','opinion','rating','rate','review','comment',
      'feedback','how was the event','evaluate','evaluation','score','grade',
    ],
    response: (es: boolean) => es
      ? '📊 La "Encuesta de Satisfacción" (Alt+S) te permite evaluar un evento después de asistir:\n• Selecciona el evento que evaluarás\n• Elige tu nivel de satisfacción del 1 (😞) al 5 (😄)\n• Añade comentarios opcionales\n\nLas respuestas se guardan y el organizador puede verlas en el Panel de Administración → pestaña "Encuestas Realizadas".'
      : '📊 The "Satisfaction Survey" (Alt+S) lets you rate an event after attending:\n• Select the event to evaluate\n• Choose your satisfaction from 1 (😞) to 5 (😄)\n• Add optional comments\n\nResponses are saved and organizers can view them in the Admin Panel → "Surveys Submitted" tab.',
  },
  {
    id: 'admin',
    keywords: [
      // ES
      'admin','administracion','administrador','panel admin','panel de control',
      'estadistica','estadisticas','gestion','gestionar','panel organizador',
      'usuarios registrados','ver usuarios','cuantos usuarios','dashboard',
      'panel de administracion','control de eventos',
      // EN
      'admin','administration','administrator','admin panel','control panel',
      'statistics','stats','management','manage','organizer panel',
      'registered users','view users','how many users','dashboard',
    ],
    response: (es: boolean) => es
      ? '🖥️ El Panel de Administración (Alt+P) está disponible solo para el organizador y tiene 3 pestañas:\n• 👥 Usuarios Registrados: tabla con nombre, email, evento, categoría y estado de invitación\n• 📋 Encuestas Realizadas: puntuaciones en estrellas y comentarios de cada respuesta\n• 📊 Estadísticas: tarjetas con totales, promedio de satisfacción y distribución de entradas'
      : '🖥️ The Admin Panel (Alt+P) is available to organizers only and has 3 tabs:\n• 👥 Registered Users: table with name, email, event, category and invitation status\n• 📋 Surveys Submitted: star ratings and comments for each response\n• 📊 Statistics: cards with totals, average satisfaction and ticket distribution',
  },
  {
    id: 'correo',
    keywords: [
      // ES
      'correo','email','mail','invitacion','confirmar asistencia','recibir correo',
      'no recibi correo','no me llego','notificacion','confirmacion','mensaje',
      'me enviaron','buz','bandeja',
      // EN
      'email','mail','invitation','confirm attendance','receive email','notification',
      'confirmation','message','inbox','no email received','did not receive',
    ],
    response: (es: boolean) => es
      ? '📧 Al completar tu inscripción, el sistema muestra automáticamente un correo de invitación simulado con:\n• Tu nombre y email\n• El nombre del evento\n• Tu código QR único\n• Un botón "Confirmar Asistencia"\n\nEn un sistema real, este correo se enviaría a tu dirección de email registrada.'
      : '📧 When you complete your registration, the system automatically shows a simulated invitation email with:\n• Your name and email\n• The event name\n• Your unique QR code\n• A "Confirm Attendance" button\n\nIn a real system, this email would be sent to your registered email address.',
  },
  {
    id: 'agenda',
    keywords: [
      // ES
      'agenda','sesion','sesiones','ponencia','ponente','orador','sala','charla',
      'conferenciante','speaker','ver programa','programa del evento','horario sesion',
      'que sesiones hay','cuantas charlas','interprete','lengua de signos','materiales',
      // EN
      'agenda','session','sessions','talk','speaker','room','lecture','room',
      'view schedule','event schedule','session time','how many sessions',
      'sign language interpreter','materials','support material',
    ],
    response: (es: boolean) => es
      ? '📆 En "Agenda y Sesiones" el organizador puede:\n• Añadir sesiones/ponencias con nombre, ponente, horario y sala\n• Indicar si requiere intérprete de lengua de signos 🤟\n• Añadir enlace a materiales de apoyo (PDF/vídeo)\n\nLos asistentes pueden ver el programa desde el Calendario al hacer clic en "Ver Programa" de cualquier evento.'
      : '📆 In "Agenda & Sessions" organizers can:\n• Add sessions/talks with name, speaker, time and room\n• Mark if a sign language interpreter is required 🤟\n• Add support material links (PDF/video)\n\nAttendees can view the program from the Calendar by clicking "View Schedule" on any event.',
  },
  {
    id: 'checkin',
    keywords: [
      // ES
      'check in','checkin','check-in','asistencia','asistentes','entrada al evento',
      'codigo qr','qr','escanear','escaneo','validar entrada','control de entrada',
      'cuantos entraron','registro de entrada','control asistencia','ingresar',
      // EN
      'check in','checkin','check-in','attendance','entry','qr code','scan','scanning',
      'validate ticket','entry control','how many attended','attendance log','enter event',
    ],
    response: (es: boolean) => es
      ? '✅ El "Control Check-in" (organizador) muestra en tiempo real:\n• Total de asistentes esperados vs. los que ya ingresaron\n• Barra de progreso de asistencia\n• Registro en vivo de cada entrada (nombre, categoría, hora)\n\nPuedes pausar/reanudar la actualización automática y simular escaneos QR desde esta pantalla.'
      : '✅ The "Check-in Control" panel (organizer) shows in real time:\n• Expected vs checked-in attendees\n• Attendance progress bar\n• Live log of each entry (name, category, time)\n\nYou can pause/resume auto-updates and simulate QR scans from this screen.',
  },
  {
    id: 'costos',
    keywords: [
      // ES
      'costo','costos','precio','precios','vip','descuento','descuentos','pago','pagar',
      'gratuito','gratis','es gratis','cuanto cuesta','cuanto vale','valor entrada',
      'estudiante','estudiantes','tercera edad','adulto mayor','jubilado','jubilados',
      'discapacidad','personas con discapacidad','exencion','anticipo','precio anticipado',
      // EN
      'cost','costs','price','prices','vip','discount','discounts','payment','pay',
      'free','is it free','how much','ticket price','student','students',
      'senior','elderly','disability','exemption','early bird','advance price',
    ],
    response: (es: boolean) => es
      ? '💰 En "Costos y Entradas" el organizador configura:\n• Tipo de entrada: Gratuita / De Pago / Mixta\n• Precio General y precio VIP\n• Descuentos automáticos:\n  - Estudiantes: 50% de descuento\n  - Tercera edad: exención total\n  - Personas con discapacidad (PCD): exención total\n• Fecha límite de venta anticipada'
      : '💰 In "Costs & Tickets" the organizer sets:\n• Ticket type: Free / Paid / Mixed\n• General and VIP prices\n• Automatic discounts:\n  - Students: 50% off\n  - Seniors: full exemption\n  - People with Disabilities (PWD): full exemption\n• Early bird deadline',
  },
  {
    id: 'crear_evento',
    keywords: [
      // ES
      'crear evento','nuevo evento','agregar evento','como creo','como se crea',
      'organizador','como organizo','montar evento','crear conferencia',
      'crear taller','crear concierto','publicar evento','dar de alta evento',
      // EN
      'create event','new event','add event','how to create','how do i create',
      'organizer','how to organize','set up event','publish event','host event',
    ],
    response: (es: boolean) => es
      ? '🎉 Para crear un nuevo evento (organizador):\n1. Ve a "Crear Evento" en el menú.\n2. Selecciona el tipo: Conferencia, Concierto, Taller o Exposición.\n3. Ingresa nombre, fechas, capacidad y costo estimado.\n4. Después configura costos/entradas en "Costos y Entradas" y el lugar en "Lugar y Accesibilidad".'
      : '🎉 To create a new event (organizer):\n1. Go to "Create Event" in the menu.\n2. Select the type: Conference, Concert, Workshop or Exhibition.\n3. Enter name, dates, capacity and estimated cost.\n4. Then configure tickets in "Costs & Tickets" and the location in "Venue & Accessibility".',
  },
  {
    id: 'perfil',
    keywords: [
      // ES
      'perfil','mi perfil','editar perfil','actualizar perfil','mis datos',
      'cambiar nombre','cambiar telefono','cambiar zona horaria','cambiar idioma',
      'preferencias','mis preferencias','datos personales','informacion personal',
      // EN
      'profile','my profile','edit profile','update profile','my data',
      'change name','change phone','change timezone','change language',
      'preferences','my preferences','personal info','personal information',
    ],
    response: (es: boolean) => es
      ? '👤 En "Perfil y Preferencias" puedes actualizar:\n• Nombre completo\n• Correo de contacto\n• Teléfono móvil\n• Zona horaria\n• Idioma predeterminado del sistema\n\nEsta sección está disponible solo para el organizador después de iniciar sesión.'
      : '👤 In "Profile & Preferences" you can update:\n• Full name\n• Contact email\n• Mobile phone\n• Time zone\n• Default system language\n\nThis section is only available to organizers after logging in.',
  },
  {
    id: 'login',
    keywords: [
      // ES
      'login','iniciar sesion','acceder','entrar al sistema','ingresar','como entro',
      'contrasena','clave','usuario','credencial','como me logeo','como accedo',
      'no puedo entrar','olvide contrasena','recuperar contrasena','usuario y contrasena',
      // EN
      'login','log in','sign in','access system','how do i log in','how to access',
      'password','username','credentials','forgot password','reset password',
      'cannot log in','account access',
    ],
    response: (es: boolean) => es
      ? '🔐 Para acceder al sistema como organizador:\n• Correo: admin@evento.com\n• Contraseña: admin123\n\nPara acceder como asistente:\n• Correo: asistente@evento.com\n• Contraseña: 1234\n\nTambién puedes registrarte como asistente público desde la sección de Inscripción sin necesidad de login.'
      : '🔐 To access as organizer:\n• Email: admin@evento.com\n• Password: admin123\n\nTo access as attendee:\n• Email: asistente@evento.com\n• Password: 1234\n\nYou can also register as a public attendee from the Registration section without logging in.',
  },
  {
    id: 'bot',
    keywords: [
      // ES
      'chatbot','asistente','asistente virtual','bot','que puedes hacer','para que sirves',
      'que sabes','cuales son tus funciones','ayuda','como funciona esto',
      'que puedo preguntarte','opciones','menu','que temas','ayudame',
      // EN
      'chatbot','assistant','virtual assistant','bot','what can you do',
      'what do you know','your functions','help','how does this work',
      'what can i ask','options','topics','help me',
    ],
    response: (es: boolean) => es
      ? '🤖 Soy el asistente virtual del Sistema de Eventos. Puedo responder preguntas sobre:\n• Inscripción y boletos\n• Eventos y calendario\n• Accesibilidad física y del sistema\n• Atajos de teclado\n• Incidencias y emergencias\n• Encuestas de satisfacción\n• Panel de administración\n• Costos y entradas\n• Agenda y sesiones\n• Check-in\n• Login y perfiles\n\n¡Pregúntame lo que necesites!'
      : '🤖 I\'m the virtual assistant for the Event Management System. I can answer questions about:\n• Registration and tickets\n• Events and calendar\n• Physical and system accessibility\n• Keyboard shortcuts\n• Incidents and emergencies\n• Satisfaction surveys\n• Admin panel\n• Costs and tickets\n• Agenda and sessions\n• Check-in\n• Login and profiles\n\nAsk me anything!',
  },
  {
    id: 'despedida',
    keywords: [
      'gracias','muchas gracias','thank','thanks','thank you','de nada','con gusto',
      'hasta luego','bye','adios','chao','chau','nos vemos','hasta pronto',
      'fue todo','eso es todo','listo','ok gracias','perfecto gracias',
    ],
    response: (es: boolean) => es
      ? '😊 ¡Con gusto! Si necesitas algo más, no dudes en preguntar. ¡Que disfrutes el evento!'
      : '😊 You\'re welcome! Feel free to ask anything else. Enjoy the event!',
  },
];

function getBotResponse(msg: string, lang: 'es' | 'en'): string {
  const n = normalizeText(msg);
  const es = lang === 'es';

  // ── 1. Detectar saludos al inicio del mensaje ──────────────────
  const greetingCat = BOT_CATEGORIES.find(c => c.greetingOnly);
  if (greetingCat) {
    const startsWithGreeting = greetingCat.keywords.some(kw => n.startsWith(normalizeText(kw)));
    if (startsWithGreeting) return greetingCat.response(es);
  }

  // ── 2. Tokenizar el mensaje en palabras y bigramas ─────────────
  // Los bigramas permiten detectar frases como "iniciar sesion", "check in", "mis boletos"
  const words = n.split(/\s+/).filter(w => w.length > 1);
  const bigrams = words.slice(0, -1).map((w, i) => `${ w } ${ words[i + 1]}`);
  const tokens = [...words, ...bigrams];

  // ── 3. Puntuar cada categoría ──────────────────────────────────
  const scored = BOT_CATEGORIES
    .filter(c => !c.greetingOnly)
    .map(cat => {
      const normKws = cat.keywords.map(normalizeText);
      let score = 0;
      for (const token of tokens) {
        for (const kw of normKws) {
          // Coincidencia exacta de token con keyword
          if (token === kw) { score += 3; break; }
          // Token contiene la keyword (ej: "registrarme" contiene "registr")
          if (token.includes(kw) && kw.length >= 4) { score += 2; break; }
          // Keyword contiene el token (ej: "inscripcion" contiene "inscri")
          if (kw.includes(token) && token.length >= 4) { score += 1; break; }
        }
      }
      // Prioridad extra para categorías con alta confianza (ej: mis_boletos)
      const priority = (cat as { priority?: number }).priority ?? 0;
      return { cat, score: score + priority };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // ── 4. Devolver la mejor categoría si hay una ganadora ─────────
  if (scored.length > 0) {
    return scored[0].cat.response(es);
  }

  // ── 5. Fallback inteligente ────────────────────────────────────
  const preview = msg.length > 50 ? msg.slice(0, 50) + '…' : msg;
  return es
    ? `🤔 Hmm, no encontré información exacta sobre "${preview}".\n\nPuedes intentar preguntarme sobre: \n• 📋 Inscripción y boletos\n• 📅 Eventos y calendario\n• ♿ Accesibilidad\n• ⌨️ Atajos de teclado\n• ⚠️ Incidencias\n• 💰 Costos y entradas\n• 🔐 Login\n• 🖥️ Panel admin\n\n¿Quizás quisiste decir algo de esto ? `
    : `🤔 Hmm, I couldn't find exact information about "${preview}".\n\nTry asking me about:\n• 📋 Registration & tickets\n• 📅 Events & calendar\n• ♿ Accessibility\n• ⌨️ Keyboard shortcuts\n• ⚠️ Incidents\n• 💰 Costs & tickets\n• 🔐 Login\n• 🖥️ Admin panel\n\nDid you mean something from this list?`;
}



export default function ChatbotPage() {
  const { t, currentLang, accReduceMotion, setAccReduceMotion, chatMessages, setChatMessages, lastBotMessage, setLastBotMessage, chatMessagesEndRef, showToast, setScreenReaderText } = useApp();
  const [chatInputText, setChatInputText] = useState('');
  const [openTranscript, setOpenTranscript] = useState<string | null>(null);

  const sendChatMessage = (overrideText?: string) => {
    const userMsg = (overrideText ?? chatInputText).trim();
    if (!userMsg) return;
    setChatMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setChatInputText('');

    setTimeout(() => {
      const botResponse = getBotResponse(userMsg, currentLang);
      setChatMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      setLastBotMessage(botResponse);
      setScreenReaderText((currentLang === 'es' ? 'Respuesta del asistente: ' : 'Assistant response: ') + botResponse);
    }, 400);
  };

  const handleChatKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendChatMessage();
  };

  const speakBotMessage = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lastBotMessage);
      utterance.lang = currentLang === 'es' ? 'es-ES' : 'en-US';
      window.speechSynthesis.speak(utterance);
      setScreenReaderText(currentLang === 'es' ? 'Reproduciendo audio de la respuesta.' : 'Playing voice synthesis readout.');
    } else {
      showToast(currentLang === 'es' ? 'API de voz no soportada en este navegador.' : 'Web Speech API not supported on this browser.', true);
    }
  };

  const toggleTranscript = (videoKey: string) => {
    const next = openTranscript === videoKey ? null : videoKey;
    setOpenTranscript(next);
    if (next) {
      setScreenReaderText(
        currentLang === 'es'
          ? `Transcripción del video ${videoKey === 'plagios' ? 'sobre plagio' : 'de tutorías'} abierta.`
          : `Transcript for ${videoKey} video opened.`
      );
    }
  };

  const videos = [
    {
      key: 'plagios',
      titleEs: 'Video 1: Integridad Académica y Plagio',
      titleEn: 'Video 1: Academic Integrity and Plagiarism',
      descEs: 'Explicación sobre qué es el plagio, sus tipos, consecuencias y cómo evitarlo en el contexto de eventos académicos.',
      descEn: 'Explanation of what plagiarism is, its types, consequences, and how to avoid it in academic event contexts.',
      subtitleSrc: '#transcript-plagios',
    },
    {
      key: 'tutorias',
      titleEs: 'Video 2: Sistema de Tutorías del Evento',
      titleEn: 'Video 2: Event Tutoring System',
      descEs: 'Guía paso a paso sobre cómo acceder y solicitar sesiones de tutoría personalizada a través del sistema.',
      descEn: 'Step-by-step guide on how to access and request personalized tutoring sessions through the system.',
      subtitleSrc: '#transcript-tutorias',
    },
  ];

  return (
    <div className="app-section active">
      <h2 className="section-title">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span>{t('chat_title')}</span>
      </h2>

      <fieldset>
        <legend>{t('chat_config')}</legend>
        <div className="switch-container">
          <label htmlFor="chat-animation-checkbox" className="switch-label">{t('chat_motion')}</label>
          <input type="checkbox" id="chat-animation-checkbox" className="switch-checkbox" checked={accReduceMotion} onChange={(e) => setAccReduceMotion(e.target.checked)} />
          <div className="switch-control" onMouseUp={() => setAccReduceMotion(!accReduceMotion)}></div>
        </div>
      </fieldset>

      {/* =========================================================
          SECCIÓN DE RECURSOS MULTIMEDIA ACCESIBLES
          ========================================================= */}
      <section aria-labelledby="multimedia-section-title" style={{ marginBottom: '2rem' }}>
        <h3
          id="multimedia-section-title"
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          {currentLang === 'es' ? 'Recursos Multimedia Educativos' : 'Educational Multimedia Resources'}
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {currentLang === 'es'
            ? 'Todos los videos cuentan con subtítulos, audiodescripción y transcripción textual completa para una experiencia inclusiva.'
            : 'All videos include subtitles, audio description, and full text transcripts for an inclusive experience.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {videos.map((vid) => {
            const title = currentLang === 'es' ? vid.titleEs : vid.titleEn;
            const desc = currentLang === 'es' ? vid.descEs : vid.descEn;
            const transcript = VIDEO_TRANSCRIPTS[currentLang][vid.key];
            const isOpen = openTranscript === vid.key;
            const transcriptId = `transcript-${vid.key}`;

            return (
              <div
                key={vid.key}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-card)',
                }}
              >
                {/* Video header */}
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{desc}</p>
                </div>

                {/* Video player — WCAG 1.2.2: subtítulos via <track>, 1.2.3: audiodescripción */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  {vid.key === 'tutorias' ? (
                    /* Video 2 — Embed real de YouTube (WCAG 1.2.2/1.2.3: subtítulos activables en YouTube) */
                    <div
                      style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}
                      aria-describedby={transcriptId}
                    >
                      <iframe
                        src="https://www.youtube.com/embed/rYehPO_MwMI?rel=0&cc_load_policy=1&hl=es"
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                        aria-label={title}
                      />
                    </div>
                  ) : (
                    /* Video 1 — Elemento HTML5 con tracks de subtítulos y audiodescripción */
                    <video
                      controls
                      width="100%"
                      style={{ borderRadius: '8px', maxHeight: '260px', backgroundColor: '#000' }}
                      aria-label={title}
                      aria-describedby={transcriptId}
                    >
                      <source src={`/videos/${vid.key}.mp4`} type="video/mp4" />
                      {/* WCAG 1.2.2 — Subtítulos grabados */}
                      <track
                        kind="subtitles"
                        srcLang={currentLang}
                        label={currentLang === 'es' ? 'Español' : 'English'}
                        src={`/subtitles/${vid.key}_${currentLang}.vtt`}
                        default
                      />
                      {/* WCAG 1.2.3 — Audiodescripción */}
                      <track
                        kind="descriptions"
                        srcLang={currentLang}
                        label={currentLang === 'es' ? 'Audiodescripción en Español' : 'Audio Description English'}
                        src={`/subtitles/${vid.key}_${currentLang}_desc.vtt`}
                      />
                      <p>
                        {currentLang === 'es'
                          ? 'Su navegador no soporta reproducción de video HTML5. '
                          : 'Your browser does not support HTML5 video. '}
                        <a href={`/videos/${vid.key}.mp4`}>
                          {currentLang === 'es' ? 'Descargar el video' : 'Download the video'}
                        </a>
                      </p>
                    </video>
                  )}


                  {/* Badges de accesibilidad del video */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }} aria-label={currentLang === 'es' ? 'Características de accesibilidad del video' : 'Video accessibility features'}>
                    <span className="badge" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-color)', fontSize: '0.75rem' }}>
                      ✓ {currentLang === 'es' ? 'Subtítulos' : 'Subtitles'}
                    </span>
                    <span className="badge" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-color)', fontSize: '0.75rem' }}>
                      ✓ {currentLang === 'es' ? 'Audiodescripción' : 'Audio Description'}
                    </span>
                    <span className="badge" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', border: '1px solid var(--success-color)', fontSize: '0.75rem' }}>
                      ✓ {currentLang === 'es' ? 'Transcripción' : 'Transcript'}
                    </span>
                  </div>

                  {/* Transcripción textual expandible */}
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      id={`${transcriptId}-toggle`}
                      aria-expanded={isOpen}
                      aria-controls={transcriptId}
                      onMouseUp={() => toggleTranscript(vid.key)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', minWidth: 'auto', minHeight: '40px' }}
                    >
                      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                      {isOpen
                        ? (currentLang === 'es' ? ' Ocultar transcripción' : ' Hide transcript')
                        : (currentLang === 'es' ? ' Ver transcripción textual completa' : ' View full text transcript')}
                    </button>

                    <div
                      id={transcriptId}
                      role="region"
                      aria-label={currentLang === 'es' ? `Transcripción: ${title}` : `Transcript: ${title}`}
                      style={{
                        display: isOpen ? 'block' : 'none',
                        marginTop: '0.75rem',
                        padding: '1rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        lineHeight: '1.8',
                        whiteSpace: 'pre-line',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {currentLang === 'es' ? '📄 Transcripción completa' : '📄 Full Transcript'}
                      </p>
                      {transcript}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}

      <div className="chat-box">
        <div className="chat-messages" role="log" aria-live="polite">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatMessagesEndRef}></div>
        </div>

        <div className="chat-chips" aria-label="Preguntas rápidas">
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', width: '100%', marginBottom: '0.25rem' }}>{t('chat_faq')}</span>
          <button className="chip-btn" onMouseUp={() => sendChatMessage(currentLang === 'es' ? '¿Cómo me registro en un evento?' : 'How do I register for an event?')}>{t('faq_register')}</button>
          <button className="chip-btn" onMouseUp={() => sendChatMessage(currentLang === 'es' ? '¿Qué accesos físicos hay disponibles en el recinto?' : 'What physical access resources exist?')}>{t('faq_venue')}</button>
          <button className="chip-btn" onMouseUp={() => sendChatMessage(currentLang === 'es' ? '¿Cómo reporto una emergencia operativa?' : 'How do I report an emergency?')}>{t('faq_incident')}</button>
          <button className="chip-btn" onMouseUp={() => sendChatMessage(currentLang === 'es' ? '¿Cuáles son los atajos de teclado?' : 'What are the keyboard shortcuts?')}>{currentLang === 'es' ? '⌨️ Atajos' : '⌨️ Shortcuts'}</button>
          <button className="chip-btn" onMouseUp={() => sendChatMessage(currentLang === 'es' ? '¿Cómo funciona el panel de accesibilidad?' : 'How does the accessibility panel work?')}>{currentLang === 'es' ? '♿ Accesibilidad' : '♿ Accessibility'}</button>
          <button className="chip-btn" onMouseUp={() => sendChatMessage(currentLang === 'es' ? '¿Cómo envío una encuesta de satisfacción?' : 'How do I submit a satisfaction survey?')}>{currentLang === 'es' ? '📊 Encuesta' : '📊 Survey'}</button>
          <button className="chip-btn" onMouseUp={() => sendChatMessage(currentLang === 'es' ? '¿Qué hay en el panel de administración?' : 'What is in the admin panel?')}>{currentLang === 'es' ? '🖥️ Panel Admin' : '🖥️ Admin Panel'}</button>
          <button className="chip-btn" onMouseUp={() => sendChatMessage(currentLang === 'es' ? '¿Cómo inicio sesión?' : 'How do I log in?')}>{currentLang === 'es' ? '🔐 Login' : '🔐 Login'}</button>
          <button className="chip-btn" onMouseUp={() => sendChatMessage(currentLang === 'es' ? '¿Qué puedes hacer?' : 'What can you do?')}>{currentLang === 'es' ? '🤖 ¿Qué puedes hacer?' : '🤖 What can you do?'}</button>
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder={currentLang === 'es' ? 'Escribe aquí...' : 'Type here...'}
            value={chatInputText}
            onChange={(e) => setChatInputText(e.target.value)}
            onKeyDown={handleChatKey}
            aria-label={currentLang === 'es' ? 'Mensaje al asistente virtual' : 'Message to virtual assistant'}
          />
          <button className="btn btn-primary" style={{ minWidth: '80px' }} onMouseUp={() => sendChatMessage()}>{t('chat_send')}</button>
          <button className="btn btn-secondary" style={{ minWidth: '80px' }} onMouseUp={speakBotMessage}>{t('chat_voice')}</button>
        </div>
      </div>
    </div>
  );
}
