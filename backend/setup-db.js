const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const Stock = require('./models/Stock');
const Movement = require('./models/Movement');

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Clear existing data
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    await Stock.deleteMany({});
    await Movement.deleteMany({});

    // Create sample suppliers
    const suppliers = await Supplier.insertMany([
      {
        name: 'Tech Supplies Inc.',
        contact_email: 'contact@techsupplies.com',
        phone: '+1-555-0101',
        address: '123 Tech Street, Silicon Valley, CA'
      },
      {
        name: 'Office Essentials Ltd.',
        contact_email: 'sales@officeessentials.com',
        phone: '+1-555-0202',
        address: '456 Office Blvd, Business District, NY'
      },
      {
        name: 'Global Electronics',
        contact_email: 'info@globalelectronics.com',
        phone: '+1-555-0303',
        address: '789 Electronics Ave, Tech City, TX'
      }
    ]);

    console.log('Suppliers created');

    // Create sample products
    const products = await Product.insertMany([
      {
        sku: 'LAPTOP001',
        name: 'Business Laptop',
        description: 'High-performance business laptop',
        price: 1200.00,
        category: 'Electronics',
        min_stock: 5,
        supplier: suppliers[0]._id
      },
      {
        sku: 'CHAIR001',
        name: 'Office Chair',
        description: 'Ergonomic office chair',
        price: 250.00,
        category: 'Furniture',
        min_stock: 10,
        supplier: suppliers[1]._id
      },
      {
        sku: 'MOUSE001',
        name: 'Wireless Mouse',
        description: 'Wireless optical mouse',
        price: 25.00,
        category: 'Electronics',
        min_stock: 20,
        supplier: suppliers[0]._id
      },
      {
        sku: 'PAPER001',
        name: 'A4 Paper',
        description: 'White A4 paper, 500 sheets',
        price: 5.00,
        category: 'Office Supplies',
        min_stock: 50,
        supplier: suppliers[1]._id
      },
      {
        sku: 'MONITOR001',
        name: '24" Monitor',
        description: '24-inch LED monitor',
        price: 180.00,
        category: 'Electronics',
        min_stock: 8,
        supplier: suppliers[2]._id
      }
    ]);

    console.log('Products created');

    // Create stock entries
    const stocks = await Stock.insertMany([
      { product: products[0]._id, quantity: 15 },
      { product: products[1]._id, quantity: 25 },
      { product: products[2]._id, quantity: 45 },
      { product: products[3]._id, quantity: 100 },
      { product: products[4]._id, quantity: 12 }
    ]);

    console.log('Stock entries created');

    // Create movement records
    await Movement.insertMany([
      {
        product: products[0]._id,
        change_qty: 15,
        type: 'IN',
        note: 'Initial stock'
      },
      {
        product: products[1]._id,
        change_qty: 25,
        type: 'IN',
        note: 'Initial stock'
      },
      {
        product: products[2]._id,
        change_qty: 45,
        type: 'IN',
        note: 'Initial stock'
      },
      {
        product: products[3]._id,
        change_qty: 100,
        type: 'IN',
        note: 'Initial stock'
      },
      {
        product: products[4]._id,
        change_qty: 12,
        type: 'IN',
        note: 'Initial stock'
      }
    ]);

    console.log('Movement records created');
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

const runSetup = async () => {
  await connectDB();
  await seedDatabase();
  process.exit(0);
};

runSetup();
