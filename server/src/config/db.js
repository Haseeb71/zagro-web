var mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(process.cwd(), ".env.production") });
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

function allowMemoryFallback() {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.AWS_EXECUTION_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME) return false;
  if (process.env.ALLOW_MEMORY_DB === "false") return false;
  return process.env.ALLOW_MEMORY_DB === "true";
}

async function connectToDB() {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  let uri = process.env.MONGO_DB_URL;
  if (!uri) {
    throw new Error("MONGO_DB_URL is not set (check Amplify Environment variables)");
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
        if (!allowMemoryFallback()) {
          throw primaryError;
        }
        console.warn("Falling back to in-memory MongoDB (data resets on restart)...");
        uri = await startMemoryMongo();
        const conn = await mongoose.connect(uri, opts);
        console.log("In-memory MongoDB connected");
        return conn;
      }
    })().catch((err) => {
      globalCache.promise = null;
      throw err;
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}

module.exports = connectToDB;
