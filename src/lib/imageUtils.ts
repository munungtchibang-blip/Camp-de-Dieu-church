export async function compressImage(source: File | string, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImage = (src: string) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    };

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (event) => {
        processImage(event.target?.result as string);
      };
      reader.onerror = (e) => reject(new Error('Failed to read file: ' + e));
      reader.readAsDataURL(source);
    } else {
      processImage(source);
    }
  });
}
