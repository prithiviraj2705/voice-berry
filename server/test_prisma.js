const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ take: 1 });
  console.log('Users:', users);
  
  const bookings = await prisma.booking.findMany({ take: 1, orderBy: { createdAt: 'desc' } });
  console.log('Bookings:', bookings);
}
main().catch(console.error).finally(() => prisma.$disconnect());
