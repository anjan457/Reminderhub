const express = require('express');
const SyncState = require('../models/SyncState');

const router = express.Router();

function hasData(doc) {
  if (!doc) return false;
  return Boolean(
    (doc.reminders && doc.reminders.length) ||
    (doc.todos && doc.todos.length) ||
    (doc.dailyTasks && doc.dailyTasks.length)
  );
}

router.get('/:deviceId', async (req, res) => {
  try {
    const doc = await SyncState.findOne({ deviceId: req.params.deviceId }).lean();

    if (!doc) {
      return res.json({
        deviceId: req.params.deviceId,
        reminders: [],
        todos: [],
        dailyTasks: [],
        updatedAt: 0,
        hasData: false
      });
    }

    res.json({
      deviceId: doc.deviceId,
      reminders: doc.reminders || [],
      todos: doc.todos || [],
      dailyTasks: doc.dailyTasks || [],
      updatedAt: doc.updatedAt || 0,
      hasData: hasData(doc)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:deviceId', async (req, res) => {
  try {
    const { reminders, todos, dailyTasks, updatedAt } = req.body;
    const ts = Number(updatedAt) || Date.now();

    const doc = await SyncState.findOneAndUpdate(
      { deviceId: req.params.deviceId },
      {
        deviceId: req.params.deviceId,
        reminders: Array.isArray(reminders) ? reminders : [],
        todos: Array.isArray(todos) ? todos : [],
        dailyTasks: Array.isArray(dailyTasks) ? dailyTasks : [],
        updatedAt: ts
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ ok: true, updatedAt: doc.updatedAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
