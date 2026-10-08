import Image from 'next/image';
import { useTranslations } from 'next-intl';
import posterBg from '@/assets/loopra-poster-bg.svg';
import posterPath from '@/assets/loopra-poster-path.svg';
import { PosterBadge, PosterBadgeDot } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Logo } from '@/components/ui/logo';
import { LanguageSwitch } from '@/components/ui/language-switch';
import Link from 'next/link';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: Props) {
  const t = useTranslations('Auth.poster');

  return (
    <div className="flex h-dvh w-full flex-col xl:flex-row">
      <div className="flex h-dvh flex-1 flex-col px-[22px] pt-7 pb-9 md:px-8 md:pt-8 md:pb-10 xl:items-end xl:px-14 xl:py-11">
        <div className="flex min-h-0 w-full flex-1 flex-col xl:max-w-[960px]">
          <nav className="flex shrink-0 items-center justify-between">
            <Link href="/">
              <Logo height={26} />
            </Link>
            <LanguageSwitch />
          </nav>
          <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto py-8 md:py-10 xl:py-12">
            <div className="my-auto w-full max-w-[380px]">{children}</div>
          </main>
        </div>
      </div>
      <div
        className="relative hidden overflow-hidden xl:flex xl:flex-1"
        style={{
          backgroundImage: `url(${posterBg.src ?? posterBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Image
          src={posterPath}
          alt="Poster ride path"
          aria-hidden="true"
          width={820}
          height={800}
          className="absolute top-1/2 left-0 h-full max-h-[900px] w-auto -translate-y-1/2"
          unoptimized
        />
        <div className="absolute inset-0 flex flex-col items-start justify-center px-[clamp(24px,4.2vw,80px)] py-16">
          <PosterBadge className="mb-9">
            <PosterBadgeDot />
            {t('badge')}
          </PosterBadge>
          <Text variant="heading-xxl" className="mb-7 text-white">
            {t.rich('heading', {
              br: () => <br />,
              em: (chunks) => <em className="text-accent">{chunks}</em>,
            })}
          </Text>
          <Text variant="poster-body" className="max-w-[580px] text-white/70">
            {t('body')}
          </Text>
        </div>
      </div>
    </div>
  );
}
