/**
 * Converts an arbitrary category name into a URL-safe slug.
 * @param value raw name input
 * @returns normalized slug (lowercase, hyphen-separated)
 */
export const slugify = (value: string): string => {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/**
 * Extracts a human-readable message from an Axios-style error.
 * @param err unknown thrown error
 * @param fallback message used when the server provides none
 * @returns display-ready error message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getApiErrorMessage = (err: any, fallback: string): string => {
  const data = err?.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) {
    return message.map((m) => m?.message ?? m?.field ?? "Validation error").join(", ");
  }
  if (typeof message === "string" && message.length > 0) {
    return message;
  }
  if (typeof err?.message === "string" && err.message.length > 0) {
    return err.message;
  }
  return fallback;
};
