// Run this script once to update existing services
import { prisma } from "@/lib/prisma";

async function migrateImageUrls() {
  console.log('Starting image URL migration...');
  
  try {
    // Find all services with old-style image URLs
    const services = await prisma.service.findMany({
      where: {
        imageUrl: {
          startsWith: '/uploads/'
        }
      }
    });
    
    console.log(`Found ${services.length} services to migrate`);
    
    for (const service of services) {
      if (service.imageUrl) {
        const newUrl = service.imageUrl.replace('/uploads/', '/api/uploads/');
        
        await prisma.service.update({
          where: { id: service.id },
          data: { imageUrl: newUrl }
        });
        
        console.log(`Updated service ${service.id}: ${service.imageUrl} -> ${newUrl}`);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateImageUrls(); 