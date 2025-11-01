const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const Movement = require('../models/Movement');

// Get all products with their current stock levels
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('supplier', 'name')
      .sort('name')
      .lean();

    // Get stock for each product
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const stock = await Stock.findOne({ product: product._id }).lean();
        return {
          ...product,
          current_stock: stock ? stock.quantity : 0
        };
      })
    );

    res.json(productsWithStock);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a new product
router.post('/', async (req, res) => {
  const { name, description, price, quantity, supplier_id, min_stock, sku, category } = req.body;

  try {
    // Create product
    const product = new Product({
      name,
      description,
      price,
      min_stock,
      supplier: supplier_id,
      sku,
      category
    });

    const savedProduct = await product.save();

    // Create initial stock
    const stock = new Stock({
      product: savedProduct._id,
      quantity: quantity || 0
    });
    await stock.save();

    // Create movement record
    const movement = new Movement({
      product: savedProduct._id,
      change_qty: quantity || 0,
      type: 'IN',
      note: 'Initial stock'
    });
    await movement.save();

    res.status(201).json({ id: savedProduct._id, message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product stock
router.put('/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { quantity, type, note } = req.body;

  try {
    // Update stock atomically
    const updateValue = type === 'IN' ? quantity : -quantity;
    await Stock.findOneAndUpdate(
      { product: id },
      { $inc: { quantity: updateValue } },
      { new: true, upsert: true }
    );

    // Create movement record
    const movement = new Movement({
      product: id,
      change_qty: quantity,
      type,
      note
    });
    await movement.save();

    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

module.exports = router;