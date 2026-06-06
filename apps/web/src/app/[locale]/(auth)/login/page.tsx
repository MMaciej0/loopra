import { getTranslations } from 'next-intl/server';
import { Header } from './_components/Header';
import { GoogleLoginButton } from './_components/GoogleLoginButton';
import { LoginForm } from './_components/LoginForm';
import { Footer } from './_components/Footer';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const [t, { redirectTo }] = await Promise.all([getTranslations('LoginPage'), searchParams]);

  return (
    <div className="flex w-full flex-col">
      <Header />
      <GoogleLoginButton />

      <div className="mb-[18px] flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground font-mono text-[11px] tracking-[0.1em]">
          {t('or')}
        </span>
        <span className="bg-border h-px flex-1" />
      </div>

      <LoginForm redirectTo={redirectTo ?? '/dashboard'} />
      <Footer />
    </div>
  );
}
