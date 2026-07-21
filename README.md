# Orion Technology — Sistema de Gestión de Propuestas

Plataforma web para la creación, gestión y visualización de propuestas tecnológicas. Construida con Next.js, React, Firebase y TypeScript.

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 16 | Framework React con App Router |
| React 19 | UI |
| TypeScript 5 | Tipado |
| Firebase Firestore | Base de datos |
| Firebase Admin SDK | Backend (Server Actions) |
| JWT (jose) | Autenticación admin |
| bcrypt | Hash de contraseñas |
| date-fns | Manejo de fechas |
| html2canvas + jsPDF | Generación de PDF |
| @dnd-kit | Kanban drag & drop |
| qrcode.react | Códigos QR |
| lucide-react | Iconos |

## Estructura del Proyecto

```
app/
├── actions/          # Server Actions (auth, proposals)
├── api/              # API routes
├── dashboard/        # Panel admin (protegido)
│   ├── new/          # Crear propuesta
│   └── edit/[id]/    # Editar propuesta
├── login/            # Autenticación
├── p/[id]/           # Vista pública de propuestas
│   ├── page.tsx      # Server component
│   ├── ProposalClient.tsx    # Gate con contraseña
│   ├── ProposalRenderer.tsx  # Renderizado de propuesta
│   ├── ProposalPublicView.tsx # Vista sin contraseña
├── portfolio/        # Portafolio público
├── globals.css       # Estilos globales (modo claro)
├── layout.tsx        # Layout raíz
├── manifest.ts       # PWA manifest
└── page.tsx          # Landing page

components/
├── AnalyticsPanel.tsx      # Estadísticas del dashboard
├── KanbanBoard.tsx         # Tablero Kanban drag & drop
├── MarkdownInput.tsx       # Textarea con preview markdown
├── Navbar.tsx              # Navegación principal
├── NotificationBell.tsx    # Campana de notificaciones
├── PDFContent.tsx          # Versión imprimible A4 para PDF
├── ProposalActions.tsx     # Botones editar/duplicar/eliminar
└── ShareModal.tsx          # Modal compartir (QR + correo)

lib/
├── firebase-admin.ts       # Inicialización Firebase Admin
├── proposal-helpers.ts     # Tipos y helpers de migración
└── proposal-template.ts    # Template por defecto

scripts/
├── seed-maskota-proposal.ts    # Insertar propuesta en Firestore
└── update-maskota-proposal.ts  # Actualizar propuesta existente
```

## Comandos

```bash
npm run dev            # Desarrollo
npm run build          # Build producción
npm run start          # Iniciar producción
npm run seed           # Insertar propuesta Maskota Center en Firestore
npm run update-maskota # Actualizar propuesta Maskota Center
```

## Funcionalidades

### Dashboard Admin (`/dashboard`)
- Lista de propuestas con filtros por estado y tags
- Vista Kanban con drag & drop entre columnas
- Panel analítico con gráficos y tasas
- Notificaciones en tiempo real (polling 5s)
- Exportar CSV
- Compartir propuesta (QR, correo, copiar enlace)

### Creación/Edición (`/dashboard/new`, `/dashboard/edit/[id]`)
- Formulario completo con 10 bloques
- Grupos de desarrollo flexibles con módulos e inversión por UF
- Secciones opcionales (comparativo, integración, diferenciadores, marketing, mockups)
- Tags, notas internas, archivos adjuntos
- Historial de versiones con restauración
- Markdown preview en textarea
- Atajos de teclado (Ctrl+S, Escape)

### Vista Pública (`/p/[id]`)
- Acceso con contraseña (bcrypt)
- Vista sin contraseña opcional (toggle)
- Diseño tipo documento limpio, texto justificado
- Tablas responsivas (móvil: nombre+precio fila, descripción abajo)
- Firma digital: botón "Aceptar Propuesta"
- PDF generado con html2canvas + jsPDF
- Compartir por WhatsApp
- Galería de mockups con lightbox

### Autenticación
- Login con contraseña maestra
- JWT con expiración de 24h
- Middleware de protección de rutas

## Variables de Entorno

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Admin password
ADMIN_PASSWORD=

# JWT secret
JWT_SECRET=
```

## Seed

Para insertar la propuesta de Maskota Center en Firestore:

```bash
npm run seed
```

Propuesta creada con contraseña `maskota2026` y vigencia de 15 días.
