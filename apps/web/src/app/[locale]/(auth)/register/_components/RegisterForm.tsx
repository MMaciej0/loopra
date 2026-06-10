import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Text } from '@/components/ui/text';

export async function RegisterForm({ redirectTo: _redirectTo }: { redirectTo: string }) {
  const t = await getTranslations('RegisterPage');

  return (
    <form>
      <Field
        id="email"
        name="email"
        label={t('emailLabel')}
        type="email"
        placeholder={t('emailPlaceholder')}
        autoFocus
      />
      <Field
        id="username"
        name="username"
        label={t('usernameLabel')}
        type="text"
        placeholder={t('usernamePlaceholder')}
      />
      <Field
        id="password"
        name="password"
        label={t('passwordLabel')}
        type="password"
        placeholder="••••••••"
      />

      <Button type="submit" size="lg" className="mt-[18px] w-full">
        {t('submit')}
      </Button>

      <Text variant="body-xs" className="text-muted-foreground pt-3.5 text-center">
        {t.rich('termsAgreement', {
          terms: (chunks) => (
            <Link href="/terms" className="border-foreground text-foreground border-b">
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link href="/privacy" className="border-foreground text-foreground border-b">
              {chunks}
            </Link>
          ),
        })}
      </Text>
    </form>
  );
}
