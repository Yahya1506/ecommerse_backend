/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client'; // adjust if your path differs
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ---- USERS ----
  const users = await prisma.user.createMany({
    data: [
      { fname: 'Alice', lname: 'Johnson', email: 'alice@example.com', password: 'hashedpass1' },
      { fname: 'Bob', lname: 'Smith', email: 'bob@example.com', password: 'hashedpass2' },
      { fname: 'Charlie', lname: 'Brown', email: 'charlie@example.com', password: 'hashedpass3' },
      { fname: 'Diana', lname: 'White', email: 'diana@example.com', password: 'hashedpass4' },
      { fname: 'Ethan', lname: 'Lee', email: 'ethan@example.com', password: 'hashedpass5' },
    ],
  });
  console.log('✅ Users inserted');

  // ---- CATEGORIES ----
  const categories = await prisma.catagory.createMany({
    data: [
      { cat_name: 'Mobiles' },
      { cat_name: 'Laptops' },
      { cat_name: 'Headphones' },
      { cat_name: 'Smartwatches' },
      { cat_name: 'Monitors' },
    ],
  });
  console.log('✅ Categories inserted');

  // Retrieve category IDs
  const cats = await prisma.catagory.findMany();

  // ---- PRODUCTS ----
  const productsData = [
    { name: 'iPhone 17', cat_id: cats.find(c => c.cat_name === 'Mobiles')!.id, price: 1199, stock: 10, description: 'Latest Apple iPhone with A18 chip.' },
    { name: 'Samsung Galaxy S25', cat_id: cats.find(c => c.cat_name === 'Mobiles')!.id, price: 999, stock: 15, description: 'Flagship Android device with advanced camera.' },
    { name: 'MacBook Pro 16"', cat_id: cats.find(c => c.cat_name === 'Laptops')!.id, price: 2499, stock: 8, description: 'High-performance laptop for professionals.' },
    { name: 'Dell XPS 15', cat_id: cats.find(c => c.cat_name === 'Laptops')!.id, price: 1999, stock: 12, description: 'Sleek and powerful Windows laptop.' },
    { name: 'Sony WH-1000XM5', cat_id: cats.find(c => c.cat_name === 'Headphones')!.id, price: 399, stock: 30, description: 'Noise-cancelling over-ear headphones.' },
    { name: 'Apple Watch Series 10', cat_id: cats.find(c => c.cat_name === 'Smartwatches')!.id, price: 499, stock: 25, description: 'Health and fitness tracking smartwatch.' },
    { name: 'Samsung Odyssey G9', cat_id: cats.find(c => c.cat_name === 'Monitors')!.id, price: 1499, stock: 7, description: 'Ultra-wide curved gaming monitor.' },
  ];

  const products = await prisma.product.createMany({ data: productsData });
  console.log('✅ Products inserted');

  // ---- IMAGES ----
  const productList = await prisma.product.findMany();

  await prisma.image.createMany({
    data: productList.map(p => ({
      path: `/images/${p.name.replace(/\s+/g, '_').toLowerCase()}.jpg`,
      product_id: p.id,
    })),
  });
  console.log('✅ Images inserted');

  // ---- FEEDBACK ----
  const feedbackData = [
    { user_id: 1, product_id: productList[0].id, rating: 5.0, review: 'Absolutely love it!' },
    { user_id: 2, product_id: productList[0].id, rating: 4.5, review: 'Great phone but expensive.' },
    { user_id: 3, product_id: productList[1].id, rating: 4.0, review: 'Very solid Android experience.' },
    { user_id: 4, product_id: productList[2].id, rating: 4.8, review: 'Perfect for my work!' },
    { user_id: 5, product_id: productList[4].id, rating: 4.9, review: 'Best noise cancellation ever.' },
    { user_id: 1, product_id: productList[3].id, rating: 4.2, review: 'Great display and battery.' },
    { user_id: 2, product_id: productList[5].id, rating: 5.0, review: 'Amazing smartwatch features.' },
    { user_id: 3, product_id: productList[6].id, rating: 4.6, review: 'Insane display quality!' },
  ];

  await prisma.feedback.createMany({ data: feedbackData });
  console.log('✅ Feedbacks inserted');

  console.log('🌳 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
