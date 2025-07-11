'use client';

import { useState, useEffect, useRef } from 'react';

interface ComponentStatus {
  name: string;
  status: string;
}

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [statusComponents, setStatusComponents] = useState<ComponentStatus[]>([]);
  const [bootIndex, setBootIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const validPasscode = "omega2025";

  const bootMessages = [
    "Initializing Omega V3 Secure System...",
    "Loading Core Modules ███▒▒▒▒▒",
    "Verifying Integrity...",
    "Establishing Secure Session...",
    "Live status sync established.",
    "Terminal Ready. Enter Access Code:",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (bootIndex < bootMessages.length) {
        setLogs((prev) => [...prev, bootMessages[bootIndex]]);
        setBootIndex((i) => i + 1);
      } else {
        clearInterval(timer);
      }
    }, 800);
    return () => clearInterval(timer);
  }, [bootIndex]);

  useEffect(() => {
    const session = localStorage.getItem('omegaLoggedIn');
    if (session === 'true') {
      setIsLoggedIn(true);
      setLogs((prev) => [...prev, "> Session restored."]);
    }
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('https://88ykyzk8g5xs.statuspage.io/api/v2/components.json');
        const data = await res.json();
        setStatusComponents(data.components || []);
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;
    setLogs(prev => [...prev, `> ${cmd}`]);

    if (!isLoggedIn) {
      if (cmd === validPasscode) {
        setLogs(prev => [...prev, '> ✅ Access granted. Welcome, Commander.']);
        setIsLoggedIn(true);
        localStorage.setItem('omegaLoggedIn', 'true');
      } else {
        setLogs(prev => [...prev, '> ❌ Invalid access code.']);
      }
      setInput('');
      return;
    }

    switch (cmd) {
      case 'help':
        setLogs(prev => [
          ...prev,
          '> Available Commands:',
          '> help - List all commands',
          '> status - Fetch latest system status',
          '> clear - Clear screen',
          '> whoami - Show session info',
          '> logout - End session',
          '> reboot - Restart terminal',
        ]);
        break;
      case 'clear':
        setLogs([]);
        break;
      case 'status':
        const statusOutput = statusComponents.map(
          (c) => `> ${c.name}: ${c.status.toUpperCase()}`
        );
        setLogs(prev => [...prev, '> STATUS REPORT:', ...statusOutput]);
        break;
      case 'whoami':
        setLogs(prev => [...prev, '> User: guest\n> Role: observer\n> Access: Local Authenticated']);
        break;
      case 'logout':
        localStorage.removeItem('omegaLoggedIn');
        setIsLoggedIn(false);
        setLogs(['> Session terminated. Please enter access code.']);
        break;
      case 'reboot':
        setLogs(['> Rebooting system...']);
        setTimeout(() => window.location.reload(), 1200);
        break;
      default:
        setLogs(prev => [...prev, `> ❓ Unknown command: ${cmd}`]);
    }

    setInput('');
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen bg-black text-green-400 font-mono">
      <div className="w-full md:w-2/3 p-4 border-r border-green-900" onClick={() => inputRef.current?.focus()}>
        <div className="border border-green-700 p-2 mb-4 text-center text-green-300 font-bold tracking-widest glow animate-pulse">
          *** OMEGA V3 CLI UX v1.2 — SECURE TERMINAL ACCESS ***
        </div>
        <div className="overflow-y-auto h-[80vh] glow" style={{ whiteSpace: 'pre-wrap' }}>
          {logs.map((log, i) => (
            <div key={i} className="animate-typing">{log}</div>
          ))}
        </div>
        <form onSubmit={handleCommand} className="flex mt-4">
          <span className="mr-2 text-green-500">&gt;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-black text-green-400 outline-none w-full"
            placeholder={isLoggedIn ? '' : 'Enter Access Code'}
            autoFocus
          />
        </form>
      </div>

      <div className="w-full md:w-1/3 p-4 bg-green-900/10 text-green-300 border-l border-green-700">
        <h2 className="text-lg font-bold mb-2 underline">Live System Status</h2>
        {statusComponents.length > 0 ? (
          <ul className="space-y-1">
            {statusComponents.map((c, i) => (
              <li key={i}>
                <strong>{c.name}</strong>: {c.status.toUpperCase()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading status...</p>
        )}
      </div>
    </main>
  );
}
