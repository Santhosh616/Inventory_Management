const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Stock = require('../models/Stock');
const Movement = require('../models/Movement');

// Get dashboard summary
router.get('/api/dashboard', async (req, res) => {
  try {
    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get low stock items
    const lowStockItems = await Product.aggregate([
      {
        $lookup: {
          from: 'stocks',
          localField: '_id',
          foreignField: 'product',
          as: 'stock'
        }
      },
      {
        $match: {
          $expr: {
            $lte: [
              { $ifNull: [{ $arrayElemAt: ['$stock.quantity', 0] }, 0] },
              '$min_stock'
            ]
          }
        }
      },
      { $count: 'total' }
    ]);
    const lowStockCount = lowStockItems.length > 0 ? lowStockItems[0].total : 0;

    // Get total suppliers
    const totalSuppliers = await Supplier.countDocuments();

    // Get total inventory value
    const valueResult = await Product.aggregate([
      {
        $lookup: {
          from: 'stocks',
          localField: '_id',
          foreignField: 'product',
          as: 'stock'
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: [
                { $ifNull: [{ $arrayElemAt: ['$stock.quantity', 0] }, 0] },
                '$price'
              ]
            }
          }
        }
      }
    ]);
    const totalValue = valueResult.length > 0 ? valueResult[0].total : 0;

    // Get recent transactions
    const recentTransactions = await Movement.find()
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get stock history (last 7 days) - simplified
    const stockHistory = await Stock.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          value: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id': -1 } },
      { $limit: 7 }
    ]);

    // Get category distribution
    const categoryDistribution = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    // Get low stock products
    const lowStockProducts = await Product.aggregate([
      {
        $lookup: {
          from: 'stocks',
          localField: '_id',
          foreignField: 'product',
          as: 'stock'
        }
      },
      {
        $match: {
          $expr: {
            $lte: [
              { $ifNull: [{ $arrayElemAt: ['$stock.quantity', 0] }, 0] },
              '$min_stock'
            ]
          }
        }
      },
      {
        $project: {
          name: 1,
          currentStock: { $ifNull: [{ $arrayElemAt: ['$stock.quantity', 0] }, 0] },
          minStock: '$min_stock'
        }
      }
    ]);

    res.json({
      summary: {
        totalProducts,
        lowStockItems: lowStockCount,
        totalSuppliers,
        totalValue
      },
      stockHistory: stockHistory.map(item => ({
        date: item._id,
        value: item.value
      })),
      recentTransactions: recentTransactions.map(t => ({
        ...t,
        date: t.createdAt,
        productName: t.product.name
      })),
      categoryDistribution,
      lowStockProducts
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
