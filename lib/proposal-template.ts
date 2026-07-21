import { ProposalContent } from './proposal-helpers';

export const defaultProposalTemplate: ProposalContent = {
  authorName: 'Piero Abarca',
  authorRole: 'Arquitecto de Software y Desarrollador Fullstack',
  title: 'Transformación Digital: Ecosistema E-commerce y Sistema de Gestión Retail Multi-Sucursal',
  subtitle: 'Migración a React, Centralización de Inventario en Rancagua, Machalí y Graneros, Perfiles de Mascotas con Sugerencias Inteligentes, y Arquitectura Preparada para FACTO',
  clientName: 'Maskota Center',
  introObjectives: `Maskota Center ha construido una marca sólida en la Región de O'Higgins, consolidándose como un centro de bienestar para mascotas con presencia en Rancagua y Machalí. Sin embargo, su plataforma actual en WordPress con Elementor presenta limitaciones técnicas que frenan su crecimiento: velocidad de carga reducida, nula integración entre sus dos sucursales, y la imposibilidad de ofrecer una experiencia personalizada a sus clientes.

La presente propuesta tiene como objetivo reemplazar por completo su sitio web actual por un ecosistema digital moderno construido en React y Next.js, complementado con un sistema de gestión retail que unifique la operación de ambas sucursales en tiempo real. Actualmente cuentan con un catálogo de más de 60 productos de marcas reconocidas como Royal Canin, ProPlan, Acana, Natural Food, Dog Chow y muchas más, los cuales serán migrados manteniendo toda su información, precios, imágenes y variantes sin pérdida de datos. Buscamos que la tecnología trabaje en segundo plano para que usted y su equipo puedan enfocarse en lo que mejor hacen: entregar amor y salud a las mascotas de la región.

**Objetivos del proyecto:**

**Centralizar la operación multi-sucursal:** Unificar Rancagua, Machalí y Graneros en un solo sistema con stock independiente visible al instante, más transferencias ágiles entre locales.

**Fidelizar mediante datos concretos:** Cada mascota registrada con su especie, raza, peso, edad y fotografía activará un motor de sugerencias que anticipa las necesidades del cliente y facilita la recompra.

**Preparar el negocio para el futuro:** Dejar la arquitectura lista para conectar con la API de FACTO cuando esté disponible, evitando tener que reescribir código más adelante.

**Modernizar la experiencia de compra:** Un catálogo rápido, diseño adaptable a cualquier dispositivo, Webpay Plus integrado, y despachos configurables por comuna.`,
  developmentGroups: [
    {
      title: 'Fase 1: Nueva Web Premium',
      description: 'Doce días hábiles para reemplazar completamente WordPress por una aplicación web moderna en React y Next.js, sentando las bases técnicas para todas las funcionalidades posteriores.',
      modules: [
        {
          name: 'Migración a React SPA',
          description: 'Reemplazaremos completamente el sitio actual construido en WordPress y Elementor por una aplicación web moderna desarrollada en React con Next.js. Esto mejora drásticamente la velocidad de carga —pasando de recargas de página completas a una navegación instantánea— y sienta las bases técnicas para todas las funcionalidades posteriores. Incluye la migración completa del catálogo actual de WooCommerce (productos, categorías, precios, imágenes, variantes y stock) para que nada se pierda en la transición. El catálogo de productos será dinámico y estará sincronizado en tiempo real con el inventario de ambas sucursales. Cada ficha de producto mostrará información detallada y el stock disponible en Rancagua, Machalí y Graneros de forma separada. Los clientes podrán buscar productos por nombre, categoría, especie o raza, y el diseño será completamente responsivo, adaptándose perfectamente a celulares, tablets y computadores.',
          investment: '2 UF',
        },
        {
          name: 'Perfiles de Mascotas (Pet Dashboard)',
          description: 'Implementaremos un sistema de registro y autenticación de clientes que permitirá a cada usuario crear una cuenta personal. Dentro de su perfil, podrán agregar una o más mascotas con los siguientes datos: especie, raza, peso actual, fecha de nacimiento o edad, y fotografía de perfil almacenada de forma segura en la base de datos en formato Base64. Cada mascota quedará asociada al historial de compras del cliente, permitiendo al sistema ofrecer recomendaciones precisas basadas en el tipo de animal y sus productos adquiridos previamente. Este módulo transforma una simple tienda online en una experiencia personalizada donde el cliente siente que la plataforma conoce a su compañero de cuatro patas.',
          investment: '1.5 UF',
        },
        {
          name: 'Motor de Sugerencias Inteligentes',
          description: 'El sistema analizará los datos registrados de cada mascota —especialmente su peso, raza y edad— para calcular automáticamente la duración estimada del alimento que el cliente compró. Cuando detecte que el producto está por agotarse, generará alertas visibles tanto para el cliente en su sesión como para el equipo de Maskota Center en el panel administrativo. Por ejemplo: si un cliente registró un Pastor Alemán de 25 kg y compró un saco de 15 kg, el sistema calculará que el alimento dura aproximadamente 20 días. Al cumplirse 15 días, mostrará una sugerencia. Este módulo también incluye recomendaciones de productos complementarios basados en compras anteriores y en el perfil de la mascota, aumentando el ticket promedio de cada venta.',
          investment: '1.5 UF',
        },
      ],
      subtotal: '5 UF',
      timeline: '12 días hábiles',
    },
    {
      title: 'Fase 2: Sistema de Gestión Retail',
      description: 'Trece días hábiles para desarrollar el núcleo operativo que unificará la gestión de ambas sucursales, el punto de venta, los despachos y la preparación para la integración con FACTO.',
      modules: [
        {
          name: 'Inventario Multi-Sucursal con Transferencias',
          description: 'Desarrollaremos un sistema de inventario que maneje de forma independiente el stock de cada sucursal (Rancagua y Machalí), pero con la flexibilidad de realizar transferencias entre locales con un solo clic. El panel administrativo mostrará una vista unificada con el detalle de cada sucursal: stock en Rancagua, stock en Machalí, y total disponible. Cuando un producto se vende en una sucursal, el stock se descuenta automáticamente de esa ubicación. Si el inventario de una sucursal está bajo, el sistema activará alertas visuales para que los dueños puedan transferir productos desde el otro local o realizar un pedido a proveedores. El sistema será compatible con pistolas de código de barras y permitirá configurar alertas de stock crítico personalizadas por producto.',
          investment: '2 UF',
        },
        {
          name: 'Omni-POS y Webpay Plus',
          description: 'Unificaremos la experiencia de venta física y online en una sola interfaz intuitiva. El Punto de Venta (POS) estará diseñado para ser operado por los dos dueños simultáneamente, cada uno desde su sucursal, sin conflictos de sesión ni pérdida de datos. La integración con Webpay Plus se mantendrá exactamente igual a la actual para que los clientes no noten cambios en su experiencia de pago. Incluye: registro de ventas con búsqueda rápida de productos, lectura de código de barras para agilizar el cobro, integración con Webpay Plus para pagos con tarjeta de crédito y débito (online y presencial), arqueo de caja automático con detalle completo de efectivo, Webpay y transferencias, e historial de ventas por sucursal. Cuando se realiza una venta online, el sistema descuenta el stock de la sucursal seleccionada por el cliente y prepara automáticamente la orden para despacho.',
          investment: '1.5 UF',
        },
        {
          name: 'Gestión de Despachos y Arquitectura FACTO Ready',
          description: 'Los dueños podrán configurar desde el panel las comunas a las que realizan envíos (Rancagua, Machalí y Graneros) y asignar un precio de despacho por cada una. El cliente, al momento de comprar, seleccionará su comuna y el sistema calculará automáticamente el costo de envío. Las reglas de despacho serán totalmente configurables: monto mínimo para despacho gratuito, horarios de corte para Same-Day Delivery, y zonas prioritarias. En cuanto a FACTO, Maskota Center utiliza actualmente esta plataforma para su facturación electrónica a través de su sitio web, sin acceso a API. Nuestra arquitectura contempla dejar preparado un módulo de integración listo para conectar con la API REST de FACTO en el momento en que ustedes obtengan las credenciales de acceso. Esto significa que el sistema se construye con los endpoints de integración ya definidos, cuando FACTO active su API la conexión se realiza en cuestión de horas, no será necesario reescribir ni modificar el código existente, y mientras tanto el sistema funciona de forma completamente autónoma.',
          investment: '1.5 UF',
        },
      ],
      subtotal: '5 UF',
      timeline: '13 días hábiles',
    },
  ],
  comparativeAnalysis: '',
  integration: '',
  differentiators: [
    {
      label: 'A',
      title: 'Inventario Visible en Tiempo Real — Sin Conjeturas',
      description: 'Los clientes verán exactamente cuántos productos hay disponibles en cada sucursal directamente desde la web: "10 unidades en Rancagua, 20 en Machalí, 5 en Graneros". Si una sucursal no tiene stock, el sistema sugerirá automáticamente la otra ubicación o la opción de despacho a domicilio. Ninguna otra tienda de mascotas en la Región de O\'Higgins ofrece esta funcionalidad, lo que los posiciona como la opción más moderna y conveniente para los dueños de mascotas. Esto elimina las llamadas telefónicas para consultar disponibilidad y mejora la tasa de conversión.',
    },
    {
      label: 'B',
      title: 'CRM Predictivo — El Sistema que Vende por Usted',
      description: 'El motor de sugerencias no solo recomienda productos: aprende del comportamiento de cada cliente y genera oportunidades de venta de forma autónoma. Cuando una mascota está por quedarse sin alimento, el sistema alerta al equipo de Maskota Center para que contacte al cliente antes de que busque opciones en la competencia. Este modelo de negocio convierte la fidelización en ingresos recurrentes y predecibles.',
    },
    {
      label: 'C',
      title: 'FACTO Ready — Inversión Protegida',
      description: 'Cuando FACTO les otorgue acceso a su API, la integración será inmediata. No tendrán que pagar por un desarrollo adicional ni modificar nada de lo que estamos construyendo. Esto protege su inversión y asegura que el sistema evolucione junto con las necesidades del negocio.',
    },
  ],
  marketing: [],
  mockups: [],
  tags: ['e-commerce', 'pet-shop', 'multi-sucursal', 'FACTO', 'Rancagua', 'Machalí', 'Graneros'],
  commercial: {
    total: '10 UF + IVA',
    timeline: '25 días hábiles (12 días Fase 1 + 13 días Fase 2)',
    payment: [
      {
        percentage: '50%',
        description: 'Al inicio del proyecto',
        amount: '5 UF',
      },
      {
        percentage: '50%',
        description: 'Contra entrega final',
        amount: '5 UF',
      },
    ],
    intellectualProperty: 'El código fuente y la base de datos pertenecen al 100% a Maskota Center. Sin costos de licencia ni suscripciones obligatorias.',
    warranty: '6 meses de soporte técnico integral gratuito ante cualquier anomalía de software. Incluye capacitación presencial del equipo en ambas sucursales. Aceptamos tarjeta de crédito y transferencia. Emitimos factura electrónica por el total del servicio.',
  },
};
