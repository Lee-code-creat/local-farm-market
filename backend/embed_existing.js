// Add embeddings for existing products that do not have them yet.

const db = require("./database");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

(async () => {
  console.log("Checking products without embedding...");

  db.all(
    `SELECT id, title, description FROM products WHERE embedding IS NULL OR embedding = ''`,
    async (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        process.exit(1);
      }

      if (rows.length === 0) {
        console.log("All products already have embeddings.");
        process.exit(0);
      }

      console.log(`Found ${rows.length} products to update.`);

      for (const p of rows) {
        const text = `${p.title} ${p.description || ""}`.trim();
        try {
          const emb = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
          });
          const embedding = JSON.stringify(emb.data[0].embedding);

          await new Promise((resolve, reject) => {
            db.run(
              `UPDATE products SET embedding = ? WHERE id = ?`,
              [embedding, p.id],
              (err2) => {
                if (err2) {
                  console.error(`Failed to update ${p.title}:`, err2);
                  reject(err2);
                } else {
                  console.log(
                    `Updated embedding for product #${p.id}: ${p.title}`
                  );
                  resolve();
                }
              }
            );
          });

          // Small delay to avoid rate limits
          await new Promise((r) => setTimeout(r, 800));
        } catch (err3) {
          console.error(
            `Error generating embedding for "${p.title}":`,
            err3.message
          );
        }
      }

      console.log("All missing embeddings have been updated.");
      db.close();
    }
  );
})();