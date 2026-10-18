/**
 * Automatically injects Cloudinary auto-format and auto-quality (f_auto,q_auto)
 * transformations into Cloudinary delivery URLs.
 * If the URL is already transformed, local, or not from Cloudinary, it is returned untouched.
 */
export function getOptimizedImageUrl(url?: string | null, width?: number): string {
  if (!url || typeof url !== "string") return "";

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  // Already transformed with f_auto or q_auto
  if (url.includes("/f_auto") || url.includes("/q_auto")) {
    return url;
  }

  const transform = width ? `f_auto,q_auto,w_${width}` : "f_auto,q_auto";
  return url.replace("/image/upload/", `/image/upload/${transform}/`);
}
