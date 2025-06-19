const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        service: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                serviceType: true,
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          }
        }
      }
    });
    
    console.log('Bookings in database:', bookings.length);
    console.log('Bookings:', JSON.stringify(bookings, null, 2));
    
    const services = await prisma.service.findMany({
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            serviceType: true,
          }
        }
      }
    });
    
    console.log('\nServices in database:', services.length);
    console.log('Services:', JSON.stringify(services, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookings(); 