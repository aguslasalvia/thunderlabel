const PALETTE = [
  "#C1543A",
  "#3E7C59",
  "#3B6EA5",
  "#B08A2E",
  "#7A5C9E",
  "#4C8C8B",
  "#A8473A",
  "#5B7A3A",
];

export function nextColor(existingColors: string[]): string {
  const used = new Set(existingColors.map((c) => c.toLowerCase()));
  const free = PALETTE.find((c) => !used.has(c.toLowerCase()));
  return free ?? PALETTE[existingColors.length % PALETTE.length];
}
