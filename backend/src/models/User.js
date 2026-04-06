const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  socketId: { type: String, required: true, unique: true },
  username: { type: String, required: true, trim: true },
  avatarColor: { type: String, default: '#7c3aed' },
  avatarEmoji: { type: String, default: '🧑' },
  position: {
    x: { type: Number, default: 400 },
    y: { type: Number, default: 300 },
  },
  currentRoom: { type: String, default: 'open' },
  nearbyUsers: [{ type: String }], // array of socketIds
  isOnline: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
});

userSchema.methods.toPublic = function () {
  return {
    id: this.socketId,
    username: this.username,
    avatarColor: this.avatarColor,
    avatarEmoji: this.avatarEmoji,
    position: this.position,
    currentRoom: this.currentRoom,
    nearbyUsers: this.nearbyUsers,
  };
};

module.exports = mongoose.model('User', userSchema);
