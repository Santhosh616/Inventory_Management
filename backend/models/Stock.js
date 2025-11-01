const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Ensure one stock document per product
stockSchema.index({ product: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);
