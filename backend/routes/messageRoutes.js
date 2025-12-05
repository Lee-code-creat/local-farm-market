const express = require('express');
const db = require('../database');
const { authMiddleware } = require('./authMiddleware');

const router = express.Router();

// Get messages for a product
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ message: 'productId is required' });
  }

  db.all(
    `
    SELECT m.*, u.email AS sender_email
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.product_id = ?
      AND (m.buyer_id = ? OR m.seller_id = ?)
    ORDER BY m.created_at ASC
  `,
    [productId, userId, userId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch messages' });
      }
      res.json(rows);
    }
  );
});

// Post a message
router.post('/', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role; // 'buyer' or 'seller'
  const { productId, content } = req.body;

  if (!productId || !content) {
    return res
      .status(400)
      .json({ message: 'productId and content are required' });
  }

  db.get(
    `SELECT seller_id FROM products WHERE id = ?`,
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

      if (userRole !== 'buyer' && userRole !== 'seller') {
        return res
          .status(403)
          .json({ message: 'Only buyers or sellers can send messages' });
      }

      db.get(
        `
        SELECT buyer_id, seller_id
        FROM messages
        WHERE product_id = ?
        LIMIT 1
      `,
        [productId],
        (err2, existing) => {
          if (err2) {
            console.error(err2);
            return res
              .status(500)
              .json({ message: 'Failed to check existing conversation' });
          }

          let buyerId;

          if (!existing) {
            // First message must be from buyer
            if (userRole !== 'buyer') {
              return res.status(403).json({
                message: 'The first message must be sent by a buyer.',
              });
            }
            buyerId = userId;
          } else {
            buyerId = existing.buyer_id;
            if (userId !== buyerId && userId !== existing.seller_id) {
              return res.status(403).json({
                message: 'You are not a participant in this conversation.',
              });
            }
          }

          db.run(
            `
            INSERT INTO messages
              (product_id, buyer_id, seller_id, sender_id, sender_role, content)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
            [productId, buyerId, sellerId, userId, userRole, content],
            function (err3) {
              if (err3) {
                console.error(err3);
                return res
                  .status(500)
                  .json({ message: 'Failed to send message' });
              }

              res.json({ message: 'Message sent', messageId: this.lastID });
            }
          );
        }
      );
    }
  );
});

module.exports = router;