'use client';

import Link from 'next/link';
import { useState } from 'react';
import { KidTopBar } from '@/components/KidTopBar';
import { KidButton } from '@/components/KidButton';

export default function ParentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="safe-screen">
      <KidTopBar title="家長" backHref="/" />
      <main className="kid-shell">
        <section className="kid-card">
          <h1 className="kid-card-title">家長後台</h1>
          <p className="kid-card-subtitle">
            管理練習內容、卡包與每日任務。
          </p>

          <div className="kid-stack">
            <label className="kid-field">
              <span className="kid-field-label">Email</span>
              <input
                className="kid-input"
                placeholder="parent@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="kid-field">
              <span className="kid-field-label">密碼</span>
              <input
                className="kid-input"
                placeholder="輸入密碼"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>

          <div className="kid-stack" style={{ marginTop: 18 }}>
            <KidButton href="/parent/dashboard">進入後台</KidButton>
            <p className="kid-sidenote">第一版為前端原型，尚未啟用真實登入。</p>
          </div>
        </section>
      </main>
    </div>
  );
}
