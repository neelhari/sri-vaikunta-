const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'bttoiwjr';

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
 * Helper to upload image/video file to Cloudinary unsigned upload preset
 */
export async function uploadToCloudinary(file, uploadPreset = 'aalaya_vastra') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return null;
  }
}
