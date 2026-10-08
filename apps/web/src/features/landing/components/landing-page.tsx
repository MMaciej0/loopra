import { ExampleRides } from './example-rides';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';
import { LandingFooter } from './landing-footer';
import { LandingHeader } from './landing-header';

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <LandingHeader pathname="/" />
      <main className="flex-1 pb-[clamp(56px,8vw,104px)]">
        <section className="mx-auto grid w-full max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-[clamp(40px,6vw,88px)] px-[clamp(20px,4vw,48px)] pt-[clamp(48px,9vw,120px)] pb-[clamp(56px,8vw,104px)]">
          <Hero />
          <ExampleRides />
        </section>
        <HowItWorks />
      </main>
      <LandingFooter />
    </div>
  );
}
