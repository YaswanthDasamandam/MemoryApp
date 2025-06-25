import { useState, useEffect } from 'react'
import './App.css'
import React from 'react'
import { normalizeWord } from './utils/normalizeWord.mjs'
import { MAJOR_SYSTEM, getMajorSystemDigits, getMajorSystemMappingDetails } from './utils/majorSystem.mjs'

const STAGES = [
  { id: 1, name: 'Stage 1: Single Digit ↔ Sound' },
  { id: 2, name: 'Stage 2: Two Digits ↔ Word' },
];

function App() {
  const [screen, setScreen] = useState('home');
  const [stage, setStage] = useState(null);
  const [stage2Screen, setStage2Screen] = useState('grid'); // 'grid' or 'edit'
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const notificationTimeout = React.useRef();

  // Track stats in localStorage
  function getStats() {
    return JSON.parse(localStorage.getItem('memoryStats') || '{}');
  }
  function setStats(stats) {
    localStorage.setItem('memoryStats', JSON.stringify(stats));
  }

  // Stage 2 words in localStorage
  function getWords() {
    const raw = JSON.parse(localStorage.getItem('stage2Words') || '{}');
    // Normalize all words to capitalized form
    const normalized = {};
    for (const num in raw) {
      if (Array.isArray(raw[num])) {
        normalized[num] = Array.from(new Set(raw[num].map(w => normalizeWord(w.trim()))));
      }
    }
    return normalized;
  }
  function setWords(words) {
    // Normalize before saving
    const normalized = {};
    for (const num in words) {
      if (Array.isArray(words[num])) {
        normalized[num] = Array.from(new Set(words[num].map(w => normalizeWord(w.trim()))));
      }
    }
    localStorage.setItem('stage2Words', JSON.stringify(normalized));
  }

  function handleStageSelect(stageId) {
    setStage(stageId);
    if (stageId === 2) {
      setScreen('stage2words');
      setStage2Screen('grid');
      setSelectedNumber(null);
    } else {
      setScreen('practice');
    }
  }

  function handleBack() {
    setScreen('home');
    setStage(null);
  }

  React.useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') {
        // Only go back if not on home
        if (screen === 'practice' || screen === 'progress') {
          handleBack();
        } else if (screen === 'stage2words') {
          // For Stage2WordsPage, let it handle Esc itself
          if (stage2Screen === 'grid') {
            handleBack();
          }
          // If in 'edit', Stage2WordsPage will handle
        }
      }
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [screen, stage2Screen]);

  function showNotification(message, type = 'success') {
    setNotification({ message, type });
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => {
      setNotification({ message: '', type });
    }, 2200);
  }

  React.useEffect(() => {
    return () => {
      if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    };
  }, []);

  return (
    <div className="app-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: notification.type })}
      />
      {screen === 'home' && (
        <>
          <h1>Memory Practice App</h1>
          <h2>Select Practice Stage</h2>
          <ul>
            {STAGES.map((s) => (
              <li key={s.id}>
                <button onClick={() => handleStageSelect(s.id)}>{s.name}</button>
              </li>
            ))}
          </ul>
          <button onClick={() => setScreen('progress')}>View Progress</button>
        </>
      )}
      {screen === 'practice' && (
        <PracticeStage stage={stage} onBack={handleBack} getStats={getStats} setStats={setStats} />
      )}
      {screen === 'progress' && (
        <ProgressPage onBack={handleBack} getStats={getStats} />
      )}
      {screen === 'stage2words' && (
        <Stage2WordsPage
          onBack={handleBack}
          getWords={getWords}
          setWords={setWords}
          stage2Screen={stage2Screen}
          setStage2Screen={setStage2Screen}
          selectedNumber={selectedNumber}
          setSelectedNumber={setSelectedNumber}
          onPractice={() => setScreen('stage2practice')}
          showNotification={showNotification}
        />
      )}
      {screen === 'stage2practice' && (
        <Stage2Practice
          onBack={() => setScreen('stage2words')}
          getWords={getWords}
          setWords={setWords}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}

function PracticeStage({ stage, onBack, getStats, setStats }) {
  if (stage === 1) {
    return <Stage1Practice onBack={onBack} getStats={getStats} setStats={setStats} />;
  }
  // Stage 2 placeholder
  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h2>Practice: Two Digits ↔ Word</h2>
      <p>Coming soon!</p>
    </div>
  );
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Shared card style for practice/edit screens
const cardStyle = {
  maxWidth: 500,
  margin: '32px auto',
  width: '100%',
  background: '#23272f',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

function Stage1Practice({ onBack, getStats, setStats }) {
  const [mode, setMode] = useState('mixed'); // or 'sound-to-digit' or 'digit-to-sound'
  const [question, setQuestion] = useState(generateQuestion('mixed'));
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = React.useRef(null);
  const [currentMode, setCurrentMode] = useState('digit-to-sound'); // for mixed mode

  function getRandomMode() {
    return Math.random() < 0.5 ? 'digit-to-sound' : 'sound-to-digit';
  }

  function generateQuestion(mode) {
    let actualMode = mode;
    if (mode === 'mixed') {
      actualMode = getRandomMode();
    }
    if (actualMode === 'digit-to-sound') {
      const idx = getRandomInt(10);
      return { type: 'digit-to-sound', digit: MAJOR_SYSTEM[idx].digit, sounds: MAJOR_SYSTEM[idx].sounds };
    } else {
      const idx = getRandomInt(10);
      const sound = MAJOR_SYSTEM[idx].sounds[getRandomInt(MAJOR_SYSTEM[idx].sounds.length)];
      return { type: 'sound-to-digit', digit: MAJOR_SYSTEM[idx].digit, sound };
    }
  }

  function handleModeChange(newMode) {
    setMode(newMode);
    const q = generateQuestion(newMode);
    setQuestion(q);
    setCurrentMode(q.type || newMode);
    setUserAnswer('');
    setFeedback('');
    if (inputRef.current) inputRef.current.focus();
  }

  function validateAnswer(answer) {
    let isCorrect = false;
    let correctDisplay = '';
    let qMode = mode === 'mixed' ? currentMode : mode;
    let stats = getStats();
    if (qMode === 'digit-to-sound') {
      isCorrect = question.sounds.some(
        s => s[0].toLowerCase() === answer.trim().toLowerCase()
      );
      correctDisplay = `Correct answers: ${question.sounds.map(s => s[0].toUpperCase() + s.slice(1)).join(', ')}`;
      // Track per-digit
      const key = `digit_${question.digit}`;
      stats[key] = stats[key] || { attempts: 0, correct: 0 };
      stats[key].attempts++;
      if (isCorrect) stats[key].correct++;
    } else {
      isCorrect = String(question.digit) === answer.trim();
      correctDisplay = `Correct answer: ${question.digit}`;
      // Track per-sound
      const key = `sound_${question.sound.toUpperCase()}`;
      stats[key] = stats[key] || { attempts: 0, correct: 0 };
      stats[key].attempts++;
      if (isCorrect) stats[key].correct++;
    }
    setStats(stats);
    setFeedback((isCorrect ? '✅ Correct! ' : '❌ Incorrect. ') + correctDisplay);
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setTimeout(() => {
      const q = generateQuestion(mode);
      setQuestion(q);
      setCurrentMode(q.type || mode);
      setUserAnswer('');
      setFeedback('');
      if (inputRef.current) inputRef.current.focus();
    }, 1200);
  }

  function handleInputChange(v) {
    setUserAnswer(v);
    setFeedback('');
  }

  function handleSubmit() {
    if (!userAnswer.trim()) return;
    validateAnswer(userAnswer);
  }

  return (
    <div style={cardStyle}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>← Back</button>
      <h2 style={{ color: '#f3f3f3', marginBottom: 12 }}>Stage 1: Single Digit ↔ Sound</h2>
      <div style={{ marginBottom: 16 }}>
        <div className="button-group">
          <button onClick={() => handleModeChange('digit-to-sound')} disabled={mode === 'digit-to-sound'}>
            Digit → Sound
          </button>
          <button onClick={() => handleModeChange('sound-to-digit')} disabled={mode === 'sound-to-digit'}>
            Sound → Digit
          </button>
          <button onClick={() => handleModeChange('mixed')} disabled={mode === 'mixed'}>
            Mixed
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 16, fontSize: 18 }}>
        <b>Score:</b> {score.correct} / {score.total}
      </div>
      <div style={{ fontSize: 22, marginBottom: 10 }}>
        {mode === 'digit-to-sound' || (mode === 'mixed' && currentMode === 'digit-to-sound') ? (
          <>
            Digit: <b>{question.digit}</b>
          </>
        ) : (
          <>
            Sound: <b>{question.sound}</b>
          </>
        )}
      </div>
      <WordInputBox
        inputValue={userAnswer}
        setInputValue={handleInputChange}
        onSubmit={handleSubmit}
        inputRef={inputRef}
        placeholder={mode === 'digit-to-sound' || (mode === 'mixed' && currentMode === 'digit-to-sound') ? 'Enter first letter (e.g. S, Z)' : 'Enter digit (0-9)'}
        asForm={true}
      />
      {feedback && <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#fff' }}>{feedback}</div>}
    </div>
  );
}

function ProgressPage({ onBack, getStats }) {
  const stats = getStats();
  // Gather digit stats
  const digitStats = [];
  for (let d = 0; d <= 9; d++) {
    const key = `digit_${d}`;
    const s = stats[key] || { attempts: 0, correct: 0 };
    digitStats.push({ digit: d, ...s });
  }
  // Gather sound stats
  const soundKeys = Object.keys(stats).filter(k => k.startsWith('sound_'));
  const soundStats = soundKeys.map(k => ({ sound: k.replace('sound_', ''), ...stats[k] }));

  // Sort by lowest accuracy, only show those with at least 3 attempts
  const weakestDigits = digitStats
    .filter(s => s.attempts >= 3)
    .map(s => ({ ...s, accuracy: s.attempts > 0 ? s.correct / s.attempts : 1 }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);
  const weakestSounds = soundStats
    .filter(s => s.attempts >= 3)
    .map(s => ({ ...s, accuracy: s.attempts > 0 ? s.correct / s.attempts : 1 }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  function handleRestart() {
    localStorage.removeItem('memoryStats');
    window.location.reload();
  }

  function handleDownload() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "memoryStats.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h2>Your Weakest Areas</h2>
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleRestart} style={{ marginRight: 8 }}>Restart Progress</button>
        <button onClick={handleDownload}>Download Data</button>
      </div>
      {weakestDigits.length === 0 && weakestSounds.length === 0 && (
        <p>Practice more to see your weak areas!</p>
      )}
      {weakestDigits.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <b>Digits:</b>
          <ul>
            {weakestDigits.map(({ digit, correct, attempts, accuracy }) => (
              <li key={digit}>
                {digit} (Digit): {(accuracy * 100).toFixed(0)}% correct ({correct}/{attempts})
              </li>
            ))}
          </ul>
        </div>
      )}
      {weakestSounds.length > 0 && (
        <div>
          <b>Sounds:</b>
          <ul>
            {weakestSounds.map(({ sound, correct, attempts, accuracy }) => (
              <li key={sound}>
                {sound} (Sound): {(accuracy * 100).toFixed(0)}% correct ({correct}/{attempts})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Reusable input box for adding/checking words
function WordInputBox({ inputValue, setInputValue, onSubmit, inputRef, placeholder, buttonLabel, error, style, disabled, asForm }) {
  const inputElement = (
    <input
      type="text"
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      placeholder={placeholder}
      style={{
        marginRight: 8,
        flex: '1 1 300px',
        minWidth: 200,
        fontSize: 20,
        background: '#181b20',
        color: '#f3f3f3',
        border: '1.5px solid #353a45',
        borderRadius: 8,
        padding: '14px 16px',
        ...((style && style.input) || {})
      }}
      ref={inputRef}
      autoFocus
      disabled={disabled}
    />
  );
  if (asForm) {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubmit();
        }}
        style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, ...style }}
      >
        {inputElement}
        {error && <div style={{ color: 'red', marginTop: 8, width: '100%' }}>{error}</div>}
      </form>
    );
  }
  return (
    <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, ...style }}>
      {inputElement}
      <button
        style={{
          background: '#353a45',
          color: '#f3f3f3',
          border: 'none',
          borderRadius: 8,
          padding: '14px 24px',
          fontSize: 18,
          ...((style && style.button) || {})
        }}
        onClick={onSubmit}
        disabled={disabled}
      >
        {buttonLabel}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8, width: '100%' }}>{error}</div>}
    </div>
  );
}

function Notification({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 32,
        right: 32,
        zIndex: 1000,
        minWidth: 220,
        maxWidth: 340,
        padding: '16px 28px',
        background: type === 'success' ? '#2ecc40' : '#ff4136',
        color: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        fontSize: 18,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        transition: 'opacity 0.3s',
      }}
      role="alert"
      onClick={onClose}
    >
      {message}
      <span style={{ marginLeft: 16, cursor: 'pointer', fontWeight: 700 }}>&times;</span>
    </div>
  );
}

// Helper: check if subsequence
function isSubsequence(sub, str) {
  let i = 0, j = 0;
  while (i < sub.length && j < str.length) {
    if (sub[i] === str[j]) i++;
    j++;
  }
  return i === sub.length;
}

// Utility: detect if mobile (window width <= 600px)
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 600);
  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 600);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

// Inline Major System mapping visualization
function MajorSystemMappingInline({ word }) {
  if (!word) return null;
  const details = getMajorSystemMappingDetails(word);
  return (
    <div style={{
      marginTop: 10,
      background: '#23272f',
      borderRadius: 12,
      padding: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      maxWidth: 320
    }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
        {details.map((d, i) => (
          <div key={i} style={{
            padding: '3px 6px', borderRadius: 6, background: d.mapped ? '#2ecc40' : (d.ignored ? '#888' : '#ff4136'), color: '#fff', minWidth: 18, textAlign: 'center', fontWeight: 600
          }}>
            <div style={{ fontSize: 13 }}>{d.letter}</div>
            <div style={{ fontSize: 10 }}>
              {d.mapped ? `→ ${d.digit}` : (d.ignored ? 'Ignored' : '—')}
            </div>
          </div>
        ))}
      </div>
      <div style={{ color: '#fff', fontSize: 12 }}>
        <b>Result:</b> {details.filter(d => d.mapped).map(d => d.digit).join('') || '(none)'}
      </div>
    </div>
  );
}

function Stage2WordsPage({ onBack, getWords, setWords, stage2Screen, setStage2Screen, selectedNumber, setSelectedNumber, onPractice, showNotification }) {
  const isMobile = useIsMobile();
  const [words, updateWords] = useState(getWords());
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = React.useRef(null);
  // For upload
  const fileInputRef = React.useRef(null);
  const [showMapping, setShowMapping] = useState(false);

  React.useEffect(() => {
    updateWords(getWords());
  }, [stage2Screen]);

  // Esc key handling for edit mode
  React.useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape' && stage2Screen === 'edit') {
        // Only go back if input is not focused or is empty
        if (!inputRef.current || document.activeElement !== inputRef.current || !inputValue) {
          setStage2Screen('grid');
          setSelectedNumber(null);
        }
      }
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [stage2Screen, inputValue]);

  function handleNumberClick(num) {
    setSelectedNumber(num);
    setStage2Screen('edit');
    setInputValue('');
    setError('');
  }

  function handleAddWord() {
    setError('');
    if (!inputValue.trim()) return;
    const num = selectedNumber;
    const expected = num;
    const encodings = getMajorSystemDigits(inputValue.trim()).map(e => e.padStart(2, '0'));
    if (!encodings.some(actual => isSubsequence(expected, actual))) {
      showNotification(`Word does not match the Major System for ${num}. Encoded: ${encodings.join(', ')}`, 'error');
      return;
    }
    const newWords = { ...words };
    newWords[num] = newWords[num] || [];
    // Case-insensitive duplicate check
    if (!newWords[num].some(w => w.trim().toLowerCase() === inputValue.trim().toLowerCase())) {
      newWords[num].push(inputValue.trim());
      updateWords(newWords);
      setWords(newWords);
      showNotification('Word added!', 'success');
    } else {
      showNotification('Word already exists for this number.', 'error');
    }
    setInputValue('');
  }

  function handleRemoveWord(word) {
    const num = selectedNumber;
    const newWords = { ...words };
    // Remove all case-insensitive matches
    newWords[num] = newWords[num].filter(w => w.trim().toLowerCase() !== word.trim().toLowerCase());
    updateWords(newWords);
    setWords(newWords);
  }

  function handleEditBack() {
    setStage2Screen('grid');
    setSelectedNumber(null);
    setError('');
  }

  // --- Download/Upload Handlers ---
  function handleDownloadWords() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "stage2Words.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function handleUploadClick() {
    if (fileInputRef.current) fileInputRef.current.value = null; // reset
    fileInputRef.current && fileInputRef.current.click();
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (typeof imported !== 'object' || Array.isArray(imported)) throw new Error('Invalid format');
        // Merge with current words (or replace? Here: merge)
        const merged = { ...words };
        for (const num in imported) {
          if (Array.isArray(imported[num])) {
            // Normalize imported words
            const normWords = imported[num].map(w => normalizeWord(w.trim()));
            merged[num] = Array.from(new Set([...(merged[num] || []).map(w => normalizeWord(w.trim())), ...normWords]));
          }
        }
        updateWords(merged);
        setWords(merged);
        showNotification('Words imported successfully!', 'success');
      } catch (err) {
        showNotification('Failed to import: Invalid file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  // Grid of numbers 0-9 and 00-99
  if (stage2Screen === 'grid') {
    // Create an array of single digits as strings '0'-'9'
    const singleDigits = Array.from({ length: 10 }, (_, i) => i.toString());
    // Create an array of two-digit numbers as strings '00'-'99'
    const twoDigits = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
    // Combine for the grid
    const allNumbers = [...singleDigits, ...twoDigits];
    return (
      <div>
        <button onClick={onBack}>← Back</button>
        {/* Top bar: Practice Mode left, Download/Upload right */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: 8, marginTop: 8, gap: isMobile ? 8 : 0 }}>
          <div>
            <button onClick={onPractice}>Practice Mode</button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row' }}>
            <button onClick={handleDownloadWords}>Download Words</button>
            <button onClick={handleUploadClick}>Upload Words</button>
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>
        <h2>Edit Words for Numbers (0–9, 00–99)</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(60px, 1fr))',
            gap: isMobile ? 4 : 8,
            maxWidth: isMobile ? '100vw' : 1100,
            margin: '0 auto',
            width: '100%',
            background: 'var(--stage2-bg, #23272f)',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            padding: isMobile ? 2 : 8,
          }}
        >
          {allNumbers.map(num => {
            const wordList = words[num] || [];
            let preview = '';
            if (wordList.length > 0) {
              preview = wordList.slice(0, 2).join(', ');
              if (wordList.length > 2) {
                preview += ` +${wordList.length - 2} more`;
              }
            }
            return (
              <button
                key={num}
                style={{
                  padding: 6,
                  minHeight: 36,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  wordBreak: 'break-word',
                  background: '#23272f',
                  color: '#f3f3f3',
                  border: '1px solid #353a45',
                  borderRadius: 8,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                  transition: 'background 0.2s',
                }}
                onClick={() => handleNumberClick(num)}
              >
                <div style={{ fontWeight: 'bold', fontSize: 15 }}>{num}</div>
                <div style={{ fontSize: 10, color: '#b0b6c3', marginTop: 2, minHeight: 12 }}>
                  {preview}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Edit words for a selected number
  if (stage2Screen === 'edit') {
    const num = selectedNumber;
    // List of all numbers as in the grid
    const singleDigits = Array.from({ length: 10 }, (_, i) => i.toString());
    const twoDigits = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
    const allNumbers = [...singleDigits, ...twoDigits];
    const currentIdx = allNumbers.indexOf(num);
    // Handlers for navigation
    function goToPrev() {
      if (currentIdx > 0) {
        setSelectedNumber(allNumbers[currentIdx - 1]);
        setInputValue('');
        setError('');
      }
    }
    function goToNext() {
      if (currentIdx < allNumbers.length - 1) {
        setSelectedNumber(allNumbers[currentIdx + 1]);
        setInputValue('');
        setError('');
      }
    }
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', width: '100%', background: '#23272f', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', padding: isMobile ? 12 : 24 }}>
        <button onClick={handleEditBack}>← Back to Grid</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
          <button onClick={goToPrev} disabled={currentIdx === 0}>&lt; Previous</button>
          <h2 style={{ color: '#f3f3f3', margin: 0 }}>Words for {num}</h2>
          <button onClick={goToNext} disabled={currentIdx === allNumbers.length - 1}>Next &gt;</button>
        </div>
        <WordInputBox
          inputValue={inputValue}
          setInputValue={v => { setInputValue(v); setError(''); setShowMapping(false); }}
          onSubmit={handleAddWord}
          inputRef={inputRef}
          placeholder="Add a word"
          buttonLabel="Add"
          error={error}
          asForm={true}
        />
        <div style={{ position: 'relative', minHeight: 40, marginBottom: 4 }}>
          <div style={{ opacity: showMapping ? 1 : 0.25, pointerEvents: showMapping ? 'auto' : 'none' }}>
            {inputValue && <MajorSystemMappingInline word={inputValue} />}
          </div>
          {!showMapping && inputValue && (
            <div
              onClick={() => setShowMapping(true)}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(30,30,30,0.85)', color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 500, zIndex: 2
              }}
            >
              Click to reveal mapping
            </div>
          )}
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 16,
        }}>
          {(words[num] || []).map(word => (
            <div
              key={word}
              style={{
                background: '#353a45',
                color: '#f3f3f3',
                padding: '8px 14px',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                marginBottom: 6,
                fontSize: 16,
              }}
            >
              {word}
              <button
                onClick={() => handleRemoveWord(word)}
                style={{ marginLeft: 8, fontSize: 13, padding: '2px 8px', borderRadius: 8, background: '#181b20', color: '#f3f3f3', border: 'none' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {(!words[num] || words[num].length === 0) && <div style={{ color: '#888' }}>No words yet for {num}.</div>}
      </div>
    );
  }
  return null;
}

// Stage 2 Practice Mode: Number → Word, with add-new-word option
function Stage2Practice({ onBack, getWords, setWords, showNotification }) {
  const isMobile = useIsMobile();
  const [words, setWordsState] = useState(getWords());
  const [currentNum, setCurrentNum] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = React.useRef(null);
  // Customization: Practice only existing words toggle
  const [practiceExistingOnly, setPracticeExistingOnly] = useState(() => {
    return localStorage.getItem('practiceExistingOnly') === 'true';
  });

  // Restore Escape key handler for back navigation
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') {
        onBack();
      }
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onBack]);

  // Helper to get next number based on practiceExistingOnly
  function getNextPracticeNumber() {
    if (practiceExistingOnly) {
      const numbersWithWords = Object.keys(words).filter(num => (words[num] && words[num].length));
      if (numbersWithWords.length > 0) {
        return numbersWithWords[Math.floor(Math.random() * numbersWithWords.length)];
      } else {
        return getRandomNum(); // fallback
      }
    } else {
      return getRandomNum();
    }
  }

  function handleTogglePracticeMode() {
    setPracticeExistingOnly(v => {
      const newValue = !v;
      localStorage.setItem('practiceExistingOnly', newValue);
      // If turning ON, check if currentNum has words; if not, pick a new one that does
      if (newValue) {
        const wordList = words[currentNum] || [];
        if (!wordList.length) {
          setCurrentNum(getNextPracticeNumber());
          setInputValue('');
          setFeedback('');
          if (inputRef.current) inputRef.current.focus();
        }
      }
      return newValue;
    });
  }

  function handleSkip() {
    setInputValue('');
    setFeedback('');
    setCurrentNum(getNextPracticeNumber());
    if (inputRef.current) inputRef.current.focus();
  }

  function handleSubmit() {
    if (!inputValue.trim()) return;
    const num = currentNum;
    const userWord = inputValue.trim();
    const wordList = words[num] || [];
    const expected = num;
    const encodings = getMajorSystemDigits(userWord).map(e => e.padStart(2, '0'));
    // Case-insensitive match
    if (wordList.some(w => w.trim().toLowerCase() === userWord.toLowerCase())) {
      setFeedback('✅ Correct!');
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      showNotification('Correct!', 'success');
      // Immediately go to next word
      setInputValue('');
      setFeedback('');
      setCurrentNum(getNextPracticeNumber());
      if (inputRef.current) inputRef.current.focus();
      return;
    } else if (!practiceExistingOnly && encodings.some(actual => isSubsequence(expected, actual))) {
      // New valid word: add to list immediately (case-insensitive check)
      const newWords = { ...words };
      newWords[num] = newWords[num] || [];
      if (!newWords[num].some(w => w.trim().toLowerCase() === userWord.toLowerCase())) {
        newWords[num].push(userWord);
        setWordsState(newWords);
        setWords(newWords);
        setFeedback('New word detected and added to your list!');
        setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
        showNotification('New word detected and added to your list!', 'success');
        setTimeout(() => {
          setInputValue('');
          setFeedback('');
          setCurrentNum(getNextPracticeNumber());
          if (inputRef.current) inputRef.current.focus();
        }, 1000);
        return;
      }
    } else if (practiceExistingOnly && encodings.some(actual => isSubsequence(expected, actual))) {
      const existingMsg = wordList.length
        ? `Try an existing word: ${wordList.join(', ')}`
        : 'No words yet for this number.';
      setFeedback(`❌ Not in your list. ${existingMsg}`);
      setScore(s => ({ ...s, total: s.total + 1 }));
      showNotification('Not in your list. Try an existing word.', 'error');
      setTimeout(() => {
        setInputValue('');
        setFeedback('');
        if (inputRef.current) inputRef.current.focus();
      }, 1000);
    } else {
      setFeedback(`❌ Incorrect. Your words: ${wordList.length ? wordList.join(', ') : 'None yet.'}`);
      setScore(s => ({ ...s, total: s.total + 1 }));
      showNotification('Incorrect. Not a valid word for this number.', 'error');
      setTimeout(() => {
        setInputValue('');
        setFeedback('');
        if (inputRef.current) inputRef.current.focus();
      }, 1000);
    }
  }

  // Initialize currentNum on mount only
  useEffect(() => {
    setCurrentNum(getNextPracticeNumber());
    setInputValue('');
    setFeedback('');
    if (inputRef.current) inputRef.current.focus();
  }, []);

  function getRandomNum() {
    // Pick from both single digits '0'-'9' and two-digit numbers '00'-'99'
    const singleDigits = Array.from({ length: 10 }, (_, i) => i.toString());
    const twoDigits = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
    const allNums = [...singleDigits, ...twoDigits];
    return allNums[Math.floor(Math.random() * allNums.length)];
  }

  function handleInputChange(v) {
    setInputValue(v);
    setFeedback('');
  }

  if (!currentNum) return null;

  return (
    <div style={{ ...cardStyle, padding: isMobile ? 12 : 24 }}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>← Back</button>
      <h2 style={{ color: '#f3f3f3', marginBottom: 12 }}>Stage 2 Practice: Number → Word</h2>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <b>Score:</b> {score.correct} / {score.total}
        <label style={{ display: 'flex', alignItems: 'center', marginLeft: 24, fontSize: 16, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={practiceExistingOnly}
            onChange={handleTogglePracticeMode}
            style={{ marginRight: 6 }}
          />
          Strict mode (saved words only)
        </label>
      </div>
      <div style={{ fontSize: 22, marginBottom: 10 }}>
        Number: <b>{currentNum}</b>
      </div>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 8, width: '100%', maxWidth: 500 }}>
        <WordInputBox
          inputValue={inputValue}
          setInputValue={handleInputChange}
          onSubmit={handleSubmit}
          inputRef={inputRef}
          placeholder="Type a word you associate with this number"
          asForm={true}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <button
          onClick={handleSkip}
          style={{
            background: '#888',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '14px 18px',
            fontSize: 18,
            height: 52,
            alignSelf: 'center',
            cursor: 'pointer',
            marginLeft: 0
          }}
        >
          Skip
        </button>
      </div>
      {feedback && <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#fff' }}>{feedback}</div>}
    </div>
  );
}

export default App

