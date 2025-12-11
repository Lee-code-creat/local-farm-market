const express = require("express");
const db = require("../database");
const { authMiddleware } = require("./authMiddleware");

require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const router = express.Router();

/**
 * Create a product (seller only) and store embedding for recommendations.
 */
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, price, image_url } = req.body;

  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Only sellers can create products" });
  }

  if (!title || price == null) {
    return res.status(400).json({ message: "Title and price are required" });
  }

  try {
    const text = `${title} ${description || ""}`;
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    const embedding = JSON.stringify(emb.data[0].embedding);

    db.run(
      `
        INSERT INTO products (title, description, price, image_url, seller_id, purchase_count, embedding)
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `,
      [title, description, price, image_url, req.user.userId, embedding],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to create product" });
        }
        res.json({ message: "Product created", productId: this.lastID });
      }
    );
  } catch (err) {
    console.error("Embedding error:", err);
    res.status(500).json({ message: "Embedding generation failed" });
  }
});

/**
 * Update product
 */
router.put("/:id", authMiddleware, (req, res) => {
  const productId = req.params.id;
  const { title, description, price, image_url } = req.body;

  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Only sellers can update products" });
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
        return res.status(500).json({ message: "Failed to update product" });
      }

      if (this.changes === 0) {
        return res.status(403).json({ message: "You can only update your own products" });
      }

      res.json({ message: "Product updated" });
    }
  );
});

/**
 * Delete product
 */
router.delete("/:id", authMiddleware, (req, res) => {
  const productId = req.params.id;

  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Only sellers can delete products" });
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
        return res.status(500).json({ message: "Failed to delete product" });
      }

      if (this.changes === 0) {
        return res.status(403).json({ message: "You can only delete your own products" });
      }

      res.json({ message: "Product deleted" });
    }
  );
});

/**
 * Product list with sort
 */
router.get("/", (req, res) => {
  const { sort } = req.query;

  let sql = "SELECT * FROM products";

  if (sort === "price_asc") {
    sql += " ORDER BY price ASC";
  } else if (sort === "price_desc") {
    sql += " ORDER BY price DESC";
  } else if (sort === "popular") {
    sql += " ORDER BY purchase_count DESC, id DESC";
  } else {
    sql += " ORDER BY id DESC";
  }

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch products" });
    }
    res.json(rows);
  });
});

/**
 * Cosine similarity
 */
function cosine(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

/**
 * Similar products
 */
router.get("/similar", (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  db.get(
    `SELECT embedding FROM products WHERE id = ?`,
    [productId],
    (err, target) => {
      if (err || !target) {
        return res.status(404).json({ message: "Product not found" });
      }

      try {
        const targetEmb = JSON.parse(target.embedding || "[]");

        db.all(
          `SELECT * FROM products WHERE id != ? AND embedding IS NOT NULL`,
          [productId],
          (err2, rows) => {
            if (err2) {
              return res.status(500).json({ message: "Database error" });
            }

            const scored = rows
              .map((p) => {
                const emb = JSON.parse(p.embedding || "[]");
                return { ...p, similarity: cosine(targetEmb, emb) };
              })
              .sort((a, b) => b.similarity - a.similarity);

            res.json(scored.slice(0, 4));
          }
        );
      } catch (e) {
        return res.status(500).json({ message: "Embedding parse error" });
      }
    }
  );
});

module.exports = router;