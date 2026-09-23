# StackOverFolk — Project Plan

> Status: base/ASCII and cryptography lab vertical slices implemented
> Last updated: 2026-09-23
> Purpose: shared roadmap and handoff document for future development sessions and models

## 1. Project summary

StackOverFolk is a learning-focused CLI application. The current version converts numbers between bases. The planned upgrade turns it into an interactive cryptography learning tool that does two things at the same time:

1. Produces the correct result for a conversion, hash, encryption, or decryption operation.
2. Shows a clear journey explaining how the input changes at each meaningful stage.

This is a side project for coursework and experimentation. Educational clarity is the primary goal. It is not intended to become a production cryptography system.

## 2. Current project state

The application is a Node.js ESM CLI rendered with Ink.

- `index.js` selects animated/static startup behavior and launches the app.
- `src/app.js` owns session state, pickers, keyboard navigation, and the practical repeated-input loop.
- `src/converter.js` provides precise `BigInt` number conversion and strict ASCII encoding/decoding.
- `src/journey.js` converts real operations into structured stages for the renderer.
- `src/banner.js` preserves the green/gold Jimp and Figlet banner and adds the startup animation.

Current high-level flow:

```text
Animated banner → Base/ASCII session → Enter value → Journey + result
                                      ↑                    │
                                      └── next value ──────┘
```

## 3. Product direction

The application should grow from a base converter into a small educational workbench with these operation groups:

```text
StackOverFolk
├─ Base conversion
├─ Hashing
│  ├─ SHA-256
│  └─ SHA-512
├─ Symmetric cryptography
│  ├─ DES       (legacy / educational)
│  └─ 3DES      (legacy / educational)
└─ Elliptic-curve cryptography
   └─ ECC hybrid encryption journey
```

Possible modern comparison work, such as AES-GCM, is optional and is not part of the first implementation milestone.

## 4. Cryptography terminology and safety rules

The UI and documentation must use the following terms correctly:

- DES and 3DES support encryption and decryption, but are obsolete and must be labelled as legacy educational algorithms.
- SHA-256 and SHA-512 are one-way hash functions. The UI must never offer a `Decrypt` action for them.
- ECC should not be presented as directly encrypting arbitrary plaintext by itself. The planned ECC journey should demonstrate a hybrid construction such as ephemeral key generation, ECDH shared-secret derivation, KDF, symmetric authenticated encryption, and packaging the result.
- Educational implementations must not be presented as safe for protecting real secrets.
- Keys, IVs, padding, text encoding, and output encoding must always be visible in the session settings.
- Test vectors are required before an algorithm can be marked complete.

## 5. Core UX: Crypto Journey Lens

The signature interface is a compact Journey Rail plus one expanded Focus Card. The application should not print a long wall of trace logs by default.

```text
DES · ENCRYPT · GUIDED                              STEP 2 / 5

● INPUT ─── ● ENCODE ─── ◉ BLOCKS ─── ○ ROUNDS ─── ○ OUTPUT

┌─ 02 · SPLIT INTO BLOCKS ─────────────────────────────┐
│ RECEIVED    48 65 6C 6C 6F                           │
│ OPERATION   Apply padding and split every 8 bytes     │
│ PRODUCED    Block 1: 48656C6C6F030303                 │
│ WHY         DES processes one 64-bit block at a time  │
└───────────────────────────────────────────────────────┘

[Enter] Next   [D] Details   [B] Back   [A] All   [Q] Quit
```

Every normal stage should use the same four fields:

- `RECEIVED`: the value entering the stage.
- `OPERATION`: the transformation being performed.
- `PRODUCED`: the value leaving the stage.
- `WHY`: the reason the stage exists.

Detailed bit tables, formulas, and repeated rounds belong in an optional details view.

### Journey display modes

- `Guided Journey`: default mode; shows one stage at a time.
- `Quick Result`: skips directly to the final result.
- `Full Trace`: exposes all available internal detail for study and debugging.

### Repeated rounds

Do not expand every DES or SHA round by default. Show a compact summary and allow individual or full expansion.

```text
Feistel rounds
├─ Round 01       expanded
├─ Rounds 02–15   collapsed
└─ Round 16       summary
```

### Visual language

- Green: completed stages.
- Gold/amber: current stage.
- Blue: keys, IVs, and metadata.
- Gray: pending stages and supporting explanations.
- Red: errors and legacy/security warnings.
- Use one border around the current Focus Card; avoid boxing every value.
- Group binary and hexadecimal values into readable chunks.
- On narrow terminals, replace the horizontal rail with a compact vertical or abbreviated layout.

## 6. Fast repeated input: session loop

After showing a result, the application must focus the next input field immediately. The user should not need to return through the home screen or choose the algorithm again.

```text
DES · ENCRYPT · GUIDED
Key: 13345779...   Output: HEX

✓ Journey completed
  Input → Encode → Padding → Blocks → 16 Rounds → Output

┌─ RESULT ────────────────────────────────────────────┐
│ 85E813540F0AB405                                    │
└────────────────────────────────────────────────────┘

NEXT INPUT
> _

[Enter] Run again   [↑] Previous input   [Tab] Use result
[Ctrl+E] Edit settings                    [Esc] Home
```

The session should retain:

- Algorithm and operation.
- Key, IV, mode, and padding settings when applicable.
- Input and output encodings.
- Journey display mode.

The completed journey should collapse to one summary line after a run and remain reopenable. Typing a new value is the primary action; editing settings and returning home are secondary actions.

Desired navigation:

```text
Home → Configure session → Run operation
                             ↑       │
                             └───────┘
                              Next input
```

## 7. Planned internal architecture

Algorithm code must not print directly to the terminal. It should return structured journey data. A separate renderer owns terminal layout, colors, navigation, and responsive behavior.

Example result shape:

```js
{
  meta: {
    algorithm: "DES",
    action: "encrypt",
    journeyMode: "guided"
  },
  stages: [
    {
      id: "padding",
      title: "Apply padding",
      received: "...",
      operation: "...",
      produced: "...",
      explanation: "...",
      details: []
    }
  ],
  result: {
    value: "...",
    encoding: "hex"
  }
}
```

Target module responsibilities:

```text
index.js / application runner
├─ owns the top-level session loop
├─ selects an operation
├─ passes settings and input to an engine
└─ passes structured results to the renderer

src/operations/
├─ base-conversion
├─ hashing
├─ des
├─ triple-des
└─ ecc-hybrid

src/journey/
├─ renderer
├─ navigation
├─ formatting
└─ terminal-width adaptation

src/session/
├─ session state
├─ settings
└─ input history
```

Names may change during implementation, but the boundaries should remain: prompts collect data, engines compute data, and the renderer displays data.

## 8. Journey outlines by operation

### Base conversion

```text
Input → Normalize → Validate → Parse → Convert → Output
```

This should be the first operation migrated to the new journey architecture because it already exists and provides a low-risk way to validate the renderer and session loop.

### DES

```text
Input → Text encoding → Padding → 64-bit blocks
      → Initial permutation → 16 Feistel rounds
      → Final permutation → Output encoding
```

### 3DES

```text
Input → Encoding → Padding → Blocks
      → DES stage 1 → DES stage 2 → DES stage 3
      → Output encoding
```

The journey must state whether the selected construction is EDE and whether two or three independent keys are being used.

### SHA-256 / SHA-512

```text
Input → UTF-8 bytes → Padding → Message blocks
      → Compression rounds → Digest → Output encoding
```

The final screen must use `Digest`, not `Encrypted text`, and must not show a decrypt action.

### ECC hybrid encryption

```text
Input → Recipient public key → Ephemeral key pair
      → ECDH shared secret → KDF → Symmetric encryption
      → Authentication data/tag → Packaged payload
```

Decryption reverses the packaging and symmetric-encryption stages after deriving the same shared secret. Private keys must never be displayed unless the user explicitly enables an educational detail view.

## 9. Implementation strategy for educational traces

Standard crypto APIs usually return only the final output and do not expose internal DES or SHA rounds. Therefore, the trace requirement needs an explicit strategy:

1. Implement the renderer and data contract using base conversion first.
2. Build trace-capable educational implementations for stages that need internal visualization.
3. Validate final outputs against published known-answer test vectors and a trusted reference implementation wherever available.
4. Keep any simplified explanation labelled clearly; do not display invented intermediate values.
5. Separate educational trace code from any wrapper around platform crypto APIs.

Correct output and honest explanation are both acceptance requirements.

## 10. Delivery phases

### Phase 0 — Baseline and tests ✅

- Record current base-conversion behavior.
- Add tests for supported bases, invalid digits, case handling, and edge cases.
- Keep the existing CLI working while new architecture is introduced.

### Phase 1 — Journey foundation (base/ASCII slice complete)

- Define the structured journey schema.
- Implement the Journey Rail and Focus Card renderer.
- Add Guided, Quick Result, and Full Trace modes.
- Handle narrow terminal widths.

### Phase 2 — Session workflow (base/ASCII slice complete)

- Replace the boolean `askAgain()` behavior with a session result loop.
- Autofocus `Next Input` after each result.
- Retain settings and input history.
- Add explicit actions for edit settings, reuse result, and return home.

### Phase 3 — Migrate base conversion ✅

- Make base conversion produce journey stages.
- Verify that output matches the current converter.
- Use this phase to stabilize navigation and rendering before adding crypto.

### Phase 4 — Hashing

- Add SHA-256 and SHA-512.
- Implement correct byte, padding, block, compression-summary, and digest stages.
- Add known-answer tests.

### Phase 5 — DES and 3DES

- Add strong legacy/security warnings.
- Implement traceable DES stages and expandable rounds.
- Build 3DES from validated DES stages.
- Add known-answer tests for encryption and decryption.

### Phase 6 — ECC hybrid journey

- Define the exact curve, KDF, symmetric cipher, and payload format before coding.
- Implement key generation and shared-secret stages.
- Add authenticated symmetric encryption and decryption.
- Add round-trip, tamper-detection, and test-vector coverage.

### Phase 7 — Polish

- Improve copy, colors, spacing, and error messages.
- Add examples and an in-app explanation of security limitations.
- Test on common Windows terminal widths.
- Update README/user documentation.

## 11. Acceptance criteria

A feature is complete only when:

- Its final result is verified by automated tests or a known-answer vector.
- Every displayed intermediate value is real and corresponds to the input.
- Guided mode remains readable without scrolling through a wall of logs.
- Quick Result mode can complete the operation without opening the journey.
- The next input can be entered immediately without rebuilding the session.
- Errors explain what is invalid and how to correct it.
- Legacy and educational limitations are visible.
- Algorithm logic remains independent from terminal rendering.

## 12. Instructions for future models and development sessions

Before implementing a phase:

1. Read this file completely.
2. Inspect the current code and tests because the repository may have changed after this document was written.
3. Work on one delivery phase or one vertical slice at a time.
4. Preserve existing behavior unless the active phase explicitly replaces it.
5. Avoid adding unrelated frameworks or abstractions.
6. State assumptions when a cryptographic parameter or UX decision is not defined.
7. Add or update tests with every algorithm change.
8. Update this document when a planned decision changes or a phase is completed.

This plan applies only to StackOverFolk. Do not mix in requirements, code, or context from unrelated projects, including LINE–Dify Hospital Bridge.

## 13. Open decisions

These decisions should be made immediately before their relevant phase rather than guessed now:

- Ink is the selected terminal renderer; no additional prompt framework is required.
- DES modes and padding options included in the first release.
- Whether 3DES starts with two-key EDE, three-key EDE, or both.
- Exact ECC curve, KDF, AEAD cipher, and serialized payload format.
- How much round-level detail appears in Guided mode versus Full Trace.
- Whether AES-GCM should later be added as a modern comparison to DES/3DES.

## 14. Implemented baseline (2026-09-22)

The base-converter vertical slice is complete and is the foundation for later
labs:

- The established Jimp block-image and gold/green Figlet banner remains the
  final startup frame. A 2.5 second **Decode Through the Lenses** animation
  now resolves into it; any key skips, `--no-animation` disables it, and CI,
  non-TTY, and reduced-motion paths use a static or short reveal safely.
- Conversion uses `BigInt`, supports bases 2/8/10/16, accepts signs,
  whitespace, and leading zeroes, and reports coded validation errors.
- ASCII mode strictly supports 0–127 and visibly escapes control characters.
- Ink owns the interactive UI. The conversion engine produces structured
  journey stages, while the renderer owns the Journey Rail, Focus Card,
  results, and repeated-input session loop.
- Tests cover numeric precision, ASCII boundaries, journey data, animation
  milestones/final frame, and a basic Ink interaction.

## 15. Cryptography lab implementation (2026-09-23)

- Home now opens before input and directly lists Base/ASCII, SHA-256/512,
  DES/3DES encrypt/decrypt, and ECC hybrid encrypt/decrypt.
- The shared renderer supports Guided, Quick Result, and Full Trace views,
  persistent next input, result reuse, and direct encrypt/decrypt switching.
- SHA-256/512 journeys show UTF-8 bytes, padding, blocks, compression summary,
  and the real digest from Node's crypto implementation.
- DES uses a traceable educational implementation with CBC and PKCS#7;
  three-key 3DES composes it as EDE. Both display permanent legacy warnings.
- ECC hybrid uses P-256 ECDH, HKDF-SHA256, and AES-256-GCM. Payloads are
  versioned Base64url JSON and private keys are not displayed.
- Automated tests cover published SHA and DES vectors, DES/3DES round trips,
  ECC authenticated round trips, operation selection, and repeated input.

Remaining polish is optional: richer per-round expansion, input history, and a
modern AES-GCM comparison lab.
