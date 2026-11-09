export function parseTagNames(input: string): string[] {
  return [
    ...new Set(
      input
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    ),
  ];
}
