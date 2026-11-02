export function getOptimizedImageUrl(source, width = 480) {
  const value = String(source || "").trim();
  if (!value) return "/omsons-logo.jpg";

  const localPath = normalizeLocalImagePath(value);
  if (localPath) return localPath;

  try {
    const url = new URL(value);
    const marker = "/image/upload/";
    const index = url.pathname.indexOf(marker);
    if (url.hostname !== "res.cloudinary.com" || index === -1) return value;
    const deliveryPath = url.pathname.slice(0, index + marker.length);
    const assetPath = url.pathname.slice(index + marker.length);
    if (assetPath.startsWith("f_auto,") || assetPath.startsWith("q_auto,")) return value;
    url.pathname = `${deliveryPath}f_auto,q_auto,w_${Math.max(160, Math.round(width))},dpr_auto/${assetPath}`;
    return url.toString();
  } catch (_error) {
    return value;
  }
}

function normalizeLocalImagePath(value) {
  const normalized = value.replace(/\\/g, "/");
  const marker = "export catalogue images/";
  const markerIndex = normalized.toLowerCase().indexOf(marker);

  if (markerIndex === -1 || /^(https?:)?\/\//i.test(normalized)) return "";

  const filePath = normalized.slice(markerIndex + marker.length);
  return `/assets/export catalogue images/${filePath}`;
}

export function getResponsiveImageSources(source) {
  return [240, 360, 480, 640]
    .map((width) => `${getOptimizedImageUrl(source, width)} ${width}w`)
    .join(", ");
}
