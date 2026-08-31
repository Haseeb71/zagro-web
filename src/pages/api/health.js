export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    service: 'khareedo-api',
    hasMongoEnv: Boolean(process.env.MONGO_DB_URL),
    hasS3: Boolean(process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET),
    build: 's3-json-create-v2',
    node: process.version,
  });
}
