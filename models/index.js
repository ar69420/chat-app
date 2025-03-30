import mongoose from 'mongoose';
import User from './schema/user.schema.js';
import Message from './schema/message.schema.js';
import Conversation from './schema/conversation.schema.js';

// Database connection function
const connectDB = async () => {
  try {
    // Use the connection string from .env file or fall back to default
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app';
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri);
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export {
  connectDB,
  User,
  Message,
  Conversation
}; 