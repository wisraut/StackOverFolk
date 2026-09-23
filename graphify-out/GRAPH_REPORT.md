# Graph Report - StackOverFolk  (2026-09-23)

## Corpus Check
- 29 files · ~28,778 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 3)

## Summary
- 244 nodes · 424 edges · 19 communities (15 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `37f24e4a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- banner.js
- app.js
- StackOverFolk — Project Plan
- journey.js
- des.js
- Q: Upgrade StackOverFolk from base conversion CLI into an educational crypto CLI with DES 3DES SHA-256 SHA-512 and ECC step visualization
- Q: ตอนนี้เรื่อง Feature หลักไม่มีปัญหารู้ว่าทำได้อยู่เเล้ว ทีนี้ปัญหามันจะเป็นตอนที่แสดงผลเป็น Jurney ว่าที่เรา Input เข้าไปผ่านตรงไหนออกมาเป็นอะไรบ้างปัญหาคือตรงนี้ว่าต้องทำยังไงให้ดูง่ายไม่ลก สวยดี
- Green Eyeglasses Graphic
- Q: ทีนี้อยากให้เลาที่ได้ผลพัพย์เเล้วการใส่ inpur ค่าต่อไปสามารถใส่ได้ง่ายหมายถึงไม่ได้ Navigate ไปไกลหลายชั้น ได้ไหม
- Q: อันนี้คือแพลนคล่าวๆอนาคตตอนทำใช้mode; อื่นทำ terra ไรพวกนี้นายใส่ Doc ที่เป็น .md เป็นแผนที่เราคุยกันไว้กฌไดเ
- Q: ทีนี้เหลือทำอะไรต่ก่อนที่จะเริ่มงาน
- StackOverFolk
- MockInput
- AGENTS.md
- CLAUDE.md
- ecc.js
- Q: อยากรันเองยังไง
- Q: CLI renders then exits immediately after the banner animation

## God Nodes (most connected - your core abstractions)
1. `App()` - 26 edges
2. `StackOverFolk — Project Plan` - 16 edges
3. `createDesJourney()` - 13 edges
4. `CryptoOperationError` - 12 edges
5. `createEccEncryptJourney()` - 11 edges
6. `createEccDecryptJourney()` - 11 edges
7. `desBlock()` - 10 edges
8. `renderAnimationFrame()` - 9 edges
9. `ConversionError` - 9 edges
10. `parseInteger()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `main()` --indirect_call--> `App()`  [INFERRED]
  index.js → src/app.js
- `main()` --calls--> `getBanner()`  [EXTRACTED]
  index.js → src/banner.js
- `main()` --calls--> `printBanner()`  [EXTRACTED]
  index.js → src/banner.js
- `main()` --calls--> `handoffInputToInk()`  [EXTRACTED]
  index.js → src/terminal-input.js
- `BasePicker()` --calls--> `formatMode()`  [EXTRACTED]
  src/app.js → src/journey.js

## Import Cycles
- None detected.

## Communities (19 total, 4 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (29): author, bin, stackoverfolk, dependencies, chalk, figlet, ink, jimp (+21 more)

### Community 1 - "banner.js"
Cohesion: 0.16
Nodes (18): main(), shouldAnimate(), AnimatedLogo(), createBanner(), cropReveal(), deterministicNoise(), __dirname, __filename (+10 more)

### Community 2 - "app.js"
Cohesion: 0.11
Nodes (26): ink-testing-library, react, App(), cryptoJourney(), openPicker(), reuseAndSwitch(), run(), BasePicker() (+18 more)

### Community 3 - "StackOverFolk — Project Plan"
Cohesion: 0.06
Nodes (32): 10. Delivery phases, 11. Acceptance criteria, 12. Instructions for future models and development sessions, 13. Open decisions, 14. Implemented baseline (2026-09-22), 15. Cryptography lab implementation (2026-09-23), 1. Project summary, 2. Current project state (+24 more)

### Community 4 - "journey.js"
Cohesion: 0.22
Nodes (20): assertBase(), ConversionError, convert, convertInteger(), decodeAscii(), encodeAscii(), escapeAscii(), formatAsciiCode() (+12 more)

### Community 5 - "des.js"
Cohesion: 0.13
Nodes (28): bigIntToBuffer(), bufferToBigInt(), createDesJourney(), DEFAULT_3DES_SETTINGS, DEFAULT_DES_SETTINGS, desBlock(), desBlockHex(), E (+20 more)

### Community 6 - "Q: Upgrade StackOverFolk from base conversion CLI into an educational crypto CLI with DES 3DES SHA-256 SHA-512 and ECC step visualization"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Upgrade StackOverFolk from base conversion CLI into an educational crypto CLI with DES 3DES SHA-256 SHA-512 and ECC step visualization, Source Nodes

### Community 7 - "Q: ตอนนี้เรื่อง Feature หลักไม่มีปัญหารู้ว่าทำได้อยู่เเล้ว ทีนี้ปัญหามันจะเป็นตอนที่แสดงผลเป็น Jurney ว่าที่เรา Input เข้าไปผ่านตรงไหนออกมาเป็นอะไรบ้างปัญหาคือตรงนี้ว่าต้องทำยังไงให้ดูง่ายไม่ลก สวยดี"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: ตอนนี้เรื่อง Feature หลักไม่มีปัญหารู้ว่าทำได้อยู่เเล้ว ทีนี้ปัญหามันจะเป็นตอนที่แสดงผลเป็น Jurney ว่าที่เรา Input เข้าไปผ่านตรงไหนออกมาเป็นอะไรบ้างปัญหาคือตรงนี้ว่าต้องทำยังไงให้ดูง่ายไม่ลก สวยดี, Source Nodes

### Community 9 - "Q: ทีนี้อยากให้เลาที่ได้ผลพัพย์เเล้วการใส่ inpur ค่าต่อไปสามารถใส่ได้ง่ายหมายถึงไม่ได้ Navigate ไปไกลหลายชั้น ได้ไหม"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: ทีนี้อยากให้เลาที่ได้ผลพัพย์เเล้วการใส่ inpur ค่าต่อไปสามารถใส่ได้ง่ายหมายถึงไม่ได้ Navigate ไปไกลหลายชั้น ได้ไหม, Source Nodes

### Community 10 - "Q: อันนี้คือแพลนคล่าวๆอนาคตตอนทำใช้mode; อื่นทำ terra ไรพวกนี้นายใส่ Doc ที่เป็น .md เป็นแผนที่เราคุยกันไว้กฌไดเ"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: อันนี้คือแพลนคล่าวๆอนาคตตอนทำใช้mode; อื่นทำ terra ไรพวกนี้นายใส่ Doc ที่เป็น .md เป็นแผนที่เราคุยกันไว้กฌไดเ, Source Nodes

### Community 11 - "Q: ทีนี้เหลือทำอะไรต่ก่อนที่จะเริ่มงาน"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: ทีนี้เหลือทำอะไรต่ก่อนที่จะเริ่มงาน, Source Nodes

### Community 12 - "StackOverFolk"
Cohesion: 0.33
Nodes (5): Controls, Development, Labs, Run, StackOverFolk

### Community 16 - "ecc.js"
Cohesion: 0.25
Nodes (15): createEccDecryptJourney(), createEccEncryptJourney(), createEccSession(), decodePayload(), deriveKey(), fromBase64Url(), HKDF_INFO, privateKeys (+7 more)

### Community 17 - "Q: อยากรันเองยังไง"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: อยากรันเองยังไง, Source Nodes

### Community 18 - "Q: CLI renders then exits immediately after the banner animation"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: CLI renders then exits immediately after the banner animation, Source Nodes

## Knowledge Gaps
- **94 isolated node(s):** `name`, `version`, `description`, `main`, `type` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 115 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `main()` (5× useful, score=4.463911462) _(code changed — re-verify)_
- `package.json` (3× useful, score=2.864866859) _(code changed — re-verify)_
- `converter.js` (3× useful, score=2.731135727)
- `banner.js` (2× useful, score=1.732865536)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `App()` connect `app.js` to `ecc.js`, `banner.js`, `journey.js`, `des.js`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `react` connect `app.js` to `package.json`, `banner.js`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `chalk` connect `package.json` to `banner.js`, `app.js`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `App()` (e.g. with `main()` and `AnimatedLogo()`) actually correct?**
  _`App()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10685483870967742 - nodes in this community are weakly interconnected._