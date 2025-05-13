import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "sportsData";

let cachedClient = null;
let cachedDb = null;

if (!mongoUri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local or your environment"
  );
}
if (!dbName) {
  throw new Error(
    "Please define the MONGODB_DB_NAME environment variable inside .env.local or your environment"
  );
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
