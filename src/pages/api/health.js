// Standalone health — no Express/Mongo (Amplify diagnose)
export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    service: 'khareedo-api',
    hasMongoEnv: Boolean(process.env.MONGO_DB_URL),
    node: process.version,
  });
}
