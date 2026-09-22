# Graph Report - StackOverFolk  (2026-09-22)

## Corpus Check
- 20 files · ~25,181 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 3)

## Summary
- 164 nodes · 248 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9eb4a3a9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- banner.js
- app.js
- StackOverFolk — Project Plan
- journey.js
- 10. Delivery phases
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

## God Nodes (most connected - your core abstractions)
1. `StackOverFolk — Project Plan` - 15 edges
2. `App()` - 13 edges
3. `ConversionError` - 9 edges
4. `parseInteger()` - 9 edges
5. `10. Delivery phases` - 9 edges
6. `playBannerAnimation()` - 8 edges
7. `createNumericJourney()` - 8 edges
8. `createConversionJourney()` - 8 edges
9. `renderAnimationFrame()` - 7 edges
10. `encodeAscii()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `main()` --indirect_call--> `App()`  [INFERRED]
  index.js → src/app.js
- `main()` --calls--> `playBannerAnimation()`  [EXTRACTED]
  index.js → src/banner.js
- `main()` --calls--> `printBanner()`  [EXTRACTED]
  index.js → src/banner.js
- `runConversion()` --calls--> `createConversionJourney()`  [EXTRACTED]
  src/app.js → src/journey.js
- `App()` --calls--> `createConversionJourney()`  [EXTRACTED]
  src/app.js → src/journey.js

## Import Cycles
- None detected.

## Communities (16 total, 4 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (27): author, bin, stackoverfolk, dependencies, chalk, figlet, ink, jimp (+19 more)

### Community 1 - "banner.js"
Cohesion: 0.21
Nodes (17): main(), shouldAnimate(), ink, createBanner(), cropReveal(), deterministicNoise(), __dirname, __filename (+9 more)

### Community 2 - "app.js"
Cohesion: 0.16
Nodes (17): chalk, ink-testing-library, react, App(), openPicker(), runConversion(), BasePicker(), FocusCard() (+9 more)

### Community 3 - "StackOverFolk — Project Plan"
Cohesion: 0.09
Nodes (22): 11. Acceptance criteria, 12. Instructions for future models and development sessions, 13. Open decisions, 14. Implemented baseline (2026-09-22), 1. Project summary, 2. Current project state, 3. Product direction, 3DES (+14 more)

### Community 4 - "journey.js"
Cohesion: 0.24
Nodes (19): assertBase(), ConversionError, convert, convertInteger(), decodeAscii(), encodeAscii(), escapeAscii(), formatAsciiCode() (+11 more)

### Community 5 - "10. Delivery phases"
Cohesion: 0.22
Nodes (9): 10. Delivery phases, Phase 0 — Baseline and tests ✅, Phase 1 — Journey foundation (base/ASCII slice complete), Phase 2 — Session workflow (base/ASCII slice complete), Phase 3 — Migrate base conversion ✅, Phase 4 — Hashing, Phase 5 — DES and 3DES, Phase 6 — ECC hybrid journey (+1 more)

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
Cohesion: 0.40
Nodes (4): Controls, Development, Run, StackOverFolk

## Knowledge Gaps
- **74 isolated node(s):** `name`, `version`, `description`, `main`, `type` (+69 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 88 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `main()` (5× useful, score=4.470894373) _(code changed — re-verify)_
- `convert()` (5× useful, score=4.470894373) _(code changed — re-verify)_
- `prompts.js` (5× useful, score=4.470894373) _(code changed — re-verify)_
- `askAgain()` (3× useful, score=2.735659803) _(code changed — re-verify)_
- `converter.js` (3× useful, score=2.735408051) _(code changed — re-verify)_
- `askNumber()` (3× useful, score=2.603056134) _(code changed — re-verify)_
- `package.json` (2× useful, score=1.867838239) _(code changed — re-verify)_
- `banner.js` (2× useful, score=1.735576263) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `chalk` connect `app.js` to `package.json`, `banner.js`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `react` connect `app.js` to `package.json`, `banner.js`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `main()` and `BasePicker()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `StackOverFolk — Project Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._