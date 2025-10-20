export const getDominantColor = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve("#fbbf24"); // Fallback color
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0, img.width, img.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        // Amostrar pixels para melhor performance
        for (let i = 0; i < data.length; i += 16) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Ajustar brilho para melhor contraste
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness > 200) {
          r = Math.max(0, r - 40);
          g = Math.max(0, g - 40);
          b = Math.max(0, b - 40);
        }

        const color = `rgb(${r}, ${g}, ${b})`;
        resolve(color);
      } catch {
        resolve("#fbbf24"); // Fallback color
      }
    };

    img.onerror = () => {
      resolve("#fbbf24"); // Fallback color
    };
  });
};
