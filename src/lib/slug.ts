const ACCENTS: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ü: "u",
  ñ: "n",
};

function baseSlug(name: string): string {
  const lowered = name
    .toLowerCase()
    .split("")
    .map((char) => ACCENTS[char] ?? char)
    .join("");
  const slug = lowered
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "etiqueta";
}

export function slugify(name: string, existingKeys: string[]): string {
  const taken = new Set(existingKeys);
  const base = baseSlug(name);
  if (!taken.has(base)) return base;

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}
