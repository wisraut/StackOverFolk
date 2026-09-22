# StackOverFolk

![StackOverFolk logo](assets/stackoverfolk-logo.svg)

StackOverFolk is a small terminal lab for understanding how numbers and seven-bit ASCII move between binary, octal, decimal, and hexadecimal. It favours a correct result and a compact explanation of the conversion journey.

## Run

Node.js 22 or newer is required.

```sh
npm install
npm start
```

The startup logo animates for about 2.5 seconds. Press any key to skip it, or use `npm start -- --no-animation`. Non-interactive terminals and `CI=true` always print the unchanged static banner. Set `STACKOVERFOLK_REDUCED_MOTION=1` for a short reveal.

## Controls

Enter a value in the persistent input line, then press Enter. Your source and target modes stay selected for the next conversion.

- `Ctrl+S` swaps source and target, then places the latest result in the input line.
- `Ctrl+T` changes only the target mode and recalculates the latest source input.
- `Ctrl+B` chooses a new source and target mode.
- `←` / `→` move through the journey.
- `Ctrl+D` shows or hides the current stage explanation.
- `Esc` closes the current journey; `Ctrl+Q` quits.

After every successful conversion, the input line is cleared and focused while
the current source and target modes stay selected. Type the next value and press
Enter without returning through the setup flow.

ASCII mode is deliberately limited to code points 0–127. Text-to-base encoding and base-to-text decoding use whitespace-separated character codes. Binary, octal, and hexadecimal ASCII values are padded to 8, 3, and 2 digits respectively.

## Development

```sh
npm test
npm pack --dry-run
```

This repository contains only StackOverFolk. It intentionally has no code, configuration, or context from LINE–Dify Hospital Bridge.
