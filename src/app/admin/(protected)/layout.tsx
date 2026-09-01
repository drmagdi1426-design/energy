import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/session';
import { getAdminLocale } from '@/lib/admin-locale';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getCsrfToken } from '@/lib/csrf';
import { AdminShell } from '@/components/AdminShell';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  if (!session) redirect('/admin/login');

  const locale = await getAdminLocale();
  const dict = getDictionary(locale);
  const csrfToken = await getCsrfToken();

  return (
    <AdminShell locale={locale} dict={dict} csrfToken={csrfToken} username={session.username}>
      {children}
    </AdminShell>
  );
}
