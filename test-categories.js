import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('Checking database connection...');
    const count = await prisma.category.count();
    console.log('Categories in DB:', count);
    
    if (count > 0) {
      const cats = await prisma.category.findMany({ take: 5 });
      console.log('Categories:', cats);
    } else {
      console.log('No categories found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();