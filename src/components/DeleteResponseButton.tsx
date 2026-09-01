'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function DeleteResponseButton({
  dict,
  csrfToken,
  responseId,
}: {
  dict: Dictionary;
  csrfToken: string;
  responseId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(dict.admin.deleteConfirm)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/responses/${responseId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csrfToken }),
    });
    if (res.ok) {
      router.push('/admin/responses');
      router.refresh();
    } else {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="text-sm font-medium text-[#B3261E] hover:underline disabled:opacity-50"
    >
      {dict.admin.deleteResponse}
    </button>
  );
}
