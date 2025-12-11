// Clear products table and insert sample fruits with random purchase_count.

const db = require("./database");

// NOTE: this assumes there is an existing seller with id = 1.
const SELLER_ID = 1;

// Helper to generate random int in range [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const products = [
  // Apples
  {
    title: "Fresh Apple A",
    description: "Crisp and sweet apples, picked this morning.",
    price: 3.5,
    image_url: "/fruits/apple1.png",
  },
  {
    title: "Fresh Apple B",
    description: "Sweet red apples from local orchard.",
    price: 2.8,
    image_url: "/fruits/apple2.png",
  },
  {
    title: "Organic Apple A",
    description: "No pesticides, great for healthy snacks.",
    price: 4.2,
    image_url: "/fruits/apple3.png",
  },
  {
    title: "Large Apple A",
    description: "Slightly sour, perfect for baking pies.",
    price: 6.9,
    image_url: "/fruits/apple4.png",
  },
  {
    title: "Large Apple B",
    description: "Crunchy and refreshing large apples.",
    price: 5.0,
    image_url: "/fruits/apple5.png",
  },

  // Bananas
  {
    title: "Sweet Banana A",
    description: "Soft and sweet, ideal for breakfast.",
    price: 2.3,
    image_url: "/fruits/banana1.png",
  },
  {
    title: "Sweet Banana B",
    description: "Perfect for smoothies and desserts.",
    price: 3.5,
    image_url: "/fruits/banana2.png",
  },
  {
    title: "Ripe Banana A",
    description: "Very ripe, great for banana bread.",
    price: 4.1,
    image_url: "/fruits/banana3.png",
  },
  {
    title: "Ripe Banana B",
    description: "Soft texture, kids love it.",
    price: 5.2,
    image_url: "/fruits/banana4.png",
  },
  {
    title: "Mini Banana",
    description: "Small and super sweet bananas.",
    price: 6.8,
    image_url: "/fruits/banana5.png",
  },

  // Oranges
  {
    title: "Juicy Orange A",
    description: "Full of vitamin C, very juicy.",
    price: 2.0,
    image_url: "/fruits/orange1.png",
  },
  {
    title: "Juicy Orange B",
    description: "Perfect for making fresh orange juice.",
    price: 3.2,
    image_url: "/fruits/orange2.png",
  },
  {
    title: "Sweet Orange A",
    description: "Sweeter taste, less sour.",
    price: 4.4,
    image_url: "/fruits/orange3.png",
  },
  {
    title: "Sweet Orange B",
    description: "Thin peel, easy to eat.",
    price: 5.3,
    image_url: "/fruits/orange4.png",
  },
  {
    title: "Large Orange",
    description: "Big size oranges, great for sharing.",
    price: 6.6,
    image_url: "/fruits/orange5.png",
  },
];

db.serialize(() => {
  console.log("Clearing products table...");

  db.run("DELETE FROM products", (err) => {
    if (err) {
      console.error("Failed to clear products table:", err);
      process.exit(1);
    }

    console.log("Inserting sample products...");

    const stmt = db.prepare(
      `
        INSERT INTO products
          (title, description, price, image_url, seller_id, purchase_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    );

    products.forEach((p) => {
      const purchaseCount = randInt(0, 80); // random test value
      stmt.run(
        p.title,
        p.description,
        p.price,
        p.image_url,
        SELLER_ID,
        purchaseCount
      );
    });

    stmt.finalize((err2) => {
      if (err2) {
        console.error("Failed to insert sample products:", err2);
        process.exit(1);
      }

      console.log("Seed complete! Sample products inserted.");
      db.close();
    });
  });
});