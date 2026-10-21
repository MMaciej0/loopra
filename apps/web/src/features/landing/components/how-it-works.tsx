import { useTranslations } from 'next-intl';
import { Text } from '@/components/ui/text';

const PATHS = ['join', 'organise'] as const;
const STEPS = ['step1', 'step2', 'step3'] as const;

export function HowItWorks() {
  const t = useTranslations('LandingPage.howItWorks');

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="mx-auto flex w-full max-w-[1280px] scroll-mt-20 flex-col gap-[clamp(24px,3vw,36px)] px-[clamp(20px,4vw,48px)] pt-[clamp(24px,4vw,48px)]"
    >
      <div className="flex flex-col gap-3">
        <Text variant="meta" className="text-muted-foreground flex items-center gap-2.5 uppercase">
          <span aria-hidden className="bg-accent size-2 shrink-0 rounded-full" />
          {t('eyebrow')}
        </Text>
        <h2
          id="how-it-works-title"
          className="font-editorial text-[clamp(24px,2.4vw,30px)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance"
        >
          {t('title')}
        </h2>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-4">
        {PATHS.map((path) => (
          <div
            key={path}
            className="border-border bg-secondary flex flex-col gap-8 rounded-[20px] border p-[clamp(28px,3.5vw,44px)]"
          >
            <div className="flex flex-col gap-3">
              <Text variant="meta" className="text-accent-deep uppercase">
                {t(`${path}.label`)}
              </Text>
              <h3 className="font-editorial text-[clamp(32px,3.6vw,48px)] leading-none font-semibold tracking-[-0.035em] text-balance">
                {t(`${path}.title`)}
              </h3>
            </div>
            <ol className="flex flex-col">
              {STEPS.map((step, index) => (
                <li
                  key={step}
                  className="border-border grid grid-cols-[36px_minmax(0,1fr)] gap-3 border-t py-4"
                >
                  <span aria-hidden className="font-data text-muted-foreground pt-[3px] text-xs">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-base font-semibold">{t(`${path}.${step}.title`)}</h4>
                    <p className="text-foreground/70 text-sm leading-[1.5] text-pretty">
                      {t(`${path}.${step}.body`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
