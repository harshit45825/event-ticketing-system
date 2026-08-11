import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const words = ['Concerts', 'Sports', 'Comedy Shows', 'Conferences', 'Festivals'];

const Landing = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [bgTheme, setBgTheme] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const rippleId = useRef(0);

  const themes = [
    {
      name: '🌌 Galaxy',
      bg: 'linear-gradient(135deg, #0f0c29, #1a1535, #0f0c29)',
      accent: '#8b5cf6',
      glow1: 'rgba(139,92,246,0.15)',
      glow2: 'rgba(99,102,241,0.15)',
    },
    {
      name: '🌊 Ocean',
      bg: 'linear-gradient(135deg, #0c1445, #0a2a4a, #051923)',
      accent: '#06b6d4',
      glow1: 'rgba(6,182,212,0.15)',
      glow2: 'rgba(14,165,233,0.15)',
    },
    {
      name: '🌹 Rose',
      bg: 'linear-gradient(135deg, #1a0a1a, #2d0a2d, #1a0a1a)',
      accent: '#ec4899',
      glow1: 'rgba(236,72,153,0.15)',
      glow2: 'rgba(168,85,247,0.15)',
    },
    {
      name: '🌿 Forest',
      bg: 'linear-gradient(135deg, #0a1a0a, #0d2a1a, #0a1a0a)',
      accent: '#10b981',
      glow1: 'rgba(16,185,129,0.15)',
      glow2: 'rgba(5,150,105,0.15)',
    },
    {
      name: '🔥 Ember',
      bg: 'linear-gradient(135deg, #1a0a00, #2d1200, #1a0800)',
      accent: '#f97316',
      glow1: 'rgba(249,115,22,0.15)',
      glow2: 'rgba(239,68,68,0.15)',
    },
  ];

  const theme = themes[bgTheme];

  // Typewriter
  useEffect(() => {
    const current = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 100);
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1500);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 50);
    } else {
      setDeleting(false);
      setWordIndex(p => (p + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  // Mouse tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Click ripple
  const handleClick = (e: React.MouseEvent) => {
    const id = rippleId.current++;
    setRipples(prev => [...prev, { x: e.clientX, y: e.clientY, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1000);
  };

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleColors = [theme.accent, '#ffffff', '#a78bfa', '#c084fc'];

    const particles: {
      x: number; y: number;
      vx: number; vy: number;
      radius: number; alpha: number;
      color: string; pulse: number;
      pulseSpeed: number;
    }[] = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      });
    }

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        // Speed limit
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) {
          p.vx = (p.vx / speed) * 2;
          p.vy = (p.vy / speed) * 2;
        }

        // Friction
        p.vx *= 0.99;
        p.vy *= 0.99;

        p.pulse += p.pulseSpeed;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ddx = p.x - q.x;
          const ddy = p.y - q.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,92,246,${0.2 * (1 - d / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // Draw particle with pulse
        const pulseRadius = p.radius + Math.sin(p.pulse) * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha + Math.sin(p.pulse) * 0.1;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Mouse glow
      const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, 150);
      gradient.addColorStop(0, `${theme.accent}20`);
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(mx, my, 150, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [bgTheme]);

  // AI chat
  const askAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiMessage('');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are TicketApp AI assistant. Answer in 2-3 sentences, friendly and helpful: ${aiInput}`
          }]
        })
      });
      const data = await response.json();
      setAiMessage(data.content[0].text);
    } catch {
      setAiMessage('Sorry, could not connect right now. Please try again!');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden cursor-default"
      style={{ background: theme.bg }}
      onClick={handleClick}
    >
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 z-0 pointer-events-none"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Mouse Spotlight */}
      <div
        className="fixed pointer-events-none z-0 rounded-full"
        style={{
          width: 400,
          height: 400,
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          background: `radial-gradient(circle, ${theme.accent}08 0%, transparent 70%)`,
          transition: 'left 0.1s, top 0.1s',
        }}
      />

      {/* Click Ripples */}
      {ripples.map(r => (
        <div
          key={r.id}
          className="fixed pointer-events-none z-50 rounded-full border-2 animate-ping"
          style={{
            left: r.x - 25,
            top: r.y - 25,
            width: 50,
            height: 50,
            borderColor: theme.accent,
            opacity: 0.6,
          }}
        />
      ))}

      {/* Glow Blobs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none z-0"
        style={{ background: theme.glow1 }} />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none z-0"
        style={{ background: theme.glow2 }} />

      {/* Theme Switcher */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {themes.map((t, i) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); setBgTheme(i); }}
            className="w-8 h-8 rounded-full border-2 transition-all hover:scale-125 text-xs flex items-center justify-center"
            style={{
              background: t.accent,
              borderColor: bgTheme === i ? 'white' : 'transparent',
              boxShadow: bgTheme === i ? `0 0 10px ${t.accent}` : 'none',
            }}
            title={t.name}
          >
          </button>
        ))}
        <div className="text-center mt-1">
          <p className="text-xs text-gray-500 writing-mode-vertical"
            style={{ writingMode: 'vertical-rl', fontSize: '9px', color: '#6b7280' }}>
            theme
          </p>
        </div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex justify-between items-center px-6 sm:px-12 py-5 border-b border-white border-opacity-10 backdrop-blur-sm">
        <div className="text-2xl font-bold text-white">
          🎟 <span style={{ color: theme.accent }}>Ticket</span>App
        </div>
        <div className="flex gap-3">
          <button
            onClick={e => { e.stopPropagation(); navigate('/login'); }}
            className="text-sm text-white border border-white border-opacity-30 px-4 py-2 rounded-full hover:bg-white hover:bg-opacity-10 transition"
          >
            Login
          </button>
          <button
            onClick={e => { e.stopPropagation(); navigate('/register'); }}
            className="text-sm text-white px-4 py-2 rounded-full hover:opacity-90 transition font-semibold"
            style={{ background: theme.accent }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16 pb-16 sm:pt-28 sm:pb-20">

        {/* Badge */}
        <div
          className="mb-6 inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full border"
          style={{
            background: `${theme.accent}20`,
            borderColor: `${theme.accent}60`,
            color: theme.accent
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse inline-block"
            style={{ background: theme.accent }} />
          AI-Powered Ticketing Platform
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
          Book Tickets for
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(135deg, ${theme.accent}, #c084fc)`
            }}
          >
            {displayed}
            <span className="animate-pulse">|</span>
          </span>
        </h1>

        <p className="text-gray-400 text-base sm:text-xl max-w-xl mb-10 leading-relaxed">
          Lightning-fast seat booking with AI insights, dynamic pricing,
          and zero double-bookings — guaranteed.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button
            onClick={e => { e.stopPropagation(); navigate('/register'); }}
            className="px-8 py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, #6366f1)` }}
          >
            🚀 Start Booking Free
          </button>
          <button
            onClick={e => { e.stopPropagation(); navigate('/login'); }}
            className="px-8 py-4 rounded-2xl text-white font-semibold text-base border border-white border-opacity-20 hover:bg-white hover:bg-opacity-10 transition-all"
          >
            👤 Login to Account
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 sm:gap-16 mb-8">
          {[
            { value: '10K+', label: 'Tickets Booked' },
            { value: '99.9%', label: 'Uptime' },
            { value: '0', label: 'Double Bookings' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl sm:text-4xl font-black"
                style={{ color: theme.accent }}>{stat.value}</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scrolling Marquee */}
      <div className="relative z-10 overflow-hidden py-4 border-y border-white border-opacity-10 mb-16"
        style={{ background: `${theme.accent}10` }}>
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {['🎤 Live Concerts', '⚽ Sports Events', '🎭 Comedy Shows',
            '🎪 Festivals', '🏆 Championships', '🎬 Movie Premieres',
            '🎤 Live Concerts', '⚽ Sports Events', '🎭 Comedy Shows',
            '🎪 Festivals', '🏆 Championships', '🎬 Movie Premieres'].map((item, i) => (
            <span key={i} className="text-sm font-semibold"
              style={{ color: theme.accent }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          Why Choose TicketApp?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: '🔒', title: 'Race-Condition Free', desc: 'PostgreSQL row-level locking ensures no two users ever book the same seat.' },
            { icon: '💸', title: 'Dynamic Pricing', desc: 'Prices adjust automatically based on seat availability in real-time.' },
            { icon: '📱', title: 'QR Tickets', desc: 'Instant QR code generation on booking confirmation for easy entry.' },
            { icon: '🤖', title: 'AI Insights', desc: 'Claude AI analyzes your booking patterns and gives personalized advice.' },
            { icon: '💰', title: 'Smart Refunds', desc: 'Tiered cancellation refunds based on time remaining before the event.' },
            { icon: '⚡', title: 'Lightning Fast', desc: 'Built with Node.js, Express, and optimized PostgreSQL queries.' },
          ].map((f, i) => (
            <div
              key={i}
              className="group bg-white bg-opacity-5 backdrop-blur-md border border-white border-opacity-10 rounded-2xl p-5 transition-all hover:scale-105"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${theme.accent}80`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${theme.accent}20`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assistant */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pb-24">
        <div
          className="backdrop-blur-md rounded-3xl p-6 sm:p-8 border"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: `${theme.accent}50`,
            boxShadow: `0 0 40px ${theme.accent}10`,
          }}
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🤖</div>
            <h3 className="text-white font-bold text-xl">Ask AI Anything</h3>
            <p className="text-gray-400 text-sm mt-1">Powered by Claude AI</p>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-500 px-4 py-3 rounded-xl text-sm focus:outline-none"
              placeholder="e.g. How does seat locking work?"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.key === 'Enter' && askAI()}
              style={{ focusRing: theme.accent } as any}
            />
            <button
              onClick={e => { e.stopPropagation(); askAI(); }}
              disabled={aiLoading}
              className="text-white px-4 py-3 rounded-xl transition disabled:opacity-50 text-sm font-bold"
              style={{ background: theme.accent }}
            >
              {aiLoading ? '⟳' : '→'}
            </button>
          </div>

          {/* Quick questions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['How does booking work?', 'What is dynamic pricing?', 'Can I cancel my ticket?'].map((q, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setAiInput(q); }}
                className="text-xs px-3 py-1 rounded-full border transition hover:opacity-80"
                style={{ color: theme.accent, borderColor: `${theme.accent}50` }}
              >
                {q}
              </button>
            ))}
          </div>

          {aiLoading && (
            <div className="animate-pulse flex flex-col gap-2 mt-4">
              <div className="h-3 rounded w-full" style={{ background: `${theme.accent}30` }}></div>
              <div className="h-3 rounded w-4/5" style={{ background: `${theme.accent}30` }}></div>
              <div className="h-3 rounded w-3/5" style={{ background: `${theme.accent}30` }}></div>
            </div>
          )}

          {aiMessage && (
            <div className="mt-4 rounded-xl p-4 border"
              style={{
                background: `${theme.accent}10`,
                borderColor: `${theme.accent}30`
              }}>
              <p className="text-xs font-semibold mb-2" style={{ color: theme.accent }}>
                🤖 Claude AI
              </p>
              <p className="text-gray-200 text-sm leading-relaxed">{aiMessage}</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white border-opacity-10 py-6 text-center">
        <p className="text-gray-500 text-sm">
          🎟 TicketApp — Built with Node.js, PostgreSQL, React & Claude AI
        </p>
        <p className="text-xs mt-1" style={{ color: theme.accent }}>
          {theme.name} theme active • Click anywhere for ripple effect
        </p>
      </footer>
    </div>
  );
};

export default Landing;