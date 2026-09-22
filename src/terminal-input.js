/** Hand stdin from the banner to Ink, then restore it when Ink exits. */
export function handoffInputToInk(input = process.stdin) {
  input.resume?.();
  return () => input.pause?.();
}
