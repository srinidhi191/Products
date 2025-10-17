const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// File path for products data
const FILE = path.join(__dirname, 'products.json');

// Ensure products.json exists
function ensureFile() {
  if (!fs.existsSync(FILE)) {
    const data = [
      { id: 1, name: 'Laptop', price: 60000, inStock: true },
      { id: 2, name: 'Mouse', price: 800, inStock: true }
    ];
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  }
}

// Read data
function read() {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE));
}

// Write data
function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Product API</h1>
    <p>Try these:</p>
    <ul>
      <li><a href="/output">/output</a> – View all products (HTML)</li>
      <li><a href="/products">/products</a> – View all products (JSON)</li>
      <li><a href="/products/instock">/products/instock</a> – View in-stock products</li>
    </ul>
  `);
});

// /output route - show as HTML table
app.get('/output', (req, res) => {
  const products = read();
  let html = `
    <h2>Product List</h2>
    <table border="1" cellpadding="8">
      <tr><th>ID</th><th>Name</th><th>Price</th><th>In Stock</th></tr>
  `;
  for (const p of products) {
    html += `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>₹${p.price}</td>
        <td>${p.inStock ? '✅ Yes' : '❌ No'}</td>
      </tr>`;
  }
  html += '</table>';
  res.send(html);
});

// Get all products (JSON)
app.get('/products', (req, res) => res.json(read()));

// Get only in-stock products
app.get('/products/instock', (req, res) => {
  res.json(read().filter(p => p.inStock));
});

// Add new product
app.post('/products', (req, res) => {
  const { name, price, inStock } = req.body;
  if (!name || typeof price !== 'number' || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const products = read();
  const newProduct = {
    id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name,
    price,
    inStock
  };
  products.push(newProduct);
  write(products);
  res.json(newProduct);
});

// Update product by ID
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const products = read();
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Not found' });

  Object.assign(product, req.body);
  write(products);
  res.json(product);
});

// Delete product by ID
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let products = read();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  products.splice(index, 1);
  write(products);
  res.json({ message: 'Deleted successfully' });
});

// Start server
app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));
