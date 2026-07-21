import * as admin from 'firebase-admin';
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

const PROPOSAL_ID = 'c5227ced-4db5-495e-9dcb-f245a47605a2';

async function update() {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.error('❌ Variables de entorno de Firebase no encontradas.');
      process.exit(1);
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  const db = admin.firestore();
  const docRef = db.collection('proposals').doc(PROPOSAL_ID);
  const doc = await docRef.get();

  if (!doc.exists) {
    console.error('❌ Propuesta no encontrada');
    process.exit(1);
  }

  const data = doc.data()!;
  const content = JSON.parse(data.content);

  // Actualizar campos
  content.subtitle = 'Migración a React, Centralización de Inventario en Rancagua, Machalí y Graneros, Perfiles de Mascotas con Sugerencias Inteligentes, y Arquitectura Preparada para FACTO';

  content.introObjectives = content.introObjectives.replace(
    'La presente propuesta tiene como objetivo reemplazar por completo su sitio web actual por un ecosistema digital moderno construido en React y Next.js, complementado con un sistema de gestión retail que unifique la operación de ambas sucursales en tiempo real. Buscamos que la tecnología trabaje en segundo plano para que usted y su equipo puedan enfocarse en lo que mejor hacen: entregar amor y salud a las mascotas de la región.',
    'La presente propuesta tiene como objetivo reemplazar por completo su sitio web actual por un ecosistema digital moderno construido en React y Next.js, complementado con un sistema de gestión retail que unifique la operación de ambas sucursales en tiempo real. Actualmente cuentan con un catálogo de más de 60 productos de marcas reconocidas como Royal Canin, ProPlan, Acana, Natural Food, Dog Chow y muchas más, los cuales serán migrados manteniendo toda su información, precios, imágenes y variantes sin pérdida de datos. Buscamos que la tecnología trabaje en segundo plano para que usted y su equipo puedan enfocarse en lo que mejor hacen: entregar amor y salud a las mascotas de la región.'
  );

  content.introObjectives = content.introObjectives.replace(
    '**Centralizar la operación dual:** Unificar Rancagua y Machalí en un solo sistema con stock independiente visible al instante, más transferencias ágiles entre locales.',
    '**Centralizar la operación multi-sucursal:** Unificar Rancagua, Machalí y Graneros en un solo sistema con stock independiente visible al instante, más transferencias ágiles entre locales.'
  );

  // Actualizar módulo 1.1
  if (content.developmentGroups?.[0]?.modules?.[0]) {
    content.developmentGroups[0].modules[0].description = content.developmentGroups[0].modules[0].description.replace(
      'El catálogo de productos será dinámico',
      'Incluye la migración completa del catálogo actual de WooCommerce (productos, categorías, precios, imágenes, variantes y stock) para que nada se pierda en la transición. El catálogo de productos será dinámico'
    ).replace(
      'el stock disponible en Rancagua y Machalí',
      'el stock disponible en Rancagua, Machalí y Graneros'
    );
  }

  // Actualizar módulo 2.2 (Webpay)
  if (content.developmentGroups?.[1]?.modules?.[1]) {
    content.developmentGroups[1].modules[1].description = content.developmentGroups[1].modules[1].description.replace(
      'Incluye: registro de ventas',
      'La integración con Webpay Plus se mantendrá exactamente igual a la actual para que los clientes no noten cambios en su experiencia de pago. Incluye: registro de ventas'
    );
  }

  // Actualizar módulo 2.3 (Despachos) - Rancagua y Machalí → Rancagua, Machalí y Graneros
  if (content.developmentGroups?.[1]?.modules?.[2]) {
    content.developmentGroups[1].modules[2].description = content.developmentGroups[1].modules[2].description.replace(
      'Rancagua y Machalí',
      'Rancagua, Machalí y Graneros'
    );
  }

  // Actualizar diferenciador A
  if (content.differentiators?.[0]) {
    content.differentiators[0].description = content.differentiators[0].description.replace(
      '"10 unidades en Rancagua, 20 en Machalí"',
      '"10 unidades en Rancagua, 20 en Machalí, 5 en Graneros"'
    ).replace(
      'Esto elimina las llamadas telefónicas',
      'Ninguna otra tienda de mascotas en la Región de O\'Higgins ofrece esta funcionalidad, lo que los posiciona como la opción más moderna y conveniente para los dueños de mascotas. Esto elimina las llamadas telefónicas'
    );
  }

  // Actualizar tags
  const newTags = ['e-commerce', 'pet-shop', 'multi-sucursal', 'FACTO', 'Rancagua', 'Machalí', 'Graneros'];

  await docRef.update({
    content: JSON.stringify(content),
    tags: newTags,
    title: content.title,
    clientName: content.clientName,
  });

  console.log('✅ Propuesta actualizada exitosamente');
  console.log(`   ID: ${PROPOSAL_ID}`);
  console.log(`   Cliente: ${content.clientName}`);
  console.log(`   Link: https://www.oriontechnology.cl/p/${PROPOSAL_ID}`);
  console.log(`   Tags: ${newTags.join(', ')}`);

  process.exit(0);
}

update().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
