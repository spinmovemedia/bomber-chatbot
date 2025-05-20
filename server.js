require('dotenv').config();
console.log('Using OpenAI model:', process.env.OPENAI_MODEL);

const express = require('express');
const { OpenAI } = require('openai');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages
    });
    res.json({
      content: response.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI error' });
  }
});
app.get('/order', async (req, res) => {
  try {
    const { identifier } = req.query;
    let url;

    if (identifier.includes('@')) {
      url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers.json?email=${encodeURIComponent(identifier)}`;
      const cust = await axios.get(url, {
        headers: { 'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN }
      });
      const customerId = cust.data.customers[0]?.id;
      url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/orders.json?customer_id=${customerId}`;
    } else {
      url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/orders.json?name=${encodeURIComponent(identifier)}`;
    }

    const orders = await axios.get(url, {
      headers: { 'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN }
    });
    res.json(orders.data.orders[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Shopify error' });
  }
});

app.get('/breaks', async (req, res) => {
  try {
    const resp = await axios.get(process.env.MAKE_BREAKS_WEBHOOK);
    res.json(resp.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Breaks fetch error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});


