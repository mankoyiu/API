// dbhelpers.ts:
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const uri = "mongodb+srv://xxxx:yyyy@cluster0.f80so0j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Global variable to hold the database instance
let db: any;

// Function to initialize the database connection
const initializeDb = async () => {
  try {
    await client.connect();
    db = client.db('articles');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Initialize the database connection
initializeDb();

// Generic function to find documents in a collection
export const find = async (collectionName: string, query: any) => {
  try {
    const collection = db.collection(collectionName);
    return await collection.find(query).toArray();
  } catch (error) {
    console.error('Database error in find:', error);
    throw error;
  }
};

// Function to find a document by ID
export const findById = async (collectionName: string, id: string) => {
  try {
    const collection = db.collection(collectionName);
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error('Database error in findById:', error);
    throw error;
  }
};

// Function to add a new document to a collection
export const add = async (collectionName: string, document: any) => {
  try {
    const collection = db.collection(collectionName);
    return await collection.insertOne(document);
  } catch (error) {
    console.error('Database error in add:', error);
    throw error;
  }
};

// Function to update a document by ID
export const update = async (collectionName: string, id: string, document: any) => {
  try {
    const collection = db.collection(collectionName);
    return await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: document }
    );
  } catch (error) {
    console.error('Database error in update:', error);
    throw error;
  }
};

// Function to remove a document by ID
export const remove = async (collectionName: string, id: string) => {
  try {
    const collection = db.collection(collectionName);
    return await collection.deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error('Database error in remove:', error);
    throw error;
  }
};

// New function to get the maximum uid using MongoDB sorting and limiting
export const getMaxUid = async (collectionName: string) => {
  try {
    const collection = db.collection(collectionName);
    const maxArticle = await collection
      .find({})
      .sort({ uid: -1 }) // sort in descending order by uid
      .limit(1)
      .toArray();
    
    if (maxArticle.length > 0 && typeof maxArticle[0].uid === 'number') {
      return maxArticle[0].uid;
    }
    return 0;
  } catch (error) {
    console.error('Database error in getMaxUid:', error);
    throw error;
  }
};

// Close the client when the application is shutting down
process.on('SIGINT', async () => {
  await client.close();
  console.log('Database connection closed');
  process.exit(0);
});
