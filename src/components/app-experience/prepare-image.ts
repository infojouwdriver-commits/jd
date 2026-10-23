import { MAX_WELCOME_IMAGE_BYTES } from "../../../driver-app/src/welcome-config";
export async function prepareWelcomeImage(file: File): Promise<string> {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024 ||
    file.size === 0
  )
    throw Error("Invalid image");
  const bitmap = await createImageBitmap(file);
  try {
    if (
      bitmap.width < 100 ||
      bitmap.height < 100 ||
      bitmap.width * bitmap.height > 25_000_000
    )
      throw Error("Invalid dimensions");
    const canvas = document.createElement("canvas");
    let ratio = Math.min(1, 1080 / bitmap.width, 1920 / bitmap.height);
    for (let i = 0; i < 8; i++) {
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const context = canvas.getContext("2d");
      if (!context) throw Error("Image processing unavailable");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const quality = 0.82 - i * 0.045;
      let data = canvas.toDataURL("image/webp", quality);
      // Some mobile browsers decode WebP but cannot encode it from a canvas.
      if (!data.startsWith("data:image/webp;base64,"))
        data = canvas.toDataURL("image/jpeg", quality);
      if (
        /^data:image\/(webp|jpeg);base64,/.test(data) &&
        data.length <= Math.floor(MAX_WELCOME_IMAGE_BYTES / 3) * 4
      )
        return data;
      ratio *= 0.84;
    }
    throw Error("Image too large");
  } finally {
    bitmap.close();
  }
}
