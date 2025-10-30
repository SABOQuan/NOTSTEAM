/**
 * Cloudinary Image Optimizer
 * Automatically adds transformations to Cloudinary URLs for better performance
 */

/**
 * Optimize a Cloudinary image URL
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export const optimizeCloudinaryImage = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url; // Return as-is if not a Cloudinary URL
  }

  const {
    width = 'auto',
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = options;

  // Build transformation string
  const transformations = [
    `w_${width}`,
    `q_${quality}`,
    `f_${format}`,
    `c_${crop}`,
  ].join(',');

  // Insert transformations into URL
  // Example: https://res.cloudinary.com/cloud/image/upload/v123/image.jpg
  // Becomes: https://res.cloudinary.com/cloud/image/upload/w_400,q_auto,f_auto/v123/image.jpg

  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
  }

  return url;
};

/**
 * Preset sizes for different use cases
 */
export const ImagePresets = {
  THUMBNAIL: { width: 150, quality: 'auto', format: 'auto' },
  CARD: { width: 400, quality: 'auto', format: 'auto' },
  BANNER: { width: 1920, quality: 'auto:good', format: 'auto' },
  CAROUSEL: { width: 600, quality: 'auto', format: 'auto' },
};

/**
 * Get optimized image URL for a specific preset
 */
export const getOptimizedImage = (url, preset = 'CARD') => {
  return optimizeCloudinaryImage(url, ImagePresets[preset]);
};
