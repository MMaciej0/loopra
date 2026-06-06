import Image from 'next/image';
import posterBg from '@/assets/loopra-poster-bg.svg';
import posterPath from '@/assets/loopra-poster-path.svg';
import { PosterBadge, PosterBadgeDot } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1920px] flex-col xl:flex-row">
      <div className="flex min-h-dvh flex-1 flex-col px-[22px] pt-7 pb-9 md:px-8 md:pt-8 md:pb-10 xl:items-end xl:px-14 xl:py-11">
        <div className="flex min-h-0 w-full flex-1 flex-col xl:max-w-[960px]">
          <nav className="flex shrink-0 items-center justify-between">
            <Link href="/">
              <Logo height={26} />
            </Link>
            <Button variant="nav" asChild>
              <Link href="/help">Need help?</Link>
            </Button>
          </nav>
          <main className="flex min-h-0 flex-1 items-center justify-center py-8 md:py-10 xl:py-12">
            <div className="w-full max-w-[380px]">{children}</div>
          </main>
          <footer className="text-muted-foreground flex shrink-0 flex-wrap gap-3 text-[11.5px] sm:gap-[18px]">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <span>© 2026 Loopra</span>
          </footer>
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
        <div className="absolute inset-0 flex flex-col items-start justify-center px-20 py-16">
          <PosterBadge className="mb-9">
            <PosterBadgeDot />
            OPEN WORLDWIDE · NEW RIDES DAILY
          </PosterBadge>
          <Text variant="heading-xxl" className="text-brand-foreground mb-7">
            Find rides you
            <br />
            <em className="text-brand">actually belong</em> on.
          </Text>
          <Text variant="poster-body" className="text-brand-foreground/70 max-w-[580px]">
            An open ride calendar for cyclists. Log in, create a ride in 60 seconds, or browse
            what&apos;s nearby.
          </Text>
        </div>
      </div>
    </div>
  );
}
