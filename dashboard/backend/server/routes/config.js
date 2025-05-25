const express = require('express');
const router = express.Router();
const DashboardConfig = require('../models/Config');
const ApiKey = require('../models/ApiKey');
const mongoose = require('mongoose');
const ws = require('../ws');

const defaultConfig = {
  layout: [["Welcome"]],
  cards: [{ id: "Welcome", type: "html", title: "Welcome", html: "<h2>Welcome</h2>", size: "medium" }],
  settings: { theme: "light" }
};

router.post('/admin/genKey', async (req, res) => {
  const userId = req.query.userId || 'user';
  const apiKey = require('crypto').randomBytes(24).toString('hex');
  await ApiKey.create({ apiKey, userId });
  await DashboardConfig.updateOne({ userId }, { $setOnInsert: { config: defaultConfig } }, { upsert: true });
  res.json({ apiKey });
});

router.use(async (req, res, next) => {
  const apiKey = req.query.key || req.headers['x-api-key'];
  const doc = await ApiKey.findOne({ apiKey, status: 'active' });
  if (!doc) return res.status(403).json({ error: 'Invalid key' });
  req.userId = doc.userId;
  next();
});

router.get('/', async (req, res) => {
  const doc = await DashboardConfig.findOne({ userId: req.userId });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc.config);
});

router.put('/', async (req, res) => {
  const updated = await DashboardConfig.findOneAndUpdate(
    { userId: req.userId },
    { config: req.body, $push: { versions: { config: req.body } } },
    { new: true, upsert: true }
  );
  ws.notify(req.userId);
  res.json({ ok: true });
});

router.patch('/cards', async (req, res) => {
  const doc = await DashboardConfig.findOne({ userId: req.userId });
  doc.config = { ...doc.config, ...req.body };
  doc.versions.push({ config: doc.config });
  await doc.save();
  ws.notify(req.userId);
  res.json({ ok: true });
});

router.post('/agg', async (req, res) => {
  const { collection, query, aggregation, field } = req.body;
  const col = mongoose.connection.db.collection(collection);
  const pipeline = [];

  if (query) pipeline.push({ $match: query });

  if (aggregation === 'sum') {
    pipeline.push({ $group: { _id: null, value: { $sum: `$${field}` } } });
  } else if (aggregation === 'count') {
    pipeline.push({ $count: 'value' });
  }

  const result = await col.aggregate(pipeline).toArray();
  res.json({ value: result[0]?.value ?? 0 });
});


module.exports = router;
