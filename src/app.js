import React, { useMemo, useState } from 'react';
import { Box, Text, useApp, useInput, useStdout } from 'ink';
import chalk from 'chalk';
import { ConversionError } from './converter.js';
import { ASCII_MODE, UI_BASES, createConversionJourney, formatMode } from './journey.js';

const MODES = [...UI_BASES, ASCII_MODE];
const palette = {
  green: '#2D6A3F',
  gold: '#C8860A',
  blue: '#4EA5D9',
  gray: '#8B949E',
  red: '#E5534B',
};

function modeChoices(excluding) {
  return MODES.filter((mode) => mode !== excluding);
}

function rail(stages, selected, compact = false) {
  if (compact) {
    const previous = stages[selected - 1]?.title;
    const current = stages[selected].title;
    const next = stages[selected + 1]?.title;
    return [
      previous ? chalk.hex(palette.green)(`← ${previous}`) : null,
      chalk.hex(palette.gold)(`◉ ${current.toUpperCase()}`),
      next ? chalk.hex(palette.gray)(`${next} →`) : null,
    ].filter(Boolean).join(chalk.hex(palette.gray)(' · '));
  }
  return stages.map((stage, index) => {
    const marker = index < selected ? '●' : index === selected ? '◉' : '○';
    const color = index < selected ? palette.green : index === selected ? palette.gold : palette.gray;
    return chalk.hex(color)(`${marker} ${stage.title.toUpperCase()}`);
  }).join(chalk.hex(palette.gray)(' ─ '));
}

function FocusCard({ journey, selected, details }) {
  if (!journey) return null;
  const stage = journey.stages[selected];
  return React.createElement(Box, { flexDirection: 'column', borderStyle: 'round', borderColor: palette.gold, paddingX: 1, marginTop: 1 },
    React.createElement(Text, { color: palette.gold, bold: true }, `${String(selected + 1).padStart(2, '0')} · ${stage.title.toUpperCase()}`),
    React.createElement(Text, null, `${chalk.hex(palette.blue)('ผลขั้นนี้    ')}${stage.summary}`),
    React.createElement(Text, { color: palette.gray }, details ? stage.details : 'กด Ctrl+D เพื่อดูคำอธิบาย'),
  );
}

function BasePicker({ kind, current, other, cursor }) {
  const choices = modeChoices(other);
  return React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
    React.createElement(Text, { color: palette.gold, bold: true }, `เลือกโหมด${kind === 'from' ? 'ต้นทาง (source)' : 'ปลายทาง (target)'}`),
    ...choices.map((choice, index) => React.createElement(Text, { key: String(choice), color: index === cursor ? palette.gold : undefined },
      `${index === cursor ? '›' : ' '} ${formatMode(choice)}${choice === current ? ' (current)' : ''}`,
    )),
    React.createElement(Text, { color: palette.gray }, '↑/↓ เลือก · Enter ยืนยัน · Esc ยกเลิก'),
  );
}

export function App({ initialFrom = 10, initialTo = 2, onExit } = {}) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [input, setInput] = useState('');
  const [journey, setJourney] = useState(null);
  const [lastInput, setLastInput] = useState('');
  const [stageIndex, setStageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState(null);
  const [pickerIndex, setPickerIndex] = useState(0);
  const [configureBoth, setConfigureBoth] = useState(false);
  const pickerChoices = useMemo(() => picker ? modeChoices(picker === 'from' ? to : from) : [], [picker, from, to]);

  function close() {
    onExit?.();
    exit();
  }

  function openPicker(kind, both = false) {
    const current = kind === 'from' ? from : to;
    const other = kind === 'from' ? to : from;
    setPicker(kind);
    setConfigureBoth(both);
    setPickerIndex(Math.max(0, modeChoices(other).indexOf(current)));
  }

  function runConversion() {
    if (!input.trim()) {
      setError('Enter a value before converting.');
      return;
    }
    try {
      const nextJourney = createConversionJourney(input, from, to);
      setJourney(nextJourney);
      setLastInput(input);
      setStageIndex(nextJourney.stages.length - 1);
      setShowDetails(false);
      setInput('');
      setError('');
    } catch (caught) {
      setError(caught instanceof ConversionError ? `[${caught.code}] ${caught.message}` : caught.message);
    }
  }

  useInput((character, key) => {
    if (picker) {
      if (key.escape) return setPicker(null);
      if (key.upArrow) return setPickerIndex((index) => Math.max(0, index - 1));
      if (key.downArrow) return setPickerIndex((index) => Math.min(pickerChoices.length - 1, index + 1));
      if (key.return) {
        const selected = pickerChoices[pickerIndex];
        setError('');
        if (picker === 'from') {
          setFrom(selected);
          if (configureBoth) {
            const targets = modeChoices(selected);
            setJourney(null);
            setLastInput('');
            setInput('');
            setPicker('to');
            setPickerIndex(Math.max(0, targets.indexOf(to)));
            setConfigureBoth(false);
          } else {
            setPicker(null);
          }
        } else {
          setTo(selected);
          setPicker(null);
          if (lastInput) {
            try {
              const nextJourney = createConversionJourney(lastInput, from, selected);
              setJourney(nextJourney);
              setStageIndex(nextJourney.stages.length - 1);
              setShowDetails(false);
            } catch (caught) {
              setError(caught instanceof ConversionError ? `[${caught.code}] ${caught.message}` : caught.message);
            }
          }
        }
      }
      return;
    }

    if (key.ctrl && character === 'c') return close();
    if (key.escape) return journey ? setJourney(null) : close();
    if (key.leftArrow && journey) return setStageIndex((index) => Math.max(0, index - 1));
    if (key.rightArrow && journey) return setStageIndex((index) => Math.min(journey.stages.length - 1, index + 1));
    if (key.return) return runConversion();
    if (key.backspace || key.delete) {
      setInput((value) => value.slice(0, -1));
      return;
    }

    // Ctrl shortcuts do not steal uppercase ASCII or hexadecimal input.
    if (key.ctrl && character === 'q') return close();
    if (key.ctrl && character === 's') {
      const reusableOutput = journey?.rawOutput ?? '';
      setFrom(to);
      setTo(from);
      if (reusableOutput) {
        setInput(reusableOutput);
        setJourney(null);
        setLastInput('');
        setStageIndex(0);
        setShowDetails(false);
      }
      setError('');
      return;
    }
    if (key.ctrl && character === 't') return openPicker('to');
    if (key.ctrl && character === 'b') return openPicker('from', true);
    if (key.ctrl && character === 'd' && journey) return setShowDetails((value) => !value);
    if (!key.ctrl && !key.meta && character) {
      setInput((value) => value + character);
      setError('');
    }
  });

  const config = `${formatMode(from)}  →  ${formatMode(to)}`;
  const compactRail = (stdout.columns ?? 100) < 80;
  return React.createElement(Box, { flexDirection: 'column', paddingX: 1 },
    React.createElement(Text, { color: palette.blue, bold: true }, 'BASE CONVERTER · เส้นทางการแปลงค่า'),
    React.createElement(Text, { color: palette.gray }, `การตั้งค่าปัจจุบัน: ${config}`),
    picker
      ? React.createElement(BasePicker, { kind: picker, current: picker === 'from' ? from : to, other: picker === 'from' ? to : from, cursor: pickerIndex })
      : React.createElement(React.Fragment, null,
        journey && React.createElement(Box, { flexDirection: 'column', marginTop: 1 },
          React.createElement(Text, null, rail(journey.stages, stageIndex, compactRail)),
          React.createElement(FocusCard, { journey, selected: stageIndex, details: showDetails }),
          React.createElement(Text, { color: palette.green }, `ผลล่าสุด: ${journey.output}`),
        ),
        error && React.createElement(Text, { color: palette.red }, error),
        React.createElement(Box, { marginTop: 1 },
          React.createElement(Text, { color: palette.gold, bold: true }, 'กรอกค่า  '),
          React.createElement(Text, null, `${input || ' '}▌`),
        ),
        React.createElement(Text, { color: palette.gray }, 'Enter แปลง · Ctrl+S สลับ · Ctrl+T ปลายทาง · Ctrl+B เลือกฐาน · ←/→ Journey · Ctrl+D รายละเอียด · Esc กลับ · Ctrl+Q ออก'),
      ),
  );
}
