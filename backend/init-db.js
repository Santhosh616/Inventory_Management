const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const Movement = require('./models/Movement');

// Initialize database
const initDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string format:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
    
    // Connect to MongoDB with increased timeout
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('MongoDB connected successfully');

    // Create indexes
    await Promise.all([
      Product.collection.createIndex({ sku: 1 }, { unique: true }),
      Product.collection.createIndex({ name: 1 }),
      Movement.collection.createIndex({ createdAt: -1 }),
      Movement.collection.createIndex({ product: 1 }),
      Supplier.collection.createIndex({ name: 1 })
    ]);

    console.log('Database indexes created successfully');

    // Add sample data if database is empty
    const productCount = await Product.countDocuments();
    const supplierCount = await Supplier.countDocuments();

    if (productCount === 0 && supplierCount === 0) {
      // Add sample supplier
      const supplier = await Supplier.create({
        name: 'Sample Supplier',
        contactEmail: 'supplier@example.com',
        phone: '123-456-7890',
        address: '123 Sample St'
      });

      // Add sample product
      const product = await Product.create({
        sku: 'SAMPLE001',
        name: 'Sample Product',
        description: 'This is a sample product',
        price: 19.99,
        category: 'Sample Category',
        minStock: 10,
        currentStock: 20,
        supplier: supplier._id
      });

      // Add sample movement (field names match Movement schema)
      await Movement.create({
        product: product._id,
        change_qty: 20,
        type: 'IN',
        note: 'Initial stock'
      });

      console.log('Sample data created successfully');
    }

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Run the initialization
initDB();