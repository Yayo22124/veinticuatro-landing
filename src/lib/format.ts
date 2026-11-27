export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 MB";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const decimals = exponent >= 3 ? 2 : exponent === 2 ? 1 : 0;

  return `${value.toFixed(decimals)} ${units[exponent]}`;
}

export function formatGalleryTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (part.toLowerCase() === "xv") {
        return "XV";
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}
