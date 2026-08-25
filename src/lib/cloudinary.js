const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'xzyntgxf';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '569485373767377';
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || 'm3z9WYwxwZBc6YglR6GwzLbJwhs';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'srivaikuntasarees';

/**
 * Automatically compresses large high-res DSLR/iPhone photos client-side
 * before uploading to Cloudinary to ensure ultra-fast uploads and zero failures.
 */
export function compressImage(file, maxDimension = 2400, quality = 0.90) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                (file.name || 'saree_photo').replace(/\.[^/.]+$/, '') + '.jpg',
                { type: 'image/jpeg', lastModified: Date.now() }
              );
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

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
 * 1. Automatically applies client-side intelligent compression for images.
 * 2. Uploads via Signed SHA-1 directly into Cloudinary account.
 * 3. Falls back to unsigned preset or Data URL if needed.
 */
export async function uploadToCloudinary(rawFile) {
  if (!CLOUD_NAME) {
    return { success: false, message: 'Cloudinary is not configured (missing VITE_CLOUDINARY_CLOUD_NAME).' };
  }

  // Compress image client-side if it's an image
  const file = rawFile.type.startsWith('image/') ? await compressImage(rawFile) : rawFile;

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  const timestamp = Math.round(new Date().getTime() / 1000);

  // 1. Try Signed Direct Upload (Works with API Key + Secret without manual dashboard preset setup)
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
      console.warn('Signed upload response:', data?.error?.message);
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
