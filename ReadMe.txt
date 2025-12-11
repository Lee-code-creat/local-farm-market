Local Farm Market – Full-Stack Web Application

This project is a small full-stack web application that simulates an online local farm market. It allows sellers to post farm products, buyers to browse and purchase items, and both sides to communicate through a built-in messaging system. I also added an AI-based product recommendation feature using OpenAI embeddings.

Tech Stack

Frontend: React, JavaScript

Backend: Node.js, Express

Database: SQLite

Authentication: JSON Web Token (JWT)

AI Recommendation: OpenAI text-embedding-3-small

Other: CORS, RESTful API design

Main Features
User System

Users can register and log in as either buyer or seller

JWT is used for authentication

Session is saved in localStorage

Seller Features

Create new products with title, description, price, and image

Edit existing products

Delete their own products

Embeddings are generated automatically for recommendation

Buyer Features

Browse all products

Sort products by price, popularity, or newest

Purchase products (purchase count increases)

View similar recommended items

Messaging System

Buyer and seller can chat about a product

Chat messages are stored in SQLite

Only the buyer and the seller of that product can see the conversation

AI Recommendation

Each product gets an embedding vector

Cosine similarity is used to find related products

Clicking "See similar products" boosts relevant items to the top

Project Structure
backend/
  routes/
    authRoutes.js
    productRoutes.js
    messageRoutes.js
    purchaseRoutes.js
  database.js
  server.js
frontend/
  src/
    App.jsx
    components/
      AuthPanel.jsx
      ProductList.jsx
      CreateProductForm.jsx
      MessagesPanel.jsx
      SortBar.jsx

How to Run the Project
1. Install dependencies
cd backend
npm install
cd ../frontend
npm install

2. Start backend
cd backend
node server.js


Backend default URL:
http://localhost:4000

3. Start frontend
cd frontend
npm run dev

4. Open the browser

Visit:
http://localhost:5173 (or the port shown in terminal)

Notes

You need an OpenAI API key in your backend .env file:

OPENAI_API_KEY=your_key_here


SQLite database file is created automatically.

Sample products can be seeded using the provided scripts.

Future Improvements

Add image upload instead of URL typing

Add pagination for product list

Add responsive mobile UI

Improve error handling across API

Add user profile pages

An demo video link is:https://youtu.be/TLMjJJ9YQp0
