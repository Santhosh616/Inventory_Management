const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const Movement = require('../models/Movement');

// Get stock summary report
router.get('/stock-summary', async (req, res) => {
  try {
    const stockSummary = await Product.aggregate([
      {
        $lookup: {
          from: 'stocks',
          localField: '_id',
          foreignField: 'product',
          as: 'stock'
        }
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplier'
        }
      },
      {
        $project: {
          name: 1,
          sku: 1,
          category: 1,
          price: 1,
          min_stock: 1,
          current_stock: { $ifNull: [{ $arrayElemAt: ['$stock.quantity', 0] }, 0] },
          supplier_name: { $ifNull: [{ $arrayElemAt: ['$supplier.name', 0] }, 'N/A'] },
          status: {
            $cond: {
              if: {
                $lte: [
                  { $ifNull: [{ $arrayElemAt: ['$stock.quantity', 0] }, 0] },
                  '$min_stock'
                ]
              },
              then: 'Low Stock',
              else: 'In Stock'
            }
          }
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json(stockSummary);
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    res.status(500).json({ error: 'Failed to fetch stock summary' });
  }
});

// Get movement history
router.get('/movements', async (req, res) => {
  try {
    const { startDate, endDate, productId, type } = req.query;

    let matchConditions = {};

    if (startDate || endDate) {
      matchConditions.createdAt = {};
      if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
      if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
    }

    if (productId) matchConditions.product = productId;
    if (type) matchConditions.type = type;

    const movements = await Movement.find(matchConditions)
      .populate('product', 'name sku')
      .sort({ createdAt: -1 })
      .lean();

    res.json(movements);
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ error: 'Failed to fetch movements' });
  }
});

module.exports = router;
