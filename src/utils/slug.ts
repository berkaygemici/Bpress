export function slugify(input: string, maxWords = 6): string {
  const words = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, maxWords);
  return words.join("-").replace(/-+/g, "-");
}


