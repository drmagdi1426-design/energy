'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function AdminLoginForm({ dict, csrfToken }: { dict: Dictionary; csrfToken: string }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, csrfToken }),
      });
      if (res.status === 429) {
        setError(dict.admin.lockedOut);
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        setError(dict.admin.invalidCredentials);
        setSubmitting(false);
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError(dict.errors.generic);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="brand-card mx-auto mt-16 max-w-sm">
      <h1 className="text-xl font-bold text-navy">{dict.admin.loginTitle}</h1>

      <div className="mt-5">
        <label htmlFor="username" className="field-label text-sm">
          {dict.admin.usernameLabel}
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-mid/40 px-3 py-2"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="password" className="field-label text-sm">
          {dict.admin.passwordLabel}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-mid/40 px-3 py-2"
        />
      </div>

      {error && (
        <p className="field-error mt-3" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary mt-5 w-full disabled:opacity-50" disabled={submitting}>
        {submitting ? dict.common.submitting : dict.admin.loginButton}
      </button>
    </form>
  );
}
