const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'xzyntgxf';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '569485373767377';
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || 'm3z9WYwxwZBc6YglR6GwzLbJwhs';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'srivaikuntasarees';

/**
 * Generates SHA-1 hash for Cloudinary API signed uploads
 */
async function generateSha1(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Returns optimized Cloudinary URL for media asset
 */
export function buildCloudinaryUrl(publicId, options = {}) {
  if (!publicId) return '';
  if (publicId.startsWith('http://') || publicId.startsWith('https://') || publicId.startsWith('/')) {
    return publicId;
  }
  const width = options.width ? `w_${options.width}` : '';
  const height = options.height ? `h_${options.height}` : '';
  const crop = options.crop ? `c_${options.crop}` : 'c_limit';
  const quality = options.quality ? `q_${options.quality}` : 'q_auto';
  const format = options.format ? `f_${options.format}` : 'f_auto';

  const transformations = [crop, width, height, quality, format].filter(Boolean).join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}

/**
 * Uploads an image or video directly to Cloudinary.
 * Tries direct Signed Upload via SHA-1 first (zero setup needed on Cloudinary dashboard),
 * and falls back to unsigned preset upload if needed.
 */
export async function uploadToCloudinary(file) {
  if (!CLOUD_NAME) {
    return { success: false, message: 'Cloudinary is not configured (missing VITE_CLOUDINARY_CLOUD_NAME).' };
  }

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  const timestamp = Math.round(new Date().getTime() / 1000);

  // 1. Try Signed Direct Upload (Highest reliability — works with API Key + Secret without manual preset setup)
  if (API_KEY && API_SECRET) {
    try {
      const signatureStr = `timestamp=${timestamp}${API_SECRET}`;
      const signature = await generateSha1(signatureStr);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', API_KEY);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.secure_url) {
        return { success: true, url: data.secure_url, publicId: data.public_id, raw: data };
      }
      console.warn('Signed upload failed, attempting preset fallback:', data?.error?.message);
    } catch (signedErr) {
      console.warn('Signed upload error:', signedErr);
    }
  }

  // 2. Fallback to Unsigned Preset Upload
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      const message = data?.error?.message || `Upload failed with status ${res.status}`;
      return { success: false, message };
    }
    return { success: true, url: data.secure_url, publicId: data.public_id, raw: data };
  } catch (err) {
    return { success: false, message: err.message || 'Network error while uploading to Cloudinary.' };
  }
}
