const { mongoose } = require('../config/db');

const syncStateSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true, index: true },
  reminders: { type: Array, default: [] },
  todos: { type: Array, default: [] },
  dailyTasks: { type: Array, default: [] },
  updatedAt: { type: Number, default: 0 }
});

module.exports = mongoose.model('SyncState', syncStateSchema);
