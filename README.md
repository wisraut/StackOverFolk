# StackOverFolk

![StackOverFolk logo](assets/stackoverfolk-logo.svg)

StackOverFolk is an interactive terminal lab for learning number conversion and cryptography. Instead of returning only an answer, it computes real results and turns each meaningful transformation into a compact journey you can inspect at your own pace.

## Quick Start

Node.js 22 or newer and an interactive terminal are required.

Run the latest published version without installing it:

```sh
npx stackoverfolk
```

Or install the command globally:

```sh
npm install --global stackoverfolk
stackoverfolk
```

## Why StackOverFolk

- Learn from the actual calculation rather than a prewritten illustration.
- Move between Guided, Quick Result, and Full Trace views without restarting a lab.
- Keep the current operation and settings active while trying the next value.
- Reuse results, switch direction, and explore every stage from the keyboard.

## Labs

- Base 2/8/10/16 and strict seven-bit ASCII conversion
- SHA-256 and SHA-512 hashing
- DES-CBC and three-key 3DES-EDE-CBC with PKCS#7 padding
- P-256 hybrid encryption using ECDH, HKDF-SHA256, and AES-256-GCM

The application opens on a flat Home menu. Use the arrow keys and Enter, or press `1` through `9` to open a lab directly.

## Controls

Enter a value in the persistent input line, then press Enter. The selected lab and its settings stay active for the next value.

- `Tab` reuses the latest result as the next input.
- `Ctrl+A` switches between encrypt/decrypt and reuses the result where supported.
- `Ctrl+M` cycles Guided, Quick Result, and Full Trace views.
- `Ctrl+D` shows or hides detailed explanations.
- `←` / `→` moves through the current journey.
- `Backspace` deletes input normally. When the input is empty, press it twice consecutively to return to the operation menu.
- `Esc` and `Ctrl+O` also return to the operation menu. `Ctrl+Q` quits.
- In DES/3DES labs, `Ctrl+K` edits the key and `Ctrl+I` edits the IV.

Base/ASCII provides additional session shortcuts:

- `Ctrl+S` swaps source and target, then places the latest result in the input line.
- `Ctrl+B` or `Ctrl+T` opens the combined source-and-target picker.
- In the picker, use up/down for the source, left/right for the target, Enter to confirm, and Backspace or Esc to cancel.

After every successful conversion, the input line is cleared and focused while the current source and target modes stay selected. Type the next value and press Enter without returning through the setup flow.

ASCII mode is deliberately limited to code points 0–127. Text-to-base encoding and base-to-text decoding use whitespace-separated character codes. Binary, octal, and hexadecimal ASCII values are padded to 8, 3, and 2 digits respectively.

## Motion and Accessibility

The logo remains visible in every lab, animates for about 2.5 seconds, and starts another cycle every 5 seconds.

Run with an unchanged static logo:

```sh
npx stackoverfolk --no-animation
```

Set `STACKOVERFOLK_REDUCED_MOTION=1` for a short reveal. Non-interactive terminals and `CI=true` print the static banner without opening the application.

## Security Notice

StackOverFolk is an educational lab, not a production cryptography system or secret-management tool. DES and 3DES are obsolete and must not be used to protect real data. The P-256 and AES-GCM lab demonstrates modern primitives, but its session-oriented workflow is designed for exploration rather than deployment.

## Development

```sh
git clone https://github.com/wisraut/StackOverFolk.git
cd StackOverFolk
npm install
npm start
```

Run the automated tests and inspect the npm package contents:

```sh
npm test
npm pack --dry-run
```

## License

StackOverFolk is available under the [MIT License](LICENSE).
