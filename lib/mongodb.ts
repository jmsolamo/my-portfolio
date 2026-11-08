import { MongoClient, type Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDatabase(): Promise<Db> {
  if (db) return db;

  if (!MONGODB_URI || MONGODB_URI === "your_mongodb_uri_here") {
    throw new Error(
      "MONGODB_URI is not configured. Add it to your .env.local file.",
    );
  }

  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db("portfolio-chatbot");
  
  // Create indexes for fast lookups
  const sessions = db.collection("sessions");
  await sessions.createIndex({ sessionId: 1 }, { unique: true });
  await sessions.createIndex({ ipAddress: 1 });
  await sessions.createIndex({ createdAt: 1 });

  const blockedIps = db.collection("blocked_ips");
  await blockedIps.createIndex({ ip: 1 }, { unique: true });

  return db;
}

