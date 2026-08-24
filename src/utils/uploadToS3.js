import API from '../APIs/base';
import { ENDPOINT } from '../config/constants';

/**
 * Upload a file directly to S3 (browser → S3). Avoids Amplify 413 body-size limit.
 * @returns {Promise<string>} public URL stored in MongoDB
 */
export async function uploadFileToS3(file, folder = 'products') {
  const presignRes = await API.postMethod(
    ENDPOINT.upload.presign,
    true,
    {
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      folder,
    },
    true,
    true
  );

  const { uploadUrl, publicUrl } = presignRes?.data || {};
  if (!uploadUrl || !publicUrl) {
    throw new Error(presignRes?.data?.message || 'Could not get upload URL');
  }

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  if (!putRes.ok) {
    throw new Error(`S3 upload failed (${putRes.status}). Check bucket CORS settings.`);
  }

  return publicUrl;
}
