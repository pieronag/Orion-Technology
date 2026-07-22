export type DiagnosisItem = {
  id: string;
  label: string;
  type: 'check' | 'text' | 'value';
};

export type DiagnosisTemplate = {
  id: string;
  title: string;
  equipmentTypes: string[];
  items: DiagnosisItem[];
};

export const DIAGNOSIS_TEMPLATES: DiagnosisTemplate[] = [
  {
    id: 'pc-no-encender',
    title: 'PC — No enciende',
    equipmentTypes: ['pc'],
    items: [
      { id: 'pc-ne-1', label: 'Fuente de poder: ¿hace clic? ¿ventilador gira?', type: 'check' },
      { id: 'pc-ne-2', label: 'Botón de encendido del gabinete funcional', type: 'check' },
      { id: 'pc-ne-3', label: 'LED placa madre enciende (standby)', type: 'check' },
      { id: 'pc-ne-4', label: 'RAM: probar con 1 banco, cambiar slots', type: 'check' },
      { id: 'pc-ne-5', label: 'Descartar corto (test fuera del gabinete)', type: 'check' },
      { id: 'pc-ne-6', label: 'CMOS reset', type: 'check' },
      { id: 'pc-ne-7', label: 'Probador de fuente (tester / multímetro)', type: 'text' },
    ],
  },
  {
    id: 'pc-lento',
    title: 'PC — Lento / rendimiento',
    equipmentTypes: ['pc'],
    items: [
      { id: 'pc-l-1', label: 'Temperatura CPU/GPU en reposo', type: 'value' },
      { id: 'pc-l-2', label: 'Uso de disco al 100% (Task Manager)', type: 'check' },
      { id: 'pc-l-3', label: 'RAM suficiente para el uso', type: 'check' },
      { id: 'pc-l-4', label: 'Arranque: programas en startup', type: 'check' },
      { id: 'pc-l-5', label: 'Estado del disco: SMART saludable?', type: 'text' },
      { id: 'pc-l-6', label: 'Tipo de almacenamiento (HDD vs SSD)', type: 'check' },
      { id: 'pc-l-7', label: 'Malware / antivirus desactualizado', type: 'check' },
      { id: 'pc-l-8', label: 'Drivers de video/chipset actualizados', type: 'check' },
    ],
  },
  {
    id: 'nb-pantalla',
    title: 'Notebook — Pantalla dañada',
    equipmentTypes: ['notebook'],
    items: [
      { id: 'nb-p-1', label: '¿Rota físicamente (vidrio quebrado)?', type: 'check' },
      { id: 'nb-p-2', label: '¿Líneas verticales/horizontales?', type: 'check' },
      { id: 'nb-p-3', label: '¿Pantalla en negro pero se ve con linterna? (backlight)', type: 'check' },
      { id: 'nb-p-4', label: '¿Funciona en monitor externo? (descartar placa)', type: 'check' },
      { id: 'nb-p-5', label: '¿Pixel muerto o quemadura?', type: 'check' },
      { id: 'nb-p-6', label: 'Flex cable dañado (abre/cierra la tapa)', type: 'check' },
    ],
  },
  {
    id: 'nb-no-encender',
    title: 'Notebook — No enciende',
    equipmentTypes: ['notebook'],
    items: [
      { id: 'nb-ne-1', label: '¿Cargador conectado? LED de carga enciende?', type: 'check' },
      { id: 'nb-ne-2', label: 'Desconectar batería, probar solo con cargador', type: 'check' },
      { id: 'nb-ne-3', label: 'Mantener botón power 30s (descarga residual)', type: 'check' },
      { id: 'nb-ne-4', label: 'RAM: probar socket/slots', type: 'check' },
      { id: 'nb-ne-5', label: 'Reset CMOS (batería interna)', type: 'check' },
      { id: 'nb-ne-6', label: 'Voltaje en conector de carga', type: 'value' },
    ],
  },
  {
    id: 'ps4-no-encender',
    title: 'PS4/PS5 — No enciende',
    equipmentTypes: ['console'],
    items: [
      { id: 'ps-ne-1', label: '¿LED azul/blanco parpadea?', type: 'check' },
      { id: 'ps-ne-2', label: 'Fuente interna: voltajes?', type: 'text' },
      { id: 'ps-ne-3', label: 'HDMI retimer / IC de video', type: 'check' },
      { id: 'ps-ne-4', label: 'Disco duro: desconectar y ver si llega a logo', type: 'check' },
      { id: 'ps-ne-5', label: 'Pasta térmica seca? (protección por sobrecalentamiento)', type: 'check' },
      { id: 'ps-ne-6', label: 'Polvo en fuente / ventilador trabado', type: 'check' },
    ],
  },
  {
    id: 'ps4-sobrecalentamiento',
    title: 'PS4/PS5 — Sobrecalentamiento / ruido',
    equipmentTypes: ['console'],
    items: [
      { id: 'ps-sc-1', label: 'Ventilador gira? velocidad normal?', type: 'check' },
      { id: 'ps-sc-2', label: 'Pasta térmica (estado / última vez)', type: 'text' },
      { id: 'ps-sc-3', label: 'Thermal pads en RAM / VRM', type: 'check' },
      { id: 'ps-sc-4', label: 'Polvo en disipador / heatsink obstruido', type: 'check' },
      { id: 'ps-sc-5', label: 'Ruido: coil whine vs ventilador roto vs HDD', type: 'text' },
      { id: 'ps-sc-6', label: 'Temperatura en reposo y bajo carga', type: 'value' },
    ],
  },
  {
    id: 'xbox-no-lee',
    title: 'Xbox — No lee discos',
    equipmentTypes: ['console'],
    items: [
      { id: 'xb-d-1', label: '¿El disco entra? ¿hace ruido al girar?', type: 'check' },
      { id: 'xb-d-2', label: 'Láser: ¿se mueve? ¿enciende led rojo?', type: 'check' },
      { id: 'xb-d-3', label: 'Banda de la bandeja (si es de bandeja)', type: 'check' },
      { id: 'xb-d-4', label: 'Disco rayado / sucio?', type: 'check' },
      { id: 'xb-d-5', label: 'Probar con disco conocido bueno', type: 'check' },
    ],
  },
  {
    id: 'switch-bateria',
    title: 'Switch — No carga / batería',
    equipmentTypes: ['console'],
    items: [
      { id: 'sw-b-1', label: 'Puerto USB/Type-C dañado? (revisar físico)', type: 'check' },
      { id: 'sw-b-2', label: 'Cable cargador original?', type: 'check' },
      { id: 'sw-b-3', label: 'Batería inflada? (hinchazón en la carcasa)', type: 'check' },
      { id: 'sw-b-4', label: 'IC de carga en placa', type: 'check' },
      { id: 'sw-b-5', label: 'Voltaje en batería con multímetro', type: 'value' },
    ],
  },
  {
    id: 'general-formateo',
    title: 'General — Formateo / Instalación SO',
    equipmentTypes: ['pc', 'notebook'],
    items: [
      { id: 'gf-1', label: 'Backup de datos del cliente (previo aviso)', type: 'check' },
      { id: 'gf-2', label: 'Licencia de Windows / Office (product key?)', type: 'text' },
      { id: 'gf-3', label: 'Drivers necesarios descargados previamente', type: 'check' },
      { id: 'gf-4', label: 'Particionado personalizado?', type: 'text' },
      { id: 'gf-5', label: 'Entrega: sin bloatware', type: 'check' },
    ],
  },
  {
    id: 'general-mantenimiento',
    title: 'General — Mantenimiento preventivo',
    equipmentTypes: ['pc', 'notebook'],
    items: [
      { id: 'gm-1', label: 'Limpieza interna (compresor / pincel)', type: 'check' },
      { id: 'gm-2', label: 'Cambio pasta térmica CPU + GPU (si aplica)', type: 'check' },
      { id: 'gm-3', label: 'Ventiladores: limpieza + lubricación si necesario', type: 'check' },
      { id: 'gm-4', label: 'Batería CMOS (si aplica)', type: 'check' },
      { id: 'gm-5', label: 'Prueba de estrés post-mantenimiento (30 min)', type: 'check' },
      { id: 'gm-6', label: 'Temperaturas finales registradas', type: 'value' },
    ],
  },
  {
    id: 'general-revision-consola',
    title: 'General — Revisión completa consola',
    equipmentTypes: ['console'],
    items: [
      { id: 'gr-1', label: 'Limpieza interna (polvo en fuente, disipador, ventilador)', type: 'check' },
      { id: 'gr-2', label: 'Cambio pasta térmica APU + thermal pads', type: 'check' },
      { id: 'gr-3', label: 'Prueba de conectividad WiFi / Bluetooth', type: 'check' },
      { id: 'gr-4', label: 'Prueba de lectura discos / digital', type: 'check' },
      { id: 'gr-5', label: 'Prueba de puertos USB / HDMI', type: 'check' },
      { id: 'gr-6', label: 'Temperatura bajo carga (30 min juego)', type: 'value' },
    ],
  },
];

export const EQUIPMENT_TYPES = [
  { id: 'pc', label: 'PC Escritorio' },
  { id: 'notebook', label: 'Notebook / Laptop' },
  { id: 'console', label: 'Consola' },
  { id: 'all-in-one', label: 'All-in-One' },
  { id: 'monitor', label: 'Monitor' },
  { id: 'tablet', label: 'Tablet / iPad' },
  { id: 'celular', label: 'Celular' },
  { id: 'other', label: 'Otro' },
];

export const WORK_ORDER_STATUSES = [
  { id: 'received', label: 'Recibido', color: '#3b82f6', icon: 'Package' },
  { id: 'diagnosing', label: 'Diagnosticando', color: '#f59e0b', icon: 'Search' },
  { id: 'quoted', label: 'Cotizado', color: '#8b5cf6', icon: 'FileText' },
  { id: 'approved', label: 'Aprobado', color: '#10b981', icon: 'CheckCircle2' },
  { id: 'repairing', label: 'Reparando', color: '#f97316', icon: 'Wrench' },
  { id: 'testing', label: 'Testing', color: '#06b6d4', icon: 'FlaskConical' },
  { id: 'ready', label: 'Listo', color: '#22c55e', icon: 'CheckCheck' },
  { id: 'delivered', label: 'Entregado', color: '#6b7280', icon: 'Truck' },
  { id: 'cancelled', label: 'Devuelto sin reparación', color: '#9ca3af', icon: 'XCircle' },
] as const;

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Efectivo' },
  { id: 'transfer', label: 'Transferencia' },
  { id: 'card', label: 'Tarjeta (débito/crédito)' },
  { id: 'other', label: 'Otro' },
] as const;
