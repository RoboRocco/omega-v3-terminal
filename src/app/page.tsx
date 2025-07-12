'use client';

import { useEffect, useRef, useState } from 'react';

const VERSION = 'Omega V3 CLI UX v1.3';
const RELEASE = 'July 11, 2025';
const USERNAME = 'omega';
const PASSWORD = 'v3secure';

export default function Home() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [auth, setAuth] = useState(false);
  const [loginStep, setLoginStep] = useState<'user' | 'pass'>('user');
  const [tempUser, setTempUser] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [statusJson, setStatusJson] = useState<any>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const intro = [
    '╔════════════════════════════════════════════════════════════════╗',
    '║    🔒 OMEGA V3 CLI UX v1.3 — Hermida Enterprise Solutions     ║',
    '║         Powered by myhtusa.com | Terminal Access Only         ║',
    '╚════════════════════════════════════════════════════════════════╝',
    '',
    'System booting...',
  ];

  useEffect(() => {
    typeLines(intro, () => {
      setLog(prev => [...prev, 'Enter username:']);
    });
  }, []);

  const typeLines = (lines: string[], callback: () => void) => {
    let i = 0;
    setIsTyping(true);
    const interval = setInterval(() => {
      setLog(prev => [...prev, lines[i]]);
      i++;
      if (i >= lines.length) {
        clearInterval(interval);
        setIsTyping(false);
        callback();
      }
    }, 50);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('https://88ykyzk8g5xs.statuspage.io/api/v2/components.json');
      const json = await res.json();
      setStatusJson(json);
      const warnings = json.components.filter((c: any) =>
        ['degraded_performance', 'major_outage'].includes(c.status)
      );
      if (warnings.length > 0) {
        const warns = warnings.map((c: any) => `🚨 ${c.name}: ${c.status.toUpperCase()}`);
        setLog(prev => [...prev, '', '⚠️ SYSTEM WARNINGS DETECTED:', ...warns]);
      } else {
        setLog(prev => [...prev, '', '✅ All systems operational.']);
      }
    } catch {
      setLog(prev => [...prev, '⚠️ Unable to fetch live system status.']);
    }
  };

  const handleCommand = () => {
    if (!auth) {
      if (loginStep === 'user') {
        setTempUser(input);
        setLog(prev => [...prev, `> ${input}`, 'Enter password:']);
        setLoginStep('pass');
        setInput('');
      } else {
        setLog(prev => [...prev, '> ********']);
        if (tempUser === USERNAME && input === PASSWORD) {
          setAuth(true);
          setCommandHistory([]);
          fetchStatus();
          setLog(prev => [...prev, '', '✅ Access granted.', 'Type `help` to get started.']);
        } else {
          setLog(prev => [...prev, '❌ Invalid login.', '', 'Enter username:']);
          setLoginStep('user');
        }
        setInput('');
        return;
      }
      return;
    }

    const cmd = input.trim().toLowerCase();
    setCommandHistory(prev => [...prev, cmd]);
    const update = [`> ${cmd}`];

    switch (cmd) {
      case 'help':
        setLog(prev => [
          ...prev,
          ...update,
          '',
          'Available commands:',
          'help     — List all commands',
          'status   — Live system status',
          'version  — Current CLI build info',
          'credits  — About Hermida Enterprise',
          'clear    — Clear screen',
          'history  — Show past commands',
          'logout   — End session',
          'eject    — Reset session + wipe',
        ]);
        break;
      case 'status':
        if (statusJson?.components) {
          const statuses = statusJson.components.map(
            (c: any) => `🔧 ${c.name}: ${c.status.toUpperCase()}`
          );
          setLog(prev => [...prev, ...update, '', ...statuses]);
        } else {
          setLog(prev => [...prev, ...update, '⚠️ Status unavailable.']);
        }
        break;
      case 'version':
        setLog(prev => [...prev, ...update, `${VERSION} — Released ${RELEASE}`]);
        break;
      case 'credits':
        setLog(prev => [
          ...prev,
          ...update,
          '',
          'Hermida Enterprise Solutions — Innovating HTUSA+, Fintra+, Omega V3, MyShare, ZeroBreak.',
          'Official site: myhtusa.com',
        ]);
        break;
      case 'clear':
        setLog([]);
        break;
      case 'history':
        setLog(prev => [...prev, ...update, ...commandHistory]);
        break;
      case 'logout':
        setAuth(false);
        setLoginStep('user');
        setTempUser('');
        setLog([...intro, '', 'Enter username:']);
        break;
      case 'eject':
        window.localStorage.clear();
        setAuth(false);
        setLoginStep('user');
        setTempUser('');
        setLog(['🧨 Session ejected. Reloading...']);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        break;
      default:
        setLog(prev => [...prev, ...update, `❌ Unknown command: ${cmd}`]);
    }

    setInput('');
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  };

  return (
    <main className="bg-black text-[#00fff7] h-screen w-screen flex flex-col items-center justify-center p-4 font-mono text-sm">
      <div
        ref={terminalRef}
        className="w-full max-w-4xl h-[70vh] overflow-y-auto border border-[#00fff7] p-4 bg-black rounded-md shadow-xl scroll-smooth"
      >
        {log.map((line, i) => (
          <div key={i} className="whitespace-pre">{line}</div>
        ))}
      </div>

      <input
        disabled={isTyping}
        className="w-full max-w-4xl mt-4 p-2 text-[#00fff7] bg-black border-b border-[#00fff7] focus:outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCommand();
        }}
        placeholder={isTyping ? '' : '> Enter command'}
      />
    </main>
  );
}
