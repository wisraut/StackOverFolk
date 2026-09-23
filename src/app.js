import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, useApp, useInput, useStdout } from 'ink';
import chalk from 'chalk';
import { ConversionError } from './converter.js';
import { ASCII_MODE, UI_BASES, createConversionJourney, formatMode } from './journey.js';
import { createHashJourney, CryptoOperationError } from './operations/hash.js';
import { createDesJourney, DEFAULT_DES_SETTINGS, DEFAULT_3DES_SETTINGS } from './operations/des.js';
import { createEccSession, createEccEncryptJourney, createEccDecryptJourney } from './operations/ecc.js';
import { renderAnimationFrame, renderStaticBanner } from './banner.js';

const MODES = [...UI_BASES, ASCII_MODE];
const VIEWS = ['Guided', 'Quick', 'Full Trace'];
const BACKSPACE_HINT = 'กด Backspace อีกครั้งเพื่อกลับหน้าเลือก';
const ITEMS = [
  { id: 'base', label: 'Base / ASCII Converter', hint: 'แปลงเลขฐานและรหัส ASCII พร้อมดูวิธีทำ' },
  { id: 'sha256', label: 'SHA-256 Hash', hint: 'สร้าง digest 256 บิต (ย้อนกลับไม่ได้)' },
  { id: 'sha512', label: 'SHA-512 Hash', hint: 'สร้าง digest 512 บิต (ย้อนกลับไม่ได้)' },
  { id: 'des-encrypt', label: 'DES Encrypt · Legacy', hint: 'CBC + PKCS#7 เพื่อการศึกษาเท่านั้น' },
  { id: 'des-decrypt', label: 'DES Decrypt · Legacy', hint: 'ถอดรหัส DES จาก hexadecimal' },
  { id: '3des-encrypt', label: '3DES Encrypt · Legacy', hint: '3-key EDE-CBC เพื่อการศึกษาเท่านั้น' },
  { id: '3des-decrypt', label: '3DES Decrypt · Legacy', hint: 'ถอดรหัส 3DES จาก hexadecimal' },
  { id: 'ecc-encrypt', label: 'ECC Hybrid Encrypt', hint: 'P-256 ECDH + HKDF-SHA256 + AES-256-GCM' },
  { id: 'ecc-decrypt', label: 'ECC Hybrid Decrypt', hint: 'ตรวจสอบและถอด payload ใน session นี้' },
];
const palette = { green: '#45A164', gold: '#E0A82E', blue: '#4EA5D9', gray: '#8B949E', red: '#E5534B' };

function modeChoices(excluding) { return MODES.filter((mode) => mode !== excluding); }
function nextMode(current, excluding) {
  const choices = modeChoices(excluding);
  const index = choices.indexOf(current);
  return choices[(index + 1) % choices.length];
}
function truncate(value, length = 72) { const text = String(value); return text.length > length ? `${text.slice(0, length - 1)}…` : text; }
function companion(id) {
  return ({ 'des-encrypt': 'des-decrypt', 'des-decrypt': 'des-encrypt', '3des-encrypt': '3des-decrypt', '3des-decrypt': '3des-encrypt', 'ecc-encrypt': 'ecc-decrypt', 'ecc-decrypt': 'ecc-encrypt' })[id];
}

export function logoLoopTimeline(elapsed, reducedMotion = false) {
  const phase = Math.max(0, elapsed) % 5000;
  const duration = reducedMotion ? 350 : 2500;
  if (phase > duration) return 2500;
  return reducedMotion ? Math.round((phase / duration) * 2500) : phase;
}

function AnimatedLogo({ banner, animate, reducedMotion }) {
  const [timeline, setTimeline] = useState(0);
  useEffect(() => {
    if (!banner || !animate) return undefined;
    const startedAt = Date.now();
    const timer = setInterval(() => setTimeline(logoLoopTimeline(Date.now() - startedAt, reducedMotion)), reducedMotion ? 80 : 40);
    return () => clearInterval(timer);
  }, [banner, animate, reducedMotion]);
  if (!banner) return null;
  return React.createElement(Text, null, animate ? renderAnimationFrame(banner, timeline, 2500) : renderStaticBanner(banner));
}

function Home({ cursor }) {
  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { color: palette.blue, bold: true }, 'STACKOVERFOLK · CRYPTO & CONVERSION LAB'),
    React.createElement(Text, { color: palette.gray }, 'เลือกสิ่งที่ต้องการทำ แล้วใส่ค่าต่อไปได้ทันทีโดยไม่ต้องย้อนหลายชั้น'),
    React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
      ...ITEMS.map((item, index) => React.createElement(Box, { key: item.id, flexDirection: 'column' },
        React.createElement(Text, { color: index === cursor ? palette.gold : undefined, bold: index === cursor }, `${index === cursor ? '›' : ' '} ${index + 1}. ${item.label}`),
        index === cursor && React.createElement(Text, { color: palette.gray }, `     ${item.hint}`),
      )),
    ),
    React.createElement(Text, { color: palette.gray }, '↑/↓ เลือก · Enter เปิด · 1–9 ทางลัด · Ctrl+Q ออก'),
  );
}

function rail(stages, selected, compact) {
  if (compact) return [stages[selected - 1]?.title && `← ${stages[selected - 1].title}`, `◉ ${stages[selected].title.toUpperCase()}`, stages[selected + 1]?.title && `${stages[selected + 1].title} →`].filter(Boolean).join(' · ');
  return stages.map((stage, index) => `${index < selected ? '●' : index === selected ? '◉' : '○'} ${stage.title.toUpperCase()}`).join(' ─ ');
}

function Journey({ journey, selected, details, view, compact }) {
  if (!journey) return null;
  if (view === 1) return React.createElement(Box, { flexDirection: 'column', borderStyle: 'round', borderColor: palette.green, paddingX: 1, marginTop: 1 },
    React.createElement(Text, { color: palette.green, bold: true }, 'RESULT'),
    React.createElement(Text, null, journey.output),
  );
  if (view === 2) return React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
    ...journey.stages.map((stage, index) => React.createElement(Box, { key: stage.id, flexDirection: 'column', borderStyle: 'round', borderColor: index === selected ? palette.gold : palette.gray, paddingX: 1 },
      React.createElement(Text, { color: index === selected ? palette.gold : palette.blue, bold: true }, `${String(index + 1).padStart(2, '0')} · ${stage.title.toUpperCase()}`),
      React.createElement(Text, null, truncate(stage.summary, compact ? 52 : 100)),
      details && React.createElement(Text, { color: palette.gray }, stage.details),
    )),
  );
  const stage = journey.stages[selected];
  const received = stage.received ?? 'ค่าจากขั้นก่อนหน้า';
  const operation = stage.operation ?? stage.details;
  const produced = stage.produced ?? stage.summary;
  const why = stage.explanation ?? stage.details;
  return React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
    React.createElement(Text, { color: palette.gray }, rail(journey.stages, selected, compact)),
    React.createElement(Box, { flexDirection: 'column', borderStyle: 'round', borderColor: palette.gold, paddingX: 1 },
      React.createElement(Text, { color: palette.gold, bold: true }, `${String(selected + 1).padStart(2, '0')} · ${stage.title.toUpperCase()}`),
      React.createElement(Text, null, `${chalk.hex(palette.blue)('รับเข้า     ')}${truncate(received, compact ? 52 : 106)}`),
      React.createElement(Text, null, `${chalk.hex(palette.blue)('ทำอะไร     ')}${truncate(operation, compact ? 52 : 106)}`),
      React.createElement(Text, null, `${chalk.hex(palette.blue)('ได้ผล      ')}${truncate(produced, compact ? 52 : 106)}`),
      React.createElement(Text, { color: palette.gray }, details ? `ทำไม: ${why}` : 'กด Ctrl+D เพื่อดูเหตุผลและรายละเอียด'),
    ),
    React.createElement(Text, { color: palette.green }, `ผลล่าสุด: ${truncate(journey.output, compact ? 58 : 120)}`),
  );
}

function BasePicker({ kind, current, other, cursor }) {
  return React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
    React.createElement(Text, { color: palette.gold, bold: true }, `เลือกโหมด${kind === 'from' ? 'ต้นทาง' : 'ปลายทาง'}`),
    ...modeChoices(other).map((choice, index) => React.createElement(Text, { key: String(choice), color: index === cursor ? palette.gold : undefined }, `${index === cursor ? '›' : ' '} ${formatMode(choice)}${choice === current ? ' (current)' : ''}`)),
    React.createElement(Text, { color: palette.gray }, '↑/↓ เลือก · Enter ยืนยัน · Backspace/Esc ย้อนกลับ'),
  );
}

export function App({ initialFrom = 10, initialTo = 2, onExit, banner = null, animateLogo = false, reducedMotion = false } = {}) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const eccSession = useMemo(() => createEccSession(), []);
  const [screen, setScreen] = useState('home');
  const [homeIndex, setHomeIndex] = useState(0);
  const [operation, setOperation] = useState('base');
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [input, setInput] = useState('');
  const [journey, setJourney] = useState(null);
  const [lastInput, setLastInput] = useState('');
  const [stageIndex, setStageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [view, setView] = useState(0);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState(null);
  const [pickerIndex, setPickerIndex] = useState(0);
  const [configureBoth, setConfigureBoth] = useState(false);
  const [desSettings, setDesSettings] = useState({ DES: { ...DEFAULT_DES_SETTINGS }, '3DES': { ...DEFAULT_3DES_SETTINGS } });
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [backspaceArmed, setBackspaceArmed] = useState(false);
  const pickerChoices = useMemo(() => picker ? modeChoices(picker === 'from' ? to : from) : [], [picker, from, to]);
  const item = ITEMS.find((candidate) => candidate.id === operation) ?? ITEMS[0];
  const compact = (stdout.columns ?? 100) < 80;

  function close() { onExit?.(); exit(); }
  function enterOperation(next) { setOperation(next); setScreen('operation'); setInput(''); setJourney(null); setError(''); setStageIndex(0); setBackspaceArmed(false); }
  function goHome() { setScreen('home'); setJourney(null); setInput(''); setError(''); setPicker(null); setEditing(null); setBackspaceArmed(false); }
  function openPicker(kind, both = false) { const current = kind === 'from' ? from : to; setPicker(kind); setConfigureBoth(both); setPickerIndex(Math.max(0, modeChoices(kind === 'from' ? to : from).indexOf(current))); }
  function applyTarget(selected) {
    setTo(selected); setError('');
    if (!lastInput) return;
    try {
      const next = createConversionJourney(lastInput, from, selected);
      setJourney(next); setStageIndex(next.stages.length - 1);
    } catch (caught) {
      setError(caught.message);
    }
  }
  function cycleSource() {
    setFrom(nextMode(from, to)); setJourney(null); setLastInput(''); setError('');
  }
  function cycleTarget() { applyTarget(nextMode(to, from)); }
  function cryptoJourney(value, id = operation) {
    if (id === 'sha256' || id === 'sha512') return createHashJourney(value, id);
    if (id.startsWith('des-') || id.startsWith('3des-')) {
      const algorithm = id.startsWith('3des') ? '3DES' : 'DES';
      return createDesJourney(value, { algorithm, action: id.endsWith('decrypt') ? 'decrypt' : 'encrypt', ...desSettings[algorithm] });
    }
    return id === 'ecc-encrypt' ? createEccEncryptJourney(value, eccSession) : createEccDecryptJourney(value, eccSession);
  }
  function run() {
    if (input === '') return setError('กรุณาใส่ค่าก่อนเริ่มทำงาน');
    try {
      const next = operation === 'base' ? createConversionJourney(input, from, to) : cryptoJourney(input);
      setJourney(next); setLastInput(input); setStageIndex(next.stages.length - 1); setShowDetails(false); setInput(''); setError('');
    } catch (caught) {
      const known = caught instanceof ConversionError || caught instanceof CryptoOperationError;
      setError(`${known && caught.code ? `[${caught.code}] ` : ''}${caught.message}`);
    }
  }
  function reuseAndSwitch() {
    const next = companion(operation);
    if (!next || !journey) return;
    setOperation(next); setInput(journey.rawOutput ?? journey.output); setJourney(null); setLastInput(''); setStageIndex(0); setError('');
  }

  useInput((character, key) => {
    if (key.ctrl && (character === 'q' || character === 'c')) return close();
    if (key.ctrl && character === 'o' && screen !== 'home') return goHome();
    if (screen === 'home') {
      if (key.upArrow) return setHomeIndex((value) => Math.max(0, value - 1));
      if (key.downArrow) return setHomeIndex((value) => Math.min(ITEMS.length - 1, value + 1));
      if (key.return) return enterOperation(ITEMS[homeIndex].id);
      if (/^[1-9]$/.test(character) && Number(character) <= ITEMS.length) return enterOperation(ITEMS[Number(character) - 1].id);
      return;
    }
    if (editing) {
      if (key.escape) { setEditing(null); setEditValue(''); return; }
      if (key.return) {
        const algorithm = operation.startsWith('3des') ? '3DES' : 'DES';
        const expected = editing === 'keyHex' ? (algorithm === '3DES' ? 48 : 16) : 16;
        if (!new RegExp(`^[0-9a-fA-F]{${expected}}$`).test(editValue)) return setError(`ต้องเป็น hexadecimal ${expected} ตัวอักษร`);
        setDesSettings((all) => ({ ...all, [algorithm]: { ...all[algorithm], [editing]: editValue.toUpperCase() } }));
        setEditing(null); setEditValue(''); setJourney(null); setError(''); return;
      }
      if (key.backspace || key.delete) return setEditValue((value) => value.slice(0, -1));
      if (!key.ctrl && !key.meta && /^[0-9a-fA-F]$/.test(character)) setEditValue((value) => value + character);
      return;
    }
    if (picker) {
      if (key.escape || key.backspace || key.delete) { setPicker(null); setConfigureBoth(false); return; }
      if (key.upArrow) return setPickerIndex((value) => Math.max(0, value - 1));
      if (key.downArrow) return setPickerIndex((value) => Math.min(pickerChoices.length - 1, value + 1));
      if (key.return) {
        const selected = pickerChoices[pickerIndex]; setError('');
        if (picker === 'from') { setFrom(selected); if (configureBoth) { const targets = modeChoices(selected); setJourney(null); setLastInput(''); setInput(''); setPicker('to'); setPickerIndex(Math.max(0, targets.indexOf(to))); setConfigureBoth(false); } else setPicker(null); }
        else { applyTarget(selected); setPicker(null); }
      }
      return;
    }
    if (!key.backspace && !key.delete && backspaceArmed) {
      setBackspaceArmed(false);
      if (error === BACKSPACE_HINT) setError('');
    }
    if (key.escape) return goHome();
    if (key.leftArrow && journey) return setStageIndex((value) => Math.max(0, value - 1));
    if (key.rightArrow && journey) return setStageIndex((value) => Math.min(journey.stages.length - 1, value + 1));
    if (key.return) return run();
    if (key.backspace || key.delete) {
      if (input.length > 0) {
        setBackspaceArmed(false);
        return setInput((value) => value.slice(0, -1));
      }
      if (backspaceArmed) return goHome();
      setBackspaceArmed(true);
      setError(BACKSPACE_HINT);
      return;
    }
    if (key.tab && journey) { setInput(journey.rawOutput ?? journey.output); setJourney(null); setLastInput(''); setError(''); return; }
    if (key.ctrl && character === 'm') { setView((value) => (value + 1) % VIEWS.length); return; }
    if (key.ctrl && character === 'd' && journey) { setShowDetails((value) => !value); return; }
    if (key.ctrl && character === 'a' && companion(operation)) return reuseAndSwitch();
    if (operation === 'base' && key.ctrl && character === 's') { const reusable = journey?.rawOutput ?? ''; setFrom(to); setTo(from); if (reusable) { setInput(reusable); setJourney(null); setLastInput(''); } setError(''); return; }
    if (operation === 'base' && key.ctrl && character === 't') return cycleTarget();
    if (operation === 'base' && key.ctrl && character === 'b') return cycleSource();
    if (operation === 'base' && key.ctrl && character === 'e') return openPicker('from', true);
    if (/^(3?des)-/.test(operation) && key.ctrl && (character === 'k' || character === 'i')) { const field = character === 'k' ? 'keyHex' : 'ivHex'; setEditing(field); setEditValue(''); setError(''); return; }
    if (!key.ctrl && !key.meta && character) { setBackspaceArmed(false); setInput((value) => value + character); setError(''); }
  });

  if (screen === 'home') return React.createElement(Box, { flexDirection: 'column', paddingX: 1 },
    React.createElement(AnimatedLogo, { banner, animate: animateLogo, reducedMotion }),
    React.createElement(Home, { cursor: homeIndex }),
  );
  const isDes = /^(3?des)-/.test(operation);
  const algorithm = operation.startsWith('3des') ? '3DES' : 'DES';
  return React.createElement(Box, { flexDirection: 'column', paddingX: 1 },
    React.createElement(AnimatedLogo, { banner, animate: animateLogo, reducedMotion }),
    React.createElement(Text, { color: palette.blue, bold: true }, item.label.toUpperCase()),
    React.createElement(Text, { color: palette.gray }, item.hint),
    operation === 'base' && React.createElement(Text, { color: palette.gray }, `การตั้งค่าปัจจุบัน: ${formatMode(from)}  →  ${formatMode(to)}`),
    isDes && React.createElement(React.Fragment, null,
      React.createElement(Text, { color: palette.red }, `⚠ ${algorithm} เลิกใช้แล้ว—โหมดนี้มีไว้เรียนรู้เท่านั้น`),
      React.createElement(Text, { color: palette.gray }, `Key ${desSettings[algorithm].keyHex} · IV ${desSettings[algorithm].ivHex}`),
    ),
    operation.startsWith('ecc-') && React.createElement(Text, { color: palette.gray }, `Session P-256 public key: ${truncate(eccSession.publicKey, 54)} (private key ไม่แสดง)`),
    picker ? React.createElement(BasePicker, { kind: picker, current: picker === 'from' ? from : to, other: picker === 'from' ? to : from, cursor: pickerIndex }) : React.createElement(React.Fragment, null,
      editing && React.createElement(Text, { color: palette.gold }, `แก้ ${editing === 'keyHex' ? 'Key' : 'IV'}: ${editValue}▌  (Enter บันทึก · Esc ยกเลิก)`),
      React.createElement(Journey, { journey, selected: stageIndex, details: showDetails, view, compact }),
      error && React.createElement(Text, { color: palette.red }, error),
      !editing && React.createElement(Box, { marginTop: 1 }, React.createElement(Text, { color: palette.gold, bold: true }, 'กรอกค่า  '), React.createElement(Text, null, `${input || ' '}▌`)),
      React.createElement(Text, { color: palette.gray }, `มุมมอง: ${VIEWS[view]} · Enter ทำงาน · Tab ใช้ผลเป็น input ถัดไป · ←/→ Journey · Ctrl+M เปลี่ยนมุมมอง · Ctrl+D รายละเอียด`),
      React.createElement(Text, { color: palette.gray }, operation === 'base' ? 'Ctrl+B ต้นทางถัดไป · Ctrl+T ปลายทางถัดไป · Ctrl+E เลือกแบบเต็ม · Ctrl+S สลับ · Backspace×2 หน้าเลือก · Ctrl+Q ออก' : `${companion(operation) ? 'Ctrl+A สลับ Encrypt/Decrypt · ' : ''}${isDes ? 'Ctrl+K Key · Ctrl+I IV · ' : ''}Backspace×2 หน้าเลือก · Ctrl+Q ออก`),
    ),
  );
}
