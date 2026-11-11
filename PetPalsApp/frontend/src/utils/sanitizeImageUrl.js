/**
 * Sanitizes image URLs to ensure consistent formatting.
 *
 * Full addresses (http...) are returned as they are. Short paths are resolved
 * against the server itself, not the API path: the server serves pictures
 * from /uploads and the placeholder from /, never under /api.
 * (Before, "/api" was always put in front, so "placeholder-image.png" became
 * "/api/api/placeholder-image.png" and failed with a 404.)
 *
 * @param {string|null} url - The image URL to sanitize.
 * @param {string} apiUrl - The base API URL, e.g. "/api" or "http://localhost:4000/api".
 * @returns {string|null} - The sanitized URL or null.
 */
const sanitizeImageUrl = (url, apiUrl) => {
  if (!url) return null;

  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }

  // Clean the path: forward slashes, no leading slash, no "api/" in front
  const path = url
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^(api\/)+/, "");

  // The placeholder ships with the frontend
  if (path === "placeholder-image.png") {
    return "/placeholder-image.png";
  }

  // Server address without the /api part ("" when the frontend and server share an address)
  const serverBase = (apiUrl || "").replace(/\/+$/, "").replace(/\/api$/, "");

  return `${serverBase}/${path}`;
};

export default sanitizeImageUrl;
