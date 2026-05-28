export interface ProjectModule {
  name: string;
  icon?: string;
  details: string[];
  progress?: number;
  statusLabel?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  tech: string[];
  features: string[];
  stats: { label: string; value: string }[];
  gallery?: { image: string; title: string; desc: string }[];
  progress?: number;
  challenge?: string;
  solution?: string;
  quote?: { text: string; author: string; role: string };
  highlight?: { title: string; text: string };
  accentColor?: string;
  isProduction?: boolean;
  launchDate?: string;
  modules?: ProjectModule[];
}

export const projects: Project[] = [
  {
    id: "mvp-sports",
    title: "MVP Sports Chile",
    category: "Gestión Deportiva",
    description: "Aplicación móvil y panel web para administrar canchas deportivas y reservas.",
    longDescription: "Un sistema completo para automatizar la administración de recintos deportivos. Permite gestionar reservas, recibir pagos automáticos y controlar el acceso de los jugadores, todo desde una sola plataforma. Diseñado para ahorrar tiempo y aumentar las ganancias del complejo.",
    challenge: "Los dueños de canchas perdían mucho tiempo gestionando reservas por WhatsApp y anotando en libretas. Además, no tenían un control claro de sus ingresos diarios y sufrían con jugadores que reservaban y no asistían.",
    solution: "Desarrollamos una plataforma doble: un panel web para que el dueño controle todo (caja, horarios, empleados) y una app móvil para que los jugadores puedan buscar canchas, reservar y pagar en segundos.",
    image: "/portfolio/mvpsports_home.png",
    tech: ["Next.js", "React Native", "Firebase", "Webpay Plus", "Nube Segura"],
    isProduction: true,
    launchDate: "PRODUCCIÓN 100%",
    progress: 100,
    accentColor: "#007FFF",
    stats: [
      { label: "Lanzamiento", value: "Google Play" },
      { label: "Pagos", value: "Webpay Automático" },
      { label: "Modelo", value: "Plataforma Integral" }
    ],
    features: [
      "Pagos Automáticos: Integración directa con Webpay para cobrar sin intervención manual.",
      "Sistema a Medida: Diferentes planes y permisos según las necesidades de cada recinto.",
      "Seguridad Total: Los datos de cada complejo están aislados y protegidos en la nube.",
      "Cumplimiento Legal: La app cumple con todas las normas de privacidad chilenas.",
      "Historial de Movimientos: Registro detallado de cada pago y reserva realizada.",
      "Control de Acceso: Validación rápida en portería para el ingreso de jugadores."
    ],
    modules: [
      {
        name: "PANEL WEB PARA DUEÑOS",
        details: [
          "Control General: Vista de todas las ganancias y operaciones del recinto.",
          "Calendario Interactivo: Manejo de reservas, bloqueo de canchas y horarios especiales.",
          "Gestión de Empleados: Control de turnos y permisos para el personal."
        ],
        progress: 100,
        statusLabel: "LISTO"
      },
      {
        name: "APP MÓVIL PARA JUGADORES",
        details: [
          "Buscador de Canchas: Mapa interactivo para encontrar recintos cercanos.",
          "Pagos Seguros: Billetera digital y pago rápido con tarjetas.",
          "Perfil del Jugador: Estadísticas de partidos, niveles y trofeos."
        ],
        progress: 100,
        statusLabel: "LISTO"
      },
      {
        name: "SISTEMA INTERNO",
        details: [
          "Procesos Automáticos: Reembolsos gestionados por el sistema sin intervención manual.",
          "Protección de Datos: Máxima seguridad para la información de clientes.",
          "Optimización: Carga súper rápida en cualquier dispositivo móvil."
        ],
        progress: 100,
        statusLabel: "LISTO"
      }
    ],
    gallery: [
      { image: "/portfolio/mvpsports_owner.png", title: "Panel de Dueño", desc: "Control de la agenda y pagos." },
      { image: "/portfolio/mvpsports_app.png", title: "App del Jugador", desc: "Reserva rápida y perfil del deportista." },
      { image: "/portfolio/mvpsports_finance.png", title: "Control Financiero", desc: "Registro claro de ingresos del día." },
      { image: "/portfolio/mvpsports_general.png", title: "Visión Global", desc: "Ecosistema unificado para el deporte." }
    ]
  },
  {
    id: "nutricionista-katherine",
    title: "Nutricionista Katherine",
    category: "Nutrición y Salud",
    description: "Sistema inteligente y exclusivo para nutricionistas: gestión de pacientes y videollamadas.",
    longDescription: "Una potente Consola de Inteligencia Biométrica diseñada exclusivamente para profesionales de la nutrición. Reemplaza por completo el papeleo físico, permitiendo llevar la agenda, analizar métricas corporales y realizar cobros automáticos desde una sola pantalla de máxima precisión.",
    challenge: "El trabajo diario del nutricionista estaba fragmentado: fichas en papel, excels para calcular el peso, transferencias manuales y Zoom para atender. Se necesitaba unificar toda la operación clínica para no perder el progreso real de los pacientes.",
    solution: "Desarrollamos un centro de control total que incluye un motor de videollamadas integrado y un asistente de evaluación corporal de 5 pasos. El profesional puede ver los gráficos de masa muscular y grasa en tiempo real sin desconectar la llamada.",
    image: "/portfolio/nk_home.png",
    tech: ["Next.js", "Prisma", "MySQL", "Tailwind CSS"],
    isProduction: true,
    launchDate: "LISTO PARA USAR",
    progress: 100,
    accentColor: "#0ea5e9",
    stats: [
      { label: "Sector", value: "Nutrición Clínica" },
      { label: "Operación", value: "100% Digital" }
    ],
    features: [
      "Autenticación Dual: El sistema se adapta automáticamente si ingresa el nutricionista o el paciente.",
      "Asistente Bio-Flow: Captura de perímetros, grasa, hidratación y peso en pasos muy fluidos.",
      "Teleconsulta Élite: Videollamada rápida donde la ficha médica se mantiene visible a un lado.",
      "Analítica Corporal: Generación de gráficos automáticos que muestran el crecimiento o pérdida de peso.",
      "Matriz de Pacientes: Mapeo visual desde bajo peso hasta obesidad para decisiones precisas.",
      "Control de Suscripciones: Sistema automático para gestionar los pagos y renovaciones de cada plan."
    ],
    modules: [
      {
        name: "CONSOLA MAESTRA",
        details: [
          "Panel general con el total de pacientes, citas del día y suscripciones activas.",
          "Gráficos financieros que muestran el crecimiento real de la consulta nutricional.",
          "Distribución visual automática de la salud de todos los pacientes."
        ],
        progress: 100,
        statusLabel: "LISTO"
      },
      {
        name: "EVALUACIÓN BIO-FLOW",
        details: [
          "Registro súper rápido de medidas corporales, estilo de vida e historial clínico.",
          "Análisis de alimentación diaria (Recall) y registro fotográfico de cambios físicos.",
          "Cálculo automático de resultados para no perder tiempo con calculadoras."
        ],
        progress: 100,
        statusLabel: "LISTO"
      },
      {
        name: "SALA DE TELECONSULTA",
        details: [
          "Videollamadas optimizadas para no cortarse durante la revisión de resultados.",
          "El historial del paciente se mantiene fijo en pantalla para no perder contexto.",
          "Sala de espera virtual para aceptar a los pacientes según la agenda del día."
        ],
        progress: 100,
        statusLabel: "LISTO"
      },
      {
        name: "PORTAL DEL PACIENTE",
        details: [
          "Cada persona tiene su propio acceso para ver su pauta nutricional desde el celular.",
          "Gráficos motivacionales donde el paciente ve su propio éxito (músculo y grasa).",
          "Opción para renovar su plan y pagar la próxima consulta directamente online."
        ],
        progress: 100,
        statusLabel: "LISTO"
      }
    ],
    gallery: [
      { image: "/portfolio/nk_resumen.png", title: "Consola Nutricional", desc: "Vista general y métricas de salud." },
      { image: "/portfolio/nk_cursos.png", title: "Cursos Online de Nutrición", desc: "Módulo de clases y aprendizaje." },
      { image: "/portfolio/nk_bioflow.png", title: "Evaluación Corporal", desc: "Registro de músculo y grasa." },
      { image: "/portfolio/nk_home.png", title: "Visión Global", desc: "Control de pacientes en una pantalla." }
    ]
  },
  {
    id: "gecominsa",
    title: "Gecominsa ERP",
    category: "Gestión Industrial",
    description: "Centro de comando para control de flota, logística y rentabilidad de maquinaria.",
    longDescription: "Es una plataforma integral diseñada para la gestión operativa y financiera de arriendo de maquinarias pesadas. Permite visualizar la disponibilidad de la flota, generar cotizaciones en PDF y controlar el flujo de caja diario en pesos y UF, todo desde un entorno rápido y diseñado para no distraer al usuario.",
    challenge: "El control de maquinaria y despachos se llevaba en diferentes planillas manuales. Esto provocaba errores al arrendar equipos que ya estaban ocupados y hacía muy difícil calcular la rentabilidad real y flujo de caja de la empresa.",
    solution: "Desarrollamos un panel unificado con una matriz gráfica de disponibilidad y un motor que bloquea fechas automáticamente para evitar choques. Además, digitalizamos las actas de entrega, sumando firmas táctiles y fotos directamente en terreno.",
    image: "/portfolio/gecominsa_home.png",
    tech: ["Next.js", "Firebase", "GPT-4o", "Tailwind CSS"],
    isProduction: true,
    launchDate: "LISTO PARA USAR",
    progress: 100,
    accentColor: "#f59e0b",
    stats: [
      { label: "Industria", value: "Maquinarias" },
      { label: "Operación", value: "100% Digital" }
    ],
    features: [
      "Inteligencia Financiera: Conversión automática de CLP a UF y proyección gráfica del flujo de caja.",
      "Motor Anti-Colisión: Bloquea automáticamente el arriendo de equipos si las fechas se topan.",
      "Controles Logísticos: Firmas digitales y subida de fotos desde el celular en el lugar de trabajo.",
      "Fichas con Inteligencia Artificial: Redacción automática de características de las máquinas.",
      "Generación PDF: Creación de cotizaciones y contratos oficiales con el logotipo de la empresa.",
      "Matriz de Disponibilidad: Mapa visual continuo que muestra los equipos ocupados y libres."
    ],
    modules: [
      {
        name: "FLOTA Y LOGÍSTICA",
        details: [
          "Control automático de horómetros para saber cuándo hacer mantenimiento preventivo.",
          "Generación de actas de entrega y recepción de maquinaria con respaldo fotográfico.",
          "Actualización en vivo del estado del equipo según el calendario de arriendos."
        ],
        progress: 100,
        statusLabel: "LISTO"
      },
      {
        name: "FINANZAS Y VENTAS",
        details: [
          "Tablero financiero con cálculos precisos de ingresos y ventas confirmadas.",
          "Manejo rápido de cotizaciones profesionales exportables a documentos PDF.",
          "Gestión de directorio para administrar tanto a clientes como proveedores."
        ],
        progress: 100,
        statusLabel: "LISTO"
      }
    ],
    gallery: [
      { image: "/portfolio/gecominsa_finance.png", title: "Flujo de Caja", desc: "Visión financiera en tiempo real." },
      { image: "/portfolio/gecominsa_dispo.png", title: "Matriz Visual", desc: "Disponibilidad gráfica de equipos." },
      { image: "/portfolio/gecominsa_control.png", title: "Logística en Terreno", desc: "Actas de entrega con firmas online." },
      { image: "/portfolio/gecominsa_general.png", title: "Centro de Comando", desc: "Gestión unificada de operaciones." }
    ]
  },
  {
    id: "geoscan",
    title: "GeoScan Pro",
    category: "Ventas y Prospección",
    description: "Herramienta avanzada para encontrar, calificar y gestionar nuevos clientes de forma automática.",
    longDescription: "GeoScan Pro es una herramienta para equipos de ventas que necesitan encontrar clientes de calidad rápidamente. El sistema busca datos en internet para mostrar las mejores oportunidades de negocio, permitiendo que el vendedor se enfoque en cerrar tratos en lugar de perder horas buscando datos de contacto.",
    challenge: "El equipo perdía tiempo valioso buscando empresas de forma manual en Google y muchas ventas potenciales se perdían por falta de seguimiento organizado.",
    solution: "Instalamos un buscador automático que encuentra y califica clientes con una nota. Además, incluimos un tablero visual muy sencillo donde se mueve y registra cada etapa de la venta.",
    image: "/portfolio/geoscan_home.png",
    tech: ["Next.js", "Firebase", "Tailwind CSS", "Inteligencia Artificial"],
    isProduction: true,
    launchDate: "LISTO PARA USAR",
    progress: 100,
    accentColor: "#ffffff",
    stats: [
      { label: "Enfoque", value: "Cierre de Ventas" },
      { label: "Estado", value: "Terminado" }
    ],
    features: [
      "Buscador Automático: Rastreo masivo de empresas aplicando filtros de rubro y ciudad.",
      "Calificación de Clientes: Asignación automática de notas para que llames primero a los mejores.",
      "Tablero de Ventas (Funnel): Sistema visual para mover los tratos de 'Interesado' a 'Vendido'.",
      "Detección Social: Extrae automáticamente las redes sociales de los negocios.",
      "Reportes PDF: Creación de fichas y análisis profesionales listos para enviar por correo."
    ],
    modules: [
      {
        name: "CENTRO DE BÚSQUEDA",
        details: [
          "Encuentra negocios nuevos con máxima precisión geográfica.",
          "Bloquea y elimina datos duplicados para mantener la base limpia.",
          "Actualización de información de las empresas en cuestión de segundos."
        ],
        progress: 100,
        statusLabel: "LISTO"
      },
      {
        name: "GESTIÓN COMERCIAL",
        details: [
          "Pizarra digital para agrupar clientes según su nivel de interés.",
          "Métricas en vivo para saber cuántas ventas se están cerrando en el mes.",
          "Agenda de acceso rápido a los correos y teléfonos de contacto."
        ],
        progress: 100,
        statusLabel: "LISTO"
      }
    ],
    gallery: [
      { image: "/portfolio/geoscan_prospectos.png", title: "Buscador de Clientes", desc: "Pantalla para encontrar empresas." },
      { image: "/portfolio/geoscan_ventas.png", title: "Tablero de Ventas", desc: "Organización visual de tratos." },
      { image: "/portfolio/geoscan_home.png", title: "Análisis Detallado", desc: "Ficha de negocio extraída de internet." }
    ]
  },
  {
    id: "academix",
    title: "AcademiX Platform",
    category: "Gestión Escolar",
    description: "Sistema inteligente para armar horarios de clases, organizar profesores y cursos automáticamente.",
    longDescription: "Es una poderosa plataforma escolar que elimina el estrés de coordinar profesores y salas. Mediante un sistema visual muy avanzado pero sencillo, permite crear horarios perfectos que evitan cruces de clases y sobrecargas de docentes de manera automática.",
    challenge: "Crear horarios para todo un colegio era un dolor de cabeza que tomaba semanas de prueba y error. Siempre había choques de salas o profesores con largos espacios libres (ventanas), lo que generaba caos administrativo y quejas del personal.",
    solution: "Implementamos un motor inteligente que revisa las reglas del colegio y arma la malla de horarios de forma automática. Ahora, si pones un choque de clases, el sistema te avisa inmediatamente y resuelve el conflicto sin esfuerzo.",
    image: "/academix_hero.png",
    tech: ["Next.js", "Firebase", "Tailwind CSS"],
    isProduction: true,
    launchDate: "LISTO PARA USAR",
    progress: 100,
    accentColor: "#4F46E5",
    stats: [
      { label: "Misión", value: "Orden Escolar" },
      { label: "Estado", value: "Terminado" }
    ],
    features: [
      "Motor Inteligente: Generación automática de horarios sin conflicto ni choques de salas.",
      "Visión de Alta Densidad: Todo el mapa de cursos de la escuela visible en una sola pantalla.",
      "Eliminador de Ventanas: Ajuste automático para que el profesor no tenga espacios vacíos ineficientes.",
      "Control Dual Seguro: Entornos separados y seguros para los Directores y Profesores.",
      "Simulador de Cambios: Permite probar modificaciones de cursos sin dañar los datos reales."
    ],
    modules: [
      {
        name: "ADMINISTRACIÓN INTELIGENTE",
        details: [
          "Reparto automático para cientos de cursos y decenas de profesores simultáneos.",
          "Prevención de topes de horario y advertencias de sobrecarga de horas de clase.",
          "Área de pruebas para mover la malla escolar sin miedo a cometer errores definitivos."
        ],
        progress: 100,
        statusLabel: "LISTO"
      },
      {
        name: "GESTOR DOCENTE",
        details: [
          "Tarjetas ordenadas con los perfiles, ramos que imparten y horas de cada profesor.",
          "Medidores gráficos de la cantidad de trabajo asignado vs. su disponibilidad límite.",
          "Buscador instantáneo para hallar reemplazos cuando un docente falta."
        ],
        progress: 100,
        statusLabel: "LISTO"
      },
      {
        name: "INFRAESTRUCTURA",
        details: [
          "Organización visual para conectar Sedes, Niveles, Cursos y Salas del colegio.",
          "Resumen automático de qué aulas están vacías y en qué momento exacto.",
          "Carga y sincronización ultra rápida desde cualquier computador."
        ],
        progress: 100,
        statusLabel: "LISTO"
      }
    ],
    gallery: [
      { image: "/aca_grid_1.png", title: "Mapa de Horarios", desc: "Vista principal sin cruces de clase." },
      { image: "/aca_grid_2.png", title: "Cursos y Salas", desc: "Organización de los niveles del colegio." },
      { image: "/aca_grid_3.png", title: "Ficha del Profesor", desc: "Control de disponibilidad y carga horaria." }
    ]
  }
];
