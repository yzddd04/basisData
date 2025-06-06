import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
let client;
let db;

export async function connectToDatabase() {
  if (db) {
    return db;
  }
  if (!client) {
    client = new MongoClient(uri);
  }
  try {
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  if (client) {
    try {
      await client.close();
      client = null;
      db = null;
      console.log('Disconnected from MongoDB Atlas');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
}