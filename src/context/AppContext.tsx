import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';

// ======================= INTERFACES =======================
export interface EventItem {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  capacity: number;
  cost: number;
  venueName: string;
  city: string;
  country: string;
  address: string;
  hasRamps: boolean;
  hasLoop: boolean;
  hasToilets: boolean;
  hasParking: boolean;
  ticketType: string;
  priceGen: number;
  priceVip: number;
  discStudent: boolean;
  discSenior: boolean;
  discDisabled: boolean;
}

export interface SessionItem {
  name: string;
  time: string;
  speaker: string;
  room: string;
  materials: string;
  interpreter: boolean;
}

export interface CheckInLogItem {
  id: number;
  time: string;
  name: string;
  type: string;
}

export interface IncidentItem {
  id: number;
  eventName: string;
  type: string;
  location: string;
  gravity: string;
  description: string;
}

export interface ChatMessage {
  text: string;
  sender: 'bot' | 'user';
}

/** Inscripción de un asistente a un evento */
export interface RegistrationItem {
  id: number;
  userId: string;        // email del usuario logueado, o 'guest'
  userName: string;
  userEmail: string;
  eventId: string;
  eventName: string;
  category: string;
  discount: string;
  timestamp: string;     // ISO string
  status: 'active' | 'cancelled';
  qrId: string;          // ID único para el QR
  invitationSent?: boolean; // si se envió correo de invitación
}

/** Respuesta de encuesta de satisfacción */
export interface SurveyResponse {
  id: number;
  eventId: string;
  eventName: string;
  satisfaction: number;  // 1-5
  comments: string;
  timestamp: string;     // ISO string
  respondentName?: string;
}

/** Log de invitaciones enviadas */
export interface InvitationLog {
  id: number;
  toName: string;
  toEmail: string;
  eventName: string;
  qrId: string;
  sentAt: string;
}

// ======================= localStorage KEYS =======================
const LS_DATA = {
  SESSION:       'ua_session',
  EVENTS:        'ua_events',
  AGENDA:        'ua_agenda',
  INCIDENTS:     'ua_incidents',
  REGISTRATIONS: 'ua_registrations',
  CHECKIN_LOG:   'ua_checkin_log',
  ATTENDANCE:    'ua_attendance',
  SURVEYS:       'ua_surveys',
  INVITATIONS:   'ua_invitations',
} as const;

/** Carga segura desde localStorage con fallback */
function loadLS<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// ======================= DATOS INICIALES POR DEFECTO =======================
const DEFAULT_EVENTS: EventItem[] = [
  {
    id: "ev-1", name: "Congreso Internacional de Accesibilidad Web 2026", type: "conferencia",
    startDate: "2026-10-12", endDate: "2026-10-14", capacity: 350, cost: 25000,
    venueName: "Centro Cultural Metropolitano", city: "Quito", country: "Ecuador",
    address: "García Moreno y Espejo", hasRamps: true, hasLoop: true, hasToilets: true, hasParking: true,
    ticketType: "mixta", priceGen: 15, priceVip: 45, discStudent: true, discSenior: true, discDisabled: true
  },
  {
    id: "ev-2", name: "Festival de Música Inclusiva 'Ritmos para Todos'", type: "concierto",
    startDate: "2026-11-20", endDate: "2026-11-20", capacity: 1200, cost: 45000,
    venueName: "Parque Bicentenario (Explanada)", city: "Quito", country: "Ecuador",
    address: "Av. Amazonas", hasRamps: true, hasLoop: false, hasToilets: true, hasParking: true,
    ticketType: "gratuita", priceGen: 0, priceVip: 0, discStudent: false, discSenior: false, discDisabled: false
  },
  {
    id: "ev-3", name: "Taller Práctico de Diseño Centrado en el Usuario", type: "taller",
    startDate: "2026-09-05", endDate: "2026-09-06", capacity: 50, cost: 3500,
    venueName: "Aulas de Posgrado - Universidad U&A", city: "Guayaquil", country: "Ecuador",
    address: "Av. Carlos Julio Arosemena", hasRamps: true, hasLoop: false, hasToilets: false, hasParking: false,
    ticketType: "pago", priceGen: 50, priceVip: 90, discStudent: true, discSenior: true, discDisabled: true
  }
];

const DEFAULT_AGENDA: Record<string, SessionItem[]> = {
  "ev-1": [
    { name: "Apertura y Registro de Asistentes", time: "09:00", speaker: "Dr. Carlos Mendoza", room: "Sala Magna (Nivel 1)", materials: "", interpreter: true },
    { name: "Herramientas digitales para la gestión de eventos", time: "10:30", speaker: "Ing. Laura Quispe", room: "Sala Magna", materials: "", interpreter: true },
    { name: "Mesa Redonda: Innovación en eventos corporativos", time: "12:00", speaker: "Mg. Andrea Torres", room: "Sala B", materials: "", interpreter: false }
  ],
  "ev-2": [
    { name: "Apertura de Puertas e Inducción de Seguridad", time: "16:00", speaker: "Logística G7", room: "Escenario Principal", materials: "", interpreter: false },
    { name: "Presentación del Coro Inclusivo Voces de Libertad", time: "17:30", speaker: "Director Coral", room: "Escenario Principal", materials: "", interpreter: true }
  ],
  "ev-3": [
    { name: "Introducción a la gestión de proyectos de eventos", time: "09:30", speaker: "Lic. Roberto Silva", room: "Laboratorio L-402", materials: "", interpreter: false }
  ]
};

const DEFAULT_CHECKIN: CheckInLogItem[] = [
  { id: 1, time: "10:05", name: "Sofia Reyes", type: "PCD - General" },
  { id: 2, time: "10:03", name: "Carlos Andrade", type: "General" },
  { id: 3, time: "10:00", name: "Miguel Pérez", type: "VIP" }
];

// ======================= TRANSLATIONS =======================
export const translations: Record<string, Record<string, string>> = {
  es: {
    skip_to_content: "Saltar al contenido principal",
    dismiss: "Cerrar",
    app_title: "Sistema Inteligente de Gestión de Eventos",
    group_signature: "Plataforma de Gestión de Eventos",
    profile_guest: "Invitado",
    profile_logged: "Organizador: ",
    acc_title: "Panel de Accesibilidad",
    acc_contrast: "Modo Alto Contraste",
    acc_contrast_desc: "B&N Puro con bordes gruesos",
    acc_spacing_desc: "Expandir letras, palabras y líneas",
    acc_font_size: "Tamaño de la Fuente",
    acc_font_sm: "P",
    acc_font_md: "N",
    acc_font_lg: "G",
    acc_font_xl: "XG",
    acc_spacing: "Espaciado de Texto Ampliado",
    acc_lang: "Idioma del Sistema",
    acc_reader_title: "Lector de Pantalla",
    acc_reduce_motion: "Reducir Movimiento",
    acc_reduce_motion_desc: "Desactiva animaciones y transiciones",
    acc_dyslexia: "Modo Dislexia",
    acc_dyslexia_desc: "Fuente legible para dislexia",
    acc_grayscale: "Escala de Grises",
    acc_grayscale_desc: "Elimina todos los colores del sistema",
    acc_underline: "Subrayar Todos los Enlaces",
    acc_underline_desc: "Hace visibles todos los enlaces",
    nav_title_org: "Sesión Organizador",
    nav_title_pub: "Público General",
    nav_title_att: "Área del Asistente",
    nav_login: "Inicio de Sesión",
    nav_profile: "Perfil y Preferencias",
    nav_create_event: "Crear Evento",
    nav_costs: "Costos y Entradas",
    nav_venue: "Lugar y Accesibilidad",
    nav_agenda: "Agenda y Sesiones",
    nav_checkin: "Control Check-in",
    nav_incidents: "Incidencias",
    nav_register: "Inscripción",
    nav_calendar: "Buscador y Agenda",
    nav_chatbot: "Asistente Virtual",
    nav_survey: "Encuesta Satisfacción",
    nav_my_tickets: "Mis Boletos",
    btn_save: "Guardar Cambios",
    btn_next: "Siguiente",
    btn_prev: "Anterior",
    btn_edit: "Editar datos",
    btn_cancel: "Cancelar",
    btn_confirm: "Confirmar",
    login_title: "Inicio de Sesión del Organizador",
    login_legend: "Credenciales de Acceso",
    login_instructions: "Ingrese sus datos de organizador. Como demostración, puede usar cualquier dirección de correo electrónico y contraseña.",
    login_email: "Correo Electrónico o Usuario",
    login_pass: "Contraseña",
    login_btn: "Acceder al Sistema",
    login_success: "¡Acceso exitoso! Bienvenido al sistema.",
    profile_title: "Configuración de Perfil y Preferencias",
    profile_legend: "Datos del Organizador",
    profile_name: "Nombre Completo",
    profile_email: "Correo de Contacto",
    profile_tel: "Teléfono Móvil",
    profile_tz: "Zona Horaria",
    profile_lang: "Idioma Predeterminado",
    profile_saved: "Perfil actualizado correctamente.",
    event_title: "Creación de Nuevo Evento",
    event_legend: "Detalles Generales del Evento",
    event_type: "Tipo de Evento",
    opt_conference: "Conferencia / Seminario",
    opt_concert: "Concierto / Evento Cultural",
    opt_workshop: "Taller Tecnológico",
    opt_exhibition: "Exposición Inclusiva",
    event_name: "Nombre del Evento",
    event_start: "Fecha y Hora de Inicio",
    event_end: "Fecha y Hora de Fin",
    event_capacity: "Capacidad Máxima",
    event_cost: "Costo Estimado ($)",
    event_btn: "Guardar y Configurar Entradas",
    event_success: "¡Evento creado! Configure sus entradas.",
    costs_title: "Configuración de Costos y Venta de Entradas",
    costs_legend: "Modelo de Negocio y Descuentos",
    costs_select_event: "Seleccionar Evento",
    costs_ticket_type: "Tipo de Entrada",
    costs_free: "Gratuita",
    costs_paid: "De Pago",
    costs_mixed: "Mixta (Gratuita / De Pago)",
    costs_price_gen: "Precio Entrada General ($)",
    costs_price_vip: "Precio Entrada VIP ($)",
    costs_discounts: "Descuentos y Exenciones Disponibles",
    costs_disc_student: "Estudiantes (50% de descuento)",
    costs_disc_senior: "Tercera Edad (100% de exención o 70% desc.)",
    costs_disc_disabled: "Personas con Discapacidad (100% de exención)",
    costs_early_bird: "Fecha Límite de Venta Anticipada",
    costs_btn: "Guardar Configuración de Boletos",
    venue_title: "Gestión de Lugar, Logística y Accesibilidad Física",
    venue_legend: "Detalles de la Ubicación e IA de Accesibilidad",
    venue_name: "Nombre del Recinto",
    venue_country: "País",
    venue_city: "Ciudad",
    venue_address: "Dirección Exacta",
    venue_resources: "Recursos de Accesibilidad Física en el Lugar",
    venue_ramps: "Rampas de Acceso",
    venue_loop: "Bucle Magnético",
    venue_toilets: "Baños Adaptados",
    venue_parking: "Estacionamiento Accesible",
    venue_ai_btn: "Sugerir Aforo Accesible por IA",
    venue_ai_desc: "Calcula automáticamente la capacidad máxima recomendada de personas con discapacidad en base a los recursos físicos del recinto.",
    ai_result_title: "Recomendación IA del Aforo Accesible",
    agenda_title: "Planificación de Agenda y Sesiones del Evento",
    agenda_legend: "Añadir Sesión al Cronograma",
    agenda_session_name: "Nombre de la Sesión / Ponencia",
    agenda_speaker: "Ponente / Expositor",
    agenda_time: "Horario de la Sesión",
    agenda_room: "Sala o Espacio Asignado",
    agenda_materials: "Enlace a Materiales de Apoyo (PDF/Vídeo)",
    agenda_interpreter: "Requiere Intérprete de Lengua de Signos",
    agenda_btn: "Añadir Sesión a la Agenda",
    agenda_list_title: "Cronograma del Evento",
    reg_title: "Registro e Inscripción de Asistentes",
    reg_step1: "1. Datos",
    reg_step2: "2. Entrada",
    reg_step3: "3. Confirmar",
    reg_step4: "4. Boleto",
    reg_step1_legend: "Paso 1: Información Personal",
    reg_step2_legend: "Paso 2: Categoría de Entrada y Accesibilidad",
    reg_step3_legend: "Paso 3: Revisión de la Inscripción",
    reg_step4_legend: "Paso 4: Su Boleto de Acceso",
    reg_name: "Nombre Completo",
    reg_email: "Correo Electrónico",
    reg_tel: "Teléfono de Contacto",
    reg_ticket_cat: "Categoría de Entrada",
    reg_apply_disc: "Aplicar Descuento de Accesibilidad",
    opt_general: "Entrada General",
    opt_vip: "Entrada VIP",
    reg_no_disc: "Ninguno",
    reg_student: "Estudiante (50% desc.)",
    reg_senior: "Adulto Mayor / Tercera Edad",
    reg_disabled: "Persona con Discapacidad (PCD)",
    reg_confirm_desc: "Por favor, valide que sus datos sean correctos antes de confirmar el registro. Si nota un error, use el botón de editar.",
    reg_confirm_btn: "Confirmar e Inscribirse",
    reg_success_title: "¡Inscripción Exitosa!",
    reg_ticket_desc: "Presente este código en la entrada del evento.",
    reg_ticket_badge: "ENTRADA DIGITAL",
    btn_restart_reg: "Inscribir Nuevo Asistente",
    cal_title: "Buscador y Calendario de Eventos",
    cal_filters: "Filtros de Búsqueda",
    cal_search: "Buscar por nombre",
    cal_filter_type: "Filtrar por Tipo",
    cal_filter_loc: "Filtrar por Ubicación",
    cal_all: "Todos los tipos",
    cal_no_events: "No se encontraron eventos con los filtros seleccionados.",
    cal_view_program: "Ver Programa",
    cal_program_title: "Programa del Evento",
    cal_no_sessions: "Aún no hay sesiones en la agenda de este evento.",
    cal_fav_toggle: "Marcar / Desmarcar favorito",
    cal_fav_filter: "Solo Favoritos",
    cal_fav_none: "No tienes eventos marcados como favoritos.",
    chat_title: "Asistente Virtual Inteligente",
    chat_config: "Preferencias del Chat",
    chat_motion: "Desactivar animaciones y parpadeos",
    chat_welcome: "¡Hola! Soy tu asistente de accesibilidad. ¿Cómo te puedo ayudar hoy con el sistema de eventos?",
    chat_faq: "Preguntas Frecuentes:",
    faq_register: "¿Cómo me registro?",
    faq_venue: "¿Qué accesos físicos hay?",
    faq_incident: "¿Cómo reporto una emergencia?",
    chat_send: "Enviar",
    chat_voice: "Escuchar",
    survey_title: "Encuesta de Satisfacción Post-Evento",
    survey_legend: "Tu Opinión nos Ayuda a Mejorar",
    survey_select: "Seleccionar Evento Evaluado",
    survey_likert: "Nivel de satisfacción general con la accesibilidad:",
    survey_likert_1: "Muy Insatisfecho",
    survey_likert_2: "Insatisfecho",
    survey_likert_3: "Neutral",
    survey_likert_4: "Satisfecho",
    survey_likert_5: "Muy Satisfecho",
    survey_comments: "Comentarios o sugerencias de mejora",
    survey_btn: "Enviar Encuesta de Satisfacción",
    check_title: "Control de Asistencia en Tiempo Real",
    check_expected: "Asistentes Esperados",
    check_actual: "Asistentes en Sala",
    check_progress: "Porcentaje de Asistencia Registrada",
    check_pause: "Pausar actualización automática",
    check_resume: "Reanudar actualización automática",
    check_scan: "Escanear Código QR (Simular)",
    check_log_title: "Registro de Check-in en Vivo",
    inc_title: "Reporte de Incidencias Operativas",
    inc_legend: "Detalle de la Alerta / Incidente",
    inc_type: "Tipo de Incidencia",
    inc_med: "Emergencia Médica",
    inc_sec: "Seguridad / Evacuación",
    inc_op: "Operativa / Logística",
    inc_loc: "Ubicación Exacta en el Recinto",
    inc_gravity: "Nivel de Gravedad",
    inc_low: "Bajo (Logístico interno)",
    inc_med_g: "Medio (Atención necesaria)",
    inc_high: "Alto (Genera Alerta General)",
    inc_desc: "Descripción de la Incidencia",
    inc_btn: "Registrar Incidencia y Notificar",
    logout_btn: "Cerrar Sesión",
    // Mis Boletos (asistente)
    my_tickets_title: "Mis Boletos e Inscripciones",
    my_tickets_legend: "Historial de Inscripciones",
    my_tickets_empty: "Aún no tienes inscripciones registradas. Ve a la sección de Inscripción para registrarte en un evento.",
    my_tickets_cancel: "Cancelar Inscripción",
    my_tickets_cancel_confirm: "¿Está seguro que desea cancelar su inscripción a este evento? Esta acción se puede revertir contactando al organizador.",
    my_tickets_cancelled: "Cancelada",
    my_tickets_active: "Activa",
    my_tickets_go_reg: "Ir a Inscribirme",
    // Panel Admin
    nav_admin: "Panel de Administración",
    admin_title: "Panel de Administración",
    admin_tab_users: "Usuarios Registrados",
    admin_tab_surveys: "Encuestas Realizadas",
    admin_tab_stats: "Estadísticas",
    admin_users_empty: "Aún no hay inscripciones registradas.",
    admin_surveys_empty: "Aún no hay encuestas respondidas.",
    admin_stat_total_reg: "Total Inscripciones Activas",
    admin_stat_avg_sat: "Satisfacción Promedio",
    admin_stat_general: "Entradas Generales",
    admin_stat_vip: "Entradas VIP",
    admin_stat_incidents: "Incidencias Reportadas",
    admin_stat_surveys_count: "Encuestas Respondidas",
    admin_inv_sent: "Invitación Enviada",
    admin_inv_pending: "Sin invitación",
    // Atajos de teclado
    shortcuts_title: "Atajos de Teclado",
    shortcuts_btn: "Ver Atajos",
    shortcut_acc: "Abrir accesibilidad",
    shortcut_home: "Ir a inicio",
    shortcut_reg: "Ir a Inscripción",
    shortcut_cal: "Ir a Calendario",
    shortcut_survey: "Ir a Encuesta",
    shortcut_tickets: "Ir a Mis Boletos",
    shortcut_incidents: "Ir a Incidencias",
    shortcut_admin: "Ir a Panel Admin",
    shortcut_esc: "Cerrar paneles",
    // Email de invitación
    inv_email_title: "Correo de Invitación Enviado",
    inv_email_subject: "¡Tu inscripción está confirmada!",
    inv_email_greeting: "¡Hola",
    inv_email_body: "Tu inscripción al evento ha sido registrada exitosamente. Presenta el siguiente código QR a tu llegada.",
    inv_email_accept: "Confirmar Asistencia",
    inv_email_accept_done: "¡Asistencia confirmada! Nos vemos en el evento.",
    inv_email_close: "Cerrar",
    inv_email_from: "Sistema de Eventos U&A",
    inv_email_sent_toast: "Correo de invitación enviado a",
  },

  en: {
    skip_to_content: "Skip to main content",
    dismiss: "Close",
    app_title: "Smart Event Management System",
    group_signature: "Event Management Platform",
    profile_guest: "Guest",
    profile_logged: "Organizer: ",
    acc_title: "Accessibility Panel",
    acc_contrast: "High Contrast Mode",
    acc_contrast_desc: "B&W Pure with thick borders",
    acc_spacing_desc: "Expand letters, words and line heights",
    acc_font_size: "Font Size",
    acc_font_sm: "S",
    acc_font_md: "N",
    acc_font_lg: "L",
    acc_font_xl: "XL",
    acc_spacing: "Expanded Text Spacing",
    acc_lang: "System Language",
    acc_reader_title: "Screen Reader Output",
    acc_reduce_motion: "Reduce Motion",
    acc_reduce_motion_desc: "Disables animations and transitions",
    acc_dyslexia: "Dyslexia Mode",
    acc_dyslexia_desc: "Readable font for dyslexia",
    acc_grayscale: "Grayscale Mode",
    acc_grayscale_desc: "Removes all colors from the system",
    acc_underline: "Underline All Links",
    acc_underline_desc: "Makes all navigation links visible",
    nav_title_org: "Organizer Session",
    nav_title_pub: "General Public",
    nav_title_att: "Attendee Area",
    nav_login: "Login",
    nav_profile: "Profile & Preferences",
    nav_create_event: "Create Event",
    nav_costs: "Costs & Tickets",
    nav_venue: "Venue & Accessibility",
    nav_agenda: "Agenda & Sessions",
    nav_checkin: "Check-in Control",
    nav_incidents: "Incidents Log",
    nav_register: "Registration",
    nav_calendar: "Search & Schedule",
    nav_chatbot: "Virtual Assistant",
    nav_survey: "Satisfaction Survey",
    nav_my_tickets: "My Tickets",
    btn_save: "Save Changes",
    btn_next: "Next",
    btn_prev: "Previous",
    btn_edit: "Edit data",
    btn_cancel: "Cancel",
    btn_confirm: "Confirm",
    login_title: "Organizer Login",
    login_legend: "Access Credentials",
    login_instructions: "Enter your organizer details. For demo purposes, you can use any email and password.",
    login_email: "Email or Username",
    login_pass: "Password",
    login_btn: "Log In to System",
    login_success: "Access granted! Welcome to the system.",
    profile_title: "Profile & Preferences",
    profile_legend: "Organizer Details",
    profile_name: "Full Name",
    profile_email: "Contact Email",
    profile_tel: "Mobile Phone",
    profile_tz: "Time Zone",
    profile_lang: "Default Language",
    profile_saved: "Profile updated successfully.",
    event_title: "Create New Event",
    event_legend: "General Event Details",
    event_type: "Event Type",
    opt_conference: "Conference / Seminar",
    opt_concert: "Concert / Cultural Event",
    opt_workshop: "Tech Workshop",
    opt_exhibition: "Inclusive Exhibition",
    event_name: "Event Name",
    event_start: "Start Date & Time",
    event_end: "End Date & Time",
    event_capacity: "Maximum Capacity",
    event_cost: "Estimated Cost ($)",
    event_btn: "Save & Set Tickets",
    event_success: "Event created! Set up your tickets now.",
    costs_title: "Ticket Costs & Setup",
    costs_legend: "Business Model & Discounts",
    costs_select_event: "Select Event",
    costs_ticket_type: "Ticket Type",
    costs_free: "Free",
    costs_paid: "Paid",
    costs_mixed: "Mixed (Free / Paid)",
    costs_price_gen: "General Ticket Price ($)",
    costs_price_vip: "VIP Ticket Price ($)",
    costs_discounts: "Discounts & Exemptions Available",
    costs_disc_student: "Students (50% discount)",
    costs_disc_senior: "Seniors (100% exemption or 70% disc.)",
    costs_disc_disabled: "People with Disabilities (100% exemption)",
    costs_early_bird: "Early Bird Deadline",
    costs_btn: "Save Ticket Settings",
    venue_title: "Venue & Physical Accessibility Logistics",
    venue_legend: "Location Details & AI Accessibility Planner",
    venue_name: "Venue Name",
    venue_country: "Country",
    venue_city: "City",
    venue_address: "Exact Address",
    venue_resources: "Venue Physical Accessibility Resources",
    venue_ramps: "Accessibility Ramps",
    venue_loop: "Hearing Loop",
    venue_toilets: "Adapted Toilets",
    venue_parking: "Accessible Parking Space",
    venue_ai_btn: "Suggest Accessible Capacity by AI",
    venue_ai_desc: "Calculates the maximum recommended capacity for people with disabilities based on the physical resources.",
    ai_result_title: "AI Capacity Suggestion",
    agenda_title: "Event Agenda & Session Planner",
    agenda_legend: "Add Session to Schedule",
    agenda_session_name: "Session / Presentation Name",
    agenda_speaker: "Speaker / Presenter",
    agenda_time: "Session Time",
    agenda_room: "Assigned Room / Space",
    agenda_materials: "Support Materials Link (PDF/Video)",
    agenda_interpreter: "Sign Language Interpreter Required",
    agenda_btn: "Add Session to Agenda",
    agenda_list_title: "Event Schedule Timeline",
    reg_title: "Attendee Registration & Setup",
    reg_step1: "1. Info",
    reg_step2: "2. Pass Type",
    reg_step3: "3. Confirm",
    reg_step4: "4. Badge",
    reg_step1_legend: "Step 1: Personal Information",
    reg_step2_legend: "Step 2: Ticket Category & Accessibility",
    reg_step3_legend: "Step 3: Registration Review",
    reg_step4_legend: "Step 4: Your Digital Pass",
    reg_name: "Full Name",
    reg_email: "Email Address",
    reg_tel: "Contact Phone",
    reg_ticket_cat: "Ticket Category",
    reg_apply_disc: "Apply Accessibility Discount",
    opt_general: "General Pass",
    opt_vip: "VIP Pass",
    reg_no_disc: "None",
    reg_student: "Student (50% off)",
    reg_senior: "Senior / Elderly",
    reg_disabled: "Person with Disability (PWD)",
    reg_confirm_desc: "Please double check your information before submitting. If there's an issue, click Edit below.",
    reg_confirm_btn: "Confirm & Register",
    reg_success_title: "Registration Successful!",
    reg_ticket_desc: "Present this code at the event entrance.",
    reg_ticket_badge: "DIGITAL PASS",
    btn_restart_reg: "Register New Attendee",
    cal_title: "Event Search & Calendar",
    cal_filters: "Search Filters",
    cal_search: "Search by title",
    cal_filter_type: "Filter by Type",
    cal_filter_loc: "Filter by Location",
    cal_all: "All event types",
    cal_no_events: "No events found with the selected filters.",
    cal_view_program: "View Schedule",
    cal_program_title: "Event Program",
    cal_no_sessions: "No sessions added to this event's agenda yet.",
    cal_fav_toggle: "Toggle favorite",
    cal_fav_filter: "Favorites Only",
    cal_fav_none: "You have no events marked as favorites.",
    chat_title: "Smart Virtual Assistant",
    chat_config: "Chat Preferences",
    chat_motion: "Disable animations and flashing",
    chat_welcome: "Hello! I am your accessibility assistant. How can I help you navigate the event system today?",
    chat_faq: "Frequently Asked Questions:",
    faq_register: "How do I register?",
    faq_venue: "What physical access resources exist?",
    faq_incident: "How do I report an emergency?",
    chat_send: "Send",
    chat_voice: "Read Aloud",
    survey_title: "Post-Event Satisfaction Survey",
    survey_legend: "Your Feedback Matters",
    survey_select: "Select Event to Evaluate",
    survey_likert: "Overall satisfaction with event accessibility:",
    survey_likert_1: "Very Dissatisfied",
    survey_likert_2: "Dissatisfied",
    survey_likert_3: "Neutral",
    survey_likert_4: "Satisfied",
    survey_likert_5: "Very Satisfied",
    survey_comments: "Comments or accessibility improvement feedback",
    survey_btn: "Submit Satisfaction Survey",
    check_title: "Real-time Attendance Control Dashboard",
    check_expected: "Expected Attendees",
    check_actual: "Checked-in Attendees",
    check_progress: "Registered Attendance Percentage",
    check_pause: "Pause live updates",
    check_resume: "Resume live updates",
    check_scan: "Scan QR Code (Simulate)",
    check_log_title: "Live Entry Logs",
    inc_title: "Report Operational Incident",
    inc_legend: "Emergency / Incident Details",
    inc_type: "Incident Category",
    inc_med: "Medical Emergency",
    inc_sec: "Security / Evacuation",
    inc_op: "Operational / Logistics",
    inc_loc: "Exact Venue Location",
    inc_gravity: "Severity Level",
    inc_low: "Low (Internal log)",
    inc_med_g: "Medium (Attention needed)",
    inc_high: "High (Triggers General Alert)",
    inc_desc: "Incident Description",
    inc_btn: "Register Incident & Notify Team",
    logout_btn: "Log Out",
    // My Tickets (attendee)
    my_tickets_title: "My Tickets & Registrations",
    my_tickets_legend: "Registration History",
    my_tickets_empty: "You have no registrations yet. Go to the Registration section to sign up for an event.",
    my_tickets_cancel: "Cancel Registration",
    my_tickets_cancel_confirm: "Are you sure you want to cancel your registration for this event? This action can be reversed by contacting the organizer.",
    my_tickets_cancelled: "Cancelled",
    my_tickets_active: "Active",
    my_tickets_go_reg: "Go Register",
    // Admin Panel
    nav_admin: "Admin Panel",
    admin_title: "Administration Panel",
    admin_tab_users: "Registered Users",
    admin_tab_surveys: "Surveys Submitted",
    admin_tab_stats: "Statistics",
    admin_users_empty: "No registrations yet.",
    admin_surveys_empty: "No surveys submitted yet.",
    admin_stat_total_reg: "Active Registrations",
    admin_stat_avg_sat: "Average Satisfaction",
    admin_stat_general: "General Tickets",
    admin_stat_vip: "VIP Tickets",
    admin_stat_incidents: "Incidents Reported",
    admin_stat_surveys_count: "Surveys Answered",
    admin_inv_sent: "Invitation Sent",
    admin_inv_pending: "No invitation",
    // Keyboard Shortcuts
    shortcuts_title: "Keyboard Shortcuts",
    shortcuts_btn: "View Shortcuts",
    shortcut_acc: "Open accessibility panel",
    shortcut_home: "Go to home",
    shortcut_reg: "Go to Registration",
    shortcut_cal: "Go to Calendar",
    shortcut_survey: "Go to Survey",
    shortcut_tickets: "Go to My Tickets",
    shortcut_incidents: "Go to Incidents",
    shortcut_admin: "Go to Admin Panel",
    shortcut_esc: "Close panels",
    // Invitation email
    inv_email_title: "Invitation Email Sent",
    inv_email_subject: "Your registration is confirmed!",
    inv_email_greeting: "Hello",
    inv_email_body: "Your registration for the event has been successfully recorded. Please present the following QR code upon arrival.",
    inv_email_accept: "Confirm Attendance",
    inv_email_accept_done: "Attendance confirmed! See you at the event.",
    inv_email_close: "Close",
    inv_email_from: "U&A Event System",
    inv_email_sent_toast: "Invitation email sent to",
  }
};

// ======================= DEMO USERS =======================
export type UserRole = 'organizador' | 'asistente';

export interface DemoUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  tel: string;
  timezone: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: 'admin@evento.com',
    password: 'admin123',
    role: 'organizador',
    name: 'Admin Organizador',
    tel: '0999-111-222',
    timezone: 'GMT-5',
  },
  {
    email: 'asistente@evento.com',
    password: '1234',
    role: 'asistente',
    name: 'Usuario Asistente',
    tel: '0999-333-444',
    timezone: 'GMT-5',
  },
];

const LS_KEY = 'ua_session';

interface StoredSession {
  role: UserRole;
  email: string;
  name: string;
  tel: string;
  timezone: string;
  lang: string;
}


interface AppContextType {
  // Accessibility
  currentLang: 'es' | 'en';
  setCurrentLang: (lang: 'es' | 'en') => void;
  accPanelOpen: boolean;
  setAccPanelOpen: (v: boolean) => void;
  accContrast: boolean;
  setAccContrast: (v: boolean) => void;
  accFontSize: 'sm' | 'md' | 'lg' | 'xl';
  setAccFontSize: (v: 'sm' | 'md' | 'lg' | 'xl') => void;
  accSpacing: boolean;
  setAccSpacing: (v: boolean) => void;
  accReduceMotion: boolean;
  setAccReduceMotion: (v: boolean) => void;
  accDyslexia: boolean;
  setAccDyslexia: (v: boolean) => void;
  accGrayscale: boolean;
  setAccGrayscale: (v: boolean) => void;
  accUnderlineLinks: boolean;
  setAccUnderlineLinks: (v: boolean) => void;
  screenReaderText: string;
  setScreenReaderText: (v: string) => void;

  // Emergency & Toast
  emergencyOpen: boolean;
  setEmergencyOpen: (v: boolean) => void;
  emergencyText: string;
  setEmergencyText: (v: string) => void;
  toastOpen: boolean;
  toastText: string;
  toastIsError: boolean;
  showToast: (text: string, isError?: boolean) => void;

  // Auth
  isLoggedIn: boolean;
  userRole: UserRole | null;
  login: (email: string, password: string) => DemoUser | null;
  logout: () => void;
  userProfile: { name: string; email: string; tel: string; timezone: string; lang: string; };
  setUserProfile: (v: { name: string; email: string; tel: string; timezone: string; lang: string; }) => void;

  // Data (shared via localStorage)
  events: EventItem[];
  setEvents: (fn: (prev: EventItem[]) => EventItem[]) => void;
  agendaSessions: Record<string, SessionItem[]>;
  setAgendaSessions: (fn: (prev: Record<string, SessionItem[]>) => Record<string, SessionItem[]>) => void;
  checkInLog: CheckInLogItem[];
  setCheckInLog: (fn: (prev: CheckInLogItem[]) => CheckInLogItem[]) => void;
  expectedAttendance: number;
  setExpectedAttendance: (fn: (prev: number) => number) => void;
  actualAttendance: number;
  setActualAttendance: (fn: (prev: number) => number) => void;
  isCheckInActive: boolean;
  setIsCheckInActive: (v: boolean) => void;
  incidents: IncidentItem[];
  setIncidents: (fn: (prev: IncidentItem[]) => IncidentItem[]) => void;
  registrations: RegistrationItem[];
  setRegistrations: (fn: (prev: RegistrationItem[]) => RegistrationItem[]) => void;
  surveys: SurveyResponse[];
  setSurveys: (fn: (prev: SurveyResponse[]) => SurveyResponse[]) => void;
  invitations: InvitationLog[];
  sendInvitationEmail: (name: string, email: string, eventName: string, qrId: string) => void;

  // Shortcuts panel
  shortcutsPanelOpen: boolean;
  setShortcutsPanelOpen: (v: boolean) => void;

  // Invitation email modal
  invModalOpen: boolean;
  invModalData: { name: string; email: string; eventName: string; qrId: string } | null;
  setInvModalOpen: (v: boolean) => void;

  // Chat
  chatMessages: ChatMessage[];
  setChatMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void;
  lastBotMessage: string;
  setLastBotMessage: (v: string) => void;
  chatMessagesEndRef: React.RefObject<HTMLDivElement | null>;

  // Translate helper
  t: (key: string) => string;
  simulateCheckIn: () => void;
}

// ======================= CONTEXT =======================
const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState<'es' | 'en'>('es');
  const [accPanelOpen, setAccPanelOpen] = useState(false);
  const [accContrast, setAccContrast] = useState(false);
  const [accFontSize, setAccFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [accSpacing, setAccSpacing] = useState(false);
  const [accReduceMotion, setAccReduceMotion] = useState(false);
  const [accDyslexia, setAccDyslexia] = useState(false);
  const [accGrayscale, setAccGrayscale] = useState(false);
  const [accUnderlineLinks, setAccUnderlineLinks] = useState(false);
  const [screenReaderText, setScreenReaderText] = useState("Página cargada. Presione Tab para comenzar a navegar por el sistema. Use Alt+A para opciones de accesibilidad.");

  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyText, setEmergencyText] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastIsError, setToastIsError] = useState(false);

  // Read session from localStorage on first mount
  const storedRaw = localStorage.getItem(LS_KEY);
  const storedSession: StoredSession | null = storedRaw ? JSON.parse(storedRaw) : null;

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!storedSession);
  const [userRole, setUserRole] = useState<UserRole | null>(storedSession?.role ?? null);
  const [userProfile, setUserProfile] = useState({
    name: storedSession?.name ?? 'Invitado',
    email: storedSession?.email ?? '',
    tel: storedSession?.tel ?? '',
    timezone: storedSession?.timezone ?? 'GMT-5',
    lang: storedSession?.lang ?? 'es',
  });

  /** Validate credentials and log in. Returns the matched user or null. */
  const login = useCallback((email: string, password: string): DemoUser | null => {
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return null;
    const profile = { name: found.name, email: found.email, tel: found.tel, timezone: found.timezone, lang: currentLang };
    setIsLoggedIn(true);
    setUserRole(found.role);
    setUserProfile(profile);
    const session: StoredSession = { role: found.role, ...profile };
    localStorage.setItem(LS_KEY, JSON.stringify(session));
    return found;
  }, [currentLang]);

  /** Clear session and redirect caller to /login */
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserProfile({ name: 'Invitado', email: '', tel: '', timezone: 'GMT-5', lang: 'es' });
    localStorage.removeItem(LS_KEY);
  }, []);

  // ======================= DATOS COMPARTIDOS (localStorage) =======================

  const [events, setEvents] = useState<EventItem[]>(() =>
    loadLS(LS_DATA.EVENTS, DEFAULT_EVENTS)
  );

  const [agendaSessions, setAgendaSessions] = useState<Record<string, SessionItem[]>>(() =>
    loadLS(LS_DATA.AGENDA, DEFAULT_AGENDA)
  );

  const [checkInLog, setCheckInLog] = useState<CheckInLogItem[]>(() =>
    loadLS(LS_DATA.CHECKIN_LOG, DEFAULT_CHECKIN)
  );

  const [expectedAttendance, setExpectedAttendance] = useState<number>(() => {
    const att = loadLS<{ expected: number; actual: number } | null>(LS_DATA.ATTENDANCE, null);
    return att?.expected ?? 120;
  });

  const [actualAttendance, setActualAttendance] = useState<number>(() => {
    const att = loadLS<{ expected: number; actual: number } | null>(LS_DATA.ATTENDANCE, null);
    return att?.actual ?? 42;
  });

  const [isCheckInActive, setIsCheckInActive] = useState(true);

  const [incidents, setIncidents] = useState<IncidentItem[]>(() =>
    loadLS(LS_DATA.INCIDENTS, [])
  );

  const [registrations, setRegistrations] = useState<RegistrationItem[]>(() =>
    loadLS(LS_DATA.REGISTRATIONS, [])
  );

  const [surveys, setSurveys] = useState<SurveyResponse[]>(() =>
    loadLS(LS_DATA.SURVEYS, [])
  );

  const [invitations, setInvitations] = useState<InvitationLog[]>(() =>
    loadLS(LS_DATA.INVITATIONS, [])
  );

  const [shortcutsPanelOpen, setShortcutsPanelOpen] = useState(false);
  const [invModalOpen, setInvModalOpen] = useState(false);
  const [invModalData, setInvModalData] = useState<{ name: string; email: string; eventName: string; qrId: string } | null>(null);

  // ======================= PERSISTENCIA EN localStorage =======================

  useEffect(() => { localStorage.setItem(LS_DATA.EVENTS, JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem(LS_DATA.AGENDA, JSON.stringify(agendaSessions)); }, [agendaSessions]);
  useEffect(() => { localStorage.setItem(LS_DATA.CHECKIN_LOG, JSON.stringify(checkInLog)); }, [checkInLog]);
  useEffect(() => { localStorage.setItem(LS_DATA.INCIDENTS, JSON.stringify(incidents)); }, [incidents]);
  useEffect(() => { localStorage.setItem(LS_DATA.REGISTRATIONS, JSON.stringify(registrations)); }, [registrations]);
  useEffect(() => { localStorage.setItem(LS_DATA.SURVEYS, JSON.stringify(surveys)); }, [surveys]);
  useEffect(() => { localStorage.setItem(LS_DATA.INVITATIONS, JSON.stringify(invitations)); }, [invitations]);
  useEffect(() => {
    localStorage.setItem(LS_DATA.ATTENDANCE, JSON.stringify({ expected: expectedAttendance, actual: actualAttendance }));
  }, [expectedAttendance, actualAttendance]);

  // ======================= SINCRONIZACIÓN ENTRE PESTAÑAS =======================
  // El evento nativo 'storage' se dispara cuando OTRA pestaña modifica localStorage
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      try {
        if (e.key === LS_DATA.EVENTS && e.newValue)
          setEvents(() => JSON.parse(e.newValue!));
        if (e.key === LS_DATA.AGENDA && e.newValue)
          setAgendaSessions(() => JSON.parse(e.newValue!));
        if (e.key === LS_DATA.CHECKIN_LOG && e.newValue)
          setCheckInLog(() => JSON.parse(e.newValue!));
        if (e.key === LS_DATA.INCIDENTS && e.newValue)
          setIncidents(() => JSON.parse(e.newValue!));
        if (e.key === LS_DATA.REGISTRATIONS && e.newValue)
          setRegistrations(() => JSON.parse(e.newValue!));
        if (e.key === LS_DATA.ATTENDANCE && e.newValue) {
          const att = JSON.parse(e.newValue!) as { expected: number; actual: number };
          setExpectedAttendance(() => att.expected);
          setActualAttendance(() => att.actual);
        }
        // Sync emergency/incidents alerts cross-tab
        if (e.key === LS_DATA.INCIDENTS && e.newValue) {
          const incs = JSON.parse(e.newValue!) as IncidentItem[];
          const hasHighAlert = incs.some(i => i.gravity === 'alto');
          if (hasHighAlert) {
            const last = incs.filter(i => i.gravity === 'alto').at(-1);
            if (last) {
              setEmergencyText(`⚠ ALERTA: ${last.type.toUpperCase()} en ${last.location}. ${last.description}`);
              setEmergencyOpen(true);
            }
          }
        }
      } catch {
        // ignore parse errors
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { text: "¡Hola! Soy tu asistente de accesibilidad. ¿Cómo te puedo ayudar hoy con el sistema de eventos?", sender: 'bot' }
  ]);
  const [lastBotMessage, setLastBotMessage] = useState("¡Hola! Soy tu asistente de accesibilidad. ¿Cómo te puedo ayudar hoy con el sistema de eventos?");
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const t = useCallback((key: string) => {
    return translations[currentLang][key] || key;
  }, [currentLang]);

  const showToast = useCallback((text: string, isError = false) => {
    setToastText(text);
    setToastIsError(isError);
    setToastOpen(true);
    setScreenReaderText(text);
    setTimeout(() => setToastOpen(false), 4000);
  }, []);

  const sendInvitationEmail = useCallback((name: string, email: string, eventName: string, qrId: string) => {
    const log: InvitationLog = {
      id: Date.now(),
      toName: name,
      toEmail: email,
      eventName,
      qrId,
      sentAt: new Date().toISOString(),
    };
    setInvitations(prev => [...prev, log]);
    // Open the invitation modal
    setInvModalData({ name, email, eventName, qrId });
    setInvModalOpen(true);
  }, []);

  const simulateCheckIn = useCallback(() => {
    const mockNames = ["Sofia Reyes", "Carlos Andrade", "Miguel Pérez", "Juan Perez", "Maria Lopez", "Elena Gomez", "Luis Torres"];
    const randName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randType = Math.random() > 0.5 ? "GENERAL" : "VIP";
    setActualAttendance(prev => {
      const next = prev + 1;
      if (next > expectedAttendance) setExpectedAttendance(p => p + 10);
      return next;
    });
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
    setCheckInLog(prev => [{ id: Date.now(), time: timeStr, name: randName, type: randType }, ...prev]);
    setScreenReaderText(currentLang === 'es' ? `Check-in en vivo: ${randName} ha ingresado.` : `Live check-in: ${randName} checked in.`);
  }, [currentLang, expectedAttendance]);

  // --- Accessibility side effects ---
  useEffect(() => {
    document.body.classList.toggle('high-contrast', accContrast);
  }, [accContrast]);

  useEffect(() => {
    const sizes: Record<string, string> = { sm: '85%', md: '100%', lg: '120%', xl: '140%' };
    document.documentElement.style.fontSize = sizes[accFontSize] ?? '100%';
  }, [accFontSize]);

  useEffect(() => {
    document.body.classList.toggle('spacing-expanded', accSpacing);
  }, [accSpacing]);

  useEffect(() => {
    document.body.classList.toggle('reduced-motion', accReduceMotion);
  }, [accReduceMotion]);

  useEffect(() => {
    document.body.classList.toggle('dyslexia-mode', accDyslexia);
  }, [accDyslexia]);

  useEffect(() => {
    document.body.classList.toggle('grayscale-mode', accGrayscale);
  }, [accGrayscale]);

  useEffect(() => {
    document.body.classList.toggle('underline-links', accUnderlineLinks);
  }, [accUnderlineLinks]);

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.altKey) {
        const k = e.key.toLowerCase();
        if (k === 'a') { e.preventDefault(); setAccPanelOpen(prev => !prev); }
        if (k === 'k') { e.preventDefault(); setShortcutsPanelOpen(prev => !prev); }
        if (k === 'h') { e.preventDefault(); window.location.hash = '#/login'; window.dispatchEvent(new CustomEvent('ua-navigate', { detail: '/login' })); }
        if (k === 'r') { e.preventDefault(); window.dispatchEvent(new CustomEvent('ua-navigate', { detail: '/register' })); }
        if (k === 'c') { e.preventDefault(); window.dispatchEvent(new CustomEvent('ua-navigate', { detail: '/calendar' })); }
        if (k === 's') { e.preventDefault(); window.dispatchEvent(new CustomEvent('ua-navigate', { detail: '/survey' })); }
        if (k === 'm') { e.preventDefault(); window.dispatchEvent(new CustomEvent('ua-navigate', { detail: '/my-tickets' })); }
        if (k === 'i') { e.preventDefault(); window.dispatchEvent(new CustomEvent('ua-navigate', { detail: '/dashboard/incidents' })); }
        if (k === 'p') { e.preventDefault(); window.dispatchEvent(new CustomEvent('ua-navigate', { detail: '/dashboard/admin' })); }
      }
      if (e.key === 'Escape') {
        setAccPanelOpen(false);
        setShortcutsPanelOpen(false);
        setInvModalOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Simulated screen reader on focus
  useEffect(() => {
    const getLabelForInput = (el: HTMLElement): string => {
      if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label) return label.textContent?.replace(' *', '').trim() || '';
      }
      return el.getAttribute('name') || '';
    };
    const handleFocusIn = (e: globalThis.FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      let text = '';
      const label = target.getAttribute('aria-label');
      if (label) { text = label; }
      else {
        const tag = target.tagName.toLowerCase();
        const type = (target as HTMLInputElement).type;
        if (tag === 'button') text = (currentLang === 'es' ? 'Botón: ' : 'Button: ') + target.textContent?.trim();
        else if (tag === 'input') {
          const lbl = getLabelForInput(target);
          if (type === 'checkbox') text = (currentLang === 'es' ? 'Casilla: ' : 'Checkbox: ') + lbl;
          else if (type === 'radio') text = (currentLang === 'es' ? 'Opción: ' : 'Radio: ') + lbl;
          else text = (currentLang === 'es' ? 'Campo para ' : 'Input for ') + lbl;
        } else if (tag === 'select') text = (currentLang === 'es' ? 'Menú desplegable: ' : 'Dropdown: ') + getLabelForInput(target);
        else if (tag === 'textarea') text = (currentLang === 'es' ? 'Área de texto: ' : 'Text area: ') + getLabelForInput(target);
      }
      if (text) setScreenReaderText(text);
    };
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [currentLang]);

  // Check-in interval
  useEffect(() => {
    if (!isCheckInActive) return;
    const interval = setInterval(simulateCheckIn, 7000);
    return () => clearInterval(interval);
  }, [isCheckInActive, simulateCheckIn]);

  // Chat auto-scroll
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <AppContext.Provider value={{
      currentLang, setCurrentLang,
      accPanelOpen, setAccPanelOpen,
      accContrast, setAccContrast,
      accFontSize, setAccFontSize,
      accSpacing, setAccSpacing,
      accReduceMotion, setAccReduceMotion,
      accDyslexia, setAccDyslexia,
      accGrayscale, setAccGrayscale,
      accUnderlineLinks, setAccUnderlineLinks,
      screenReaderText, setScreenReaderText,
      emergencyOpen, setEmergencyOpen,
      emergencyText, setEmergencyText,
      toastOpen, toastText, toastIsError, showToast,
      isLoggedIn, userRole, login, logout,
      userProfile, setUserProfile,
      events, setEvents,
      agendaSessions, setAgendaSessions,
      checkInLog, setCheckInLog,
      expectedAttendance, setExpectedAttendance,
      actualAttendance, setActualAttendance,
      isCheckInActive, setIsCheckInActive,
      incidents, setIncidents,
      registrations, setRegistrations,
      surveys, setSurveys,
      invitations, sendInvitationEmail,
      shortcutsPanelOpen, setShortcutsPanelOpen,
      invModalOpen, invModalData, setInvModalOpen,
      chatMessages, setChatMessages,
      lastBotMessage, setLastBotMessage,
      chatMessagesEndRef,
      t, simulateCheckIn,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
