
/**
 * Compresses an image Base64 string by resizing it to a maximum width/height
 * and reducing the quality.
 */
export async function compressImage(base64Str: string, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible d\'obtenir le contexte canvas'));
          return;
        }

        // Use slightly better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);
        
        const result = canvas.toDataURL('image/jpeg', quality);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image pour compression'));
    img.src = base64Str;
  });
}
