import { redirect } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getAdminLocale } from '@/lib/admin-locale';
import { getCsrfToken } from '@/lib/csrf';
import { requireAdminSession } from '@/lib/session';
import { AdminLoginForm } from '@/components/AdminLoginForm';
import { AdminLocaleToggle } from '@/components/AdminLocaleToggle';

export default async function AdminLoginPage() {
  const alreadyIn = await requireAdminSession();
  if (alreadyIn) redirect('/admin/dashboard');

  const locale = await getAdminLocale();
  const dict = getDictionary(locale);
  const csrfToken = await getCsrfToken();

  return (
    <div className="min-h-screen bg-page-gray">
      <div className="mx-auto max-w-sm px-4 pt-8 text-end">
        <AdminLocaleToggle locale={locale} label={dict.common.languageToggle} />
      </div>
      <AdminLoginForm dict={dict} csrfToken={csrfToken} />
    </div>
  );
}
