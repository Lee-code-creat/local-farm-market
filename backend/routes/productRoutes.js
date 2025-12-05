const express = require('express');
const db = require('../database');
const { authMiddleware } = require('./authMiddleware');

const router = express.Router();

// Create product (seller only)
router.post('/', authMiddleware, (req, res) => {
  const { title, description, price, image_url } = req.body;

  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can create products' });
  }

  if (!title || price == null) {
    return res
      .status(400)
      .json({ message: 'Title and price are required' });
  }

  db.run(
    `
    INSERT INTO products (title, description, price, image_url, seller_id)
    VALUES (?, ?, ?, ?, ?)
  `,
    [title, description, price, image_url, req.user.userId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to create product' });
      }
      res.json({ message: 'Product created', productId: this.lastID });
    }
  );
});

// Update product (seller + owner)
router.put('/:id', authMiddleware, (req, res) => {
  const productId = req.params.id;
  const { title, description, price, image_url } = req.body;

  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can update products' });
  }

  db.run(
    `
    UPDATE products
    SET title = ?, description = ?, price = ?, image_url = ?
    WHERE id = ? AND seller_id = ?
  `,
    [title, description, price, image_url, productId, req.user.userId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update product' });
      }

      if (this.changes === 0) {
        return res
          .status(403)
          .json({ message: 'You can only update your own products' });
      }

      res.json({ message: 'Product updated' });
    }
  );
});

// Delete product (seller + owner)
router.delete('/:id', authMiddleware, (req, res) => {
  const productId = req.params.id;

  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can delete products' });
  }

  db.run(
    `
    DELETE FROM products
    WHERE id = ? AND seller_id = ?
  `,
    [productId, req.user.userId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to delete product' });
      }

      if (this.changes === 0) {
        return res
          .status(403)
          .json({ message: 'You can only delete your own products' });
      }

      res.json({ message: 'Product deleted' });
    }
  );
});

// Get product list with optional sort
// sort = 'price_asc' | 'price_desc' | 'popular' | default
router.get('/', (req, res) => {
  const { sort } = req.query;

  let sql = 'SELECT * FROM products';
  const params = [];

  if (sort === 'price_asc') {
    sql += ' ORDER BY price ASC';
  } else if (sort === 'price_desc') {
    sql += ' ORDER BY price DESC';
  } else if (sort === 'popular') {
    sql += ' ORDER BY purchase_count DESC, id DESC';
  } else {
    sql += ' ORDER BY id DESC';
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch products' });
    }
    res.json(rows);
  });
});

module.exports = router;