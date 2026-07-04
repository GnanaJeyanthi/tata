const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDbMode } = require('../config/db');
const { memoryStore } = require('../utils/memoryDb');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const isMongo = getDbMode() === 'mongodb';
    let userExists = null;

    if (isMongo) {
      userExists = await User.findOne({ $or: [{ email }, { username }] });
    } else {
      userExists = await memoryStore.users.findOne({ email }) || await memoryStore.users.findOne({ username });
    }

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser = null;
    if (isMongo) {
      newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role: role || 'Engineer'
      });
    } else {
      newUser = await memoryStore.users.create({
        username,
        email,
        password: hashedPassword,
        role: role || 'Engineer'
      });
    }

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        token
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const isMongo = getDbMode() === 'mongodb';
    let user = null;

    if (isMongo) {
      user = await User.findOne({ username });
    } else {
      user = await memoryStore.users.findOne({ username });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
};

module.exports = { register, login, getMe };
