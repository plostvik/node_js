const mongoose = require('mongoose');
const { Schema } = mongoose;

const UsersSchema = new Schema({
  email: {
    type: String,
    required: true,
    validate: value => value.includes('@'),
  },
  password: {
    type: String,
    required: true,
  },
  avatarURL: String,
  subscription: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free',
  },
  token: String,
  verificationToken: String,
});

const User = mongoose.model('User', UsersSchema);

module.exports = User;
