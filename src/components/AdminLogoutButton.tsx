'use client';

import { useRouter } from 'next/navigation';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function AdminLogoutButton({ dict, csrfToken }: { dict: Dictionary; csrfToken: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csrfToken }),
    });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} className="text-sm font-medium text-gray-mid hover:text-navy">
      {dict.admin.logout}
    </button>
  );
}
