import API from '../APIs/base';
import { ENDPOINT } from '../config/constants';

/**
 * Upload file browser → S3 via presigned PUT. Returns S3 object key for MongoDB storage.
 */
export async function uploadFileToS3(file, folder = 'products') {
  const presignRes = await API.postMethod(
    ENDPOINT.upload.presign,
    true,
    {
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      folder,
      sizeBytes: file.size,
    },
    true,
    true
  );

  const { uploadUrl, key, contentType } = presignRes?.data || {};
  if (!uploadUrl || !key) {
    throw new Error(presignRes?.data?.message || 'Could not get upload URL');
  }

  const mime = contentType || file.type || 'application/octet-stream';
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': mime },
  });

  if (!putRes.ok) {
    throw new Error(`Upload failed (${putRes.status}). Check S3 bucket CORS settings.`);
  }

  return key;
}
