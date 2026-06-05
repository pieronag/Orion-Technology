export const saraProposalTemplate = {
  intro: "La presente propuesta detalla la creación de un ecosistema digital personalizado diseñado para elevar el estándar de la práctica clínica de Sara Largacha Vivas. En un mercado donde las herramientas genéricas fuerzan al profesional a adaptar su metodología al software, nuestra propuesta hace lo inverso: construimos una herramienta tecnológica a medida que potencia su metodología clínica, eliminando la fricción administrativa y permitiendo una toma de decisiones basada en datos reales. El proyecto trasciende la simple gestión de pacientes para ejecutar una Reingeniería de Procesos, transformando el seguimiento terapéutico en un activo de alto valor clínico.",
  objectives: [
    { title: "Soberanía Tecnológica y Control Total", desc: "A diferencia de las plataformas cerradas, entregamos un código fuente y una base de datos 100% bajo su control. Esto elimina la dependencia de licencias de terceros, plugins obsoletos o políticas de cambios unilaterales por parte de proveedores de software." },
    { title: "Precisión Terapéutica y Adherencia", desc: "Desarrollamos una plataforma enfocada en el acompañamiento del paciente mediante la consolidación de métricas antropométricas, gestión histórica de planes y una biblioteca educativa que asegura que el paciente reciba la información correcta en el momento preciso." },
    { title: "Eficiencia Operativa Extrema", desc: "Optimizamos el flujo de trabajo mediante la automatización de la sincronización de pacientes. Al integrar los datos de Encuadrado de forma inteligente, eliminamos la carga de digitación manual, reduciendo a cero el error humano en la creación de perfiles y permitiendo una administración transparente." }
  ],
  development: {
    web: {
      title: "1. LA WEB: PORTAL DE CAPTACIÓN",
      desc: "Migración estratégica hacia un entorno tecnológico de alto rendimiento, diseñado no solo para informar, sino para convertir visitantes en pacientes.",
      items: [
        { title: "Arquitectura SPA (Single Page Application)", desc: "Construiremos la web utilizando React y Vite, tecnología de punta que permite una navegación instantánea sin recargas de página. Esto no solo mejora la experiencia de usuario, sino que posiciona su marca como una autoridad tecnológica en el sector salud." },
        { title: "Identidad Clínica & Conversión", desc: "Diseño de Landing Page inmersiva enfocada en su identidad profesional. Integración estratégica de botones de acción (CTA) que derivan al paciente directamente a su plataforma de agendamiento en Encuadrado, asegurando que ningún lead se pierda en el proceso." }
      ]
    },
    system: {
      title: "2. EL SISTEMA: GESTIÓN CLÍNICA",
      desc: "El corazón operativo de la consulta, diseñado para el diagnóstico de precisión y la fidelización del paciente.",
      items: [
        { title: "Core & Sync Engine (Sincronización Inteligente)", desc: "Desarrollo de una API privada que actúa como el cerebro clínico. Incluye un módulo de importación de datos diseñado específicamente para procesar los reportes semanales de Encuadrado. Utilizaremos el RUT como llave única para actualizar perfiles existentes e insertar nuevos, garantizando que el historial clínico nunca se duplique ni se pierda." },
        { title: "Interfaz UI Premium (High-Density HUD)", desc: "Un panel de control administrativo construido bajo el concepto 'Executive Slim', diseñado para mostrar la mayor cantidad de información clínica relevante en un solo vistazo, reduciendo la fatiga visual del profesional durante las consultas." },
        { title: "Gestor de Planes Alimentarios", desc: "Sistema de carga de archivos PDF con historial versionado. El profesional puede ver la evolución de las pautas entregadas, mientras que el paciente visualiza exclusivamente su plan vigente, manteniendo una interfaz limpia y evitando confusiones." },
        { title: "Mensajería 1:1", desc: "Canal de comunicación interna en tiempo real. Este módulo permite un seguimiento terapéutico directo y privado, permitiendo a la profesional gestionar sus tiempos de respuesta mientras mantiene una línea de contacto constante con sus pacientes." },
        { title: "Gamificación & Motor Educativo", desc: "Implementación de un sistema de logros automáticos que premian la adherencia del paciente, incentivando su progreso. Incluye una biblioteca de videos (alojados de forma privada en YouTube) con un sistema de desbloqueo secuencial: el paciente debe completar el video educativo anterior para acceder al siguiente, asegurando el proceso de aprendizaje." }
      ]
    }
  },
  integration: "Es fundamental comprender que la integración con plataformas cerradas como Encuadrado debe ser abordada con seguridad técnica. Al no existir una API pública, la Sincronización Inteligente desarrollada por Orion Technology es el estándar de oro profesional: un proceso de importación supervisado que trata su información como un activo de alta seguridad. Esto permite que la profesional mantenga su flujo de agendamiento externo mientras centraliza toda su inteligencia clínica en una plataforma propia, escalable y robusta.",
  commercial: {
    total: "16.0 UF + IVA",
    time: "30 días de corrido para la entrega llave en mano.",
    payment: [
      "50% Inicial (8.0 UF + IVA): Formaliza el inicio del proyecto, diseño de la arquitectura de datos y despliegue del Core.",
      "50% Final (8.0 UF + IVA): Contra entrega final, puesta en marcha en producción y capacitación básica de uso."
    ],
    warranty: "Pago aceptado mediante Tarjeta de Crédito. Facturación electrónica emitida por Orion Technology. Soporte técnico integral gratuito durante 6 meses ante cualquier anomalía de software."
  }
};
