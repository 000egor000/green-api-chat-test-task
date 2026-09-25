const PLACEHOLDER = '#';

export function initials(title: string): string {
  const letters = title
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .filter((letter) => /\p{L}/u.test(letter))
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return letters || PLACEHOLDER;
}
