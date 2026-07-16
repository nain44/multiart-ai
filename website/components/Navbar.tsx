'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(5,5,8,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(30,30,46,0.8)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>🖼️</div>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>
            MultiArt<span style={{ color: '#a78bfa' }}> AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/wallpapers" className="nav-link">
            Wallpapers
          </Link>
          <Link href="/categories" className="nav-link">
            Categories
          </Link>
          <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '13px', marginLeft: '8px' }}>
            📱 Get the App
          </a>
        </nav>
      </div>
    </header>
  );
}
