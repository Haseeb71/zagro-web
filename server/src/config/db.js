var mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(process.cwd(), "server", ".env") });
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });

mongoose.set("strictQuery", false);

/** Reuse connection across Next.js API invocations / SSR boot. */
const globalCache = global.__ZAGRO_MONGOOSE__ || { conn: null, promise: null };
global.__ZAGRO_MONGOOSE__ = globalCache;

async function startMemoryMongo() {
  const { MongoMemoryServer } = require("mongodb-memory-server");
  const mongod = await MongoMemoryServer.create();
  global.__ZAGRO_MEMORY_MONGO__ = mongod;
  const uri = mongod.getUri();
  console.log("Using in-memory MongoDB for development:", uri);
  return uri;
}

async function connectToDB() {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  let uri = process.env.MONGO_DB_URL;
  if (!uri) {
    throw new Error("MONGO_DB_URL is not set");
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
  };

  if (!globalCache.promise) {
    globalCache.promise = (async () => {
      try {
        const conn = await mongoose.connect(uri, opts);
        console.log("MongoDB connected Successfully");
        return conn;
      } catch (primaryError) {
        console.warn("Primary MongoDB connection failed:", primaryError.message);
        if (process.env.ALLOW_MEMORY_DB === "false") {
          throw primaryError;
        }
        console.warn("Falling back to in-memory MongoDB (data resets on restart)...");
        uri = await startMemoryMongo();
        const conn = await mongoose.connect(uri, opts);
        console.log("In-memory MongoDB connected");
        return conn;
      }
    })();
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}

module.exports = connectToDB;
