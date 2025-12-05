const express = require('express');
const db = require('../database');
const { authMiddleware } = require('./authMiddleware');

const router = express.Router();

// Buyer clicks "Buy" for a product
router.post('/', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'productId is required' });
  }

  if (userRole !== 'buyer') {
    return res
      .status(403)
      .json({ message: 'Only buyers can purchase products' });
  }

  // Find product and seller
  db.get(
    `SELECT id, seller_id FROM products WHERE id = ?`,
    [productId],
    (err, product) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to find product' });
      }
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const sellerId = product.seller_id;

      db.run(
        `INSERT INTO purchases (buyer_id, seller_id, product_id) VALUES (?, ?, ?)`,
        [userId, sellerId, productId],
        function (err2) {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ message: 'Failed to create purchase' });
          }

          // Increase purchase_count on product
          db.run(
            `UPDATE products SET purchase_count = purchase_count + 1 WHERE id = ?`,
            [productId],
            function (err3) {
              if (err3) {
                console.error(err3);
                return res
                  .status(500)
                  .json({ message: 'Purchase saved, but failed to update count' });
              }

              res.json({ message: 'Purchase successful' });
            }
          );
        }
      );
    }
  );
});

module.exports = router;