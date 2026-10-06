// "a, b, a" -> ["a", "b"]
export const toList = (text = '') => [
  ...new Set(
    text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  ),
];
