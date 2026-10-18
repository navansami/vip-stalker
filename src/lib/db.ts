import { MongoClient } from 'mongodb';
const globalDb = globalThis as typeof globalThis & { mongoPromise?: Promise<MongoClient> };
export async function database() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MongoDB is not configured. Add MONGODB_URI to .env.local.');
  if (!globalDb.mongoPromise) globalDb.mongoPromise = new MongoClient(uri, {serverSelectionTimeoutMS: 8000}).connect().catch(e => {globalDb.mongoPromise = undefined; throw e;});
  return (await globalDb.mongoPromise).db(process.env.MONGODB_DB || 'ftp_stalker');
}
