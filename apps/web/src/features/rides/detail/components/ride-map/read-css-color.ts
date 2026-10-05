export function readCssColor(variable: string) {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;

  context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(variable);
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;

  return `rgb(${red}, ${green}, ${blue})`;
}
