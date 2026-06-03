import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Ștergerea tuturor comenzilor...');
  
  // Ștergem mai întâi order_items (dependență)
  const items = await prisma.orderItem.deleteMany({});
  console.log(`✅ Șterse ${items.count} order items`);
  
  // Apoi comenzile
  const orders = await prisma.order.deleteMany({});
  console.log(`✅ Șterse ${orders.count} comenzi`);
  
  // Verificare
  const remaining = await prisma.order.count();
  console.log(`📋 Comenzi rămase: ${remaining}`);
  
  await prisma.$disconnect();
  console.log('✅ Gata!');
}

main().catch(e => {
  console.error('Eroare:', e);
  process.exit(1);
});
