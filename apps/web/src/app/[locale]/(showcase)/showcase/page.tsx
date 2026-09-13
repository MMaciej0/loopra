'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  AVATAR_COLORS,
  getAvatarColorIndex,
} from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';

// ── Button showcase ───────────────────────────────────────────────────────────

const variants = [
  'default',
  'secondary',
  'accent',
  'ghost',
  'outline',
  'destructive',
  'link',
] as const;
const sizes = ['sm', 'default', 'lg', 'xs', 'icon', 'icon-sm', 'icon-lg'] as const;

const variantLabels: Record<(typeof variants)[number], string> = {
  default: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  ghost: 'Ghost',
  outline: 'Outline',
  destructive: 'Destructive',
  link: 'Link',
};

const sizeLabels: Record<(typeof sizes)[number], string> = {
  sm: 'sm',
  default: 'default (md)',
  lg: 'lg',
  xs: 'xs',
  icon: 'icon',
  'icon-sm': 'icon-sm',
  'icon-lg': 'icon-lg',
};

// ── Input showcase ────────────────────────────────────────────────────────────

const inputStates = [
  { label: 'Default', props: { placeholder: 'you@example.com' }, hint: undefined },
  {
    label: 'Error',
    props: { defaultValue: 'kasia@', 'aria-invalid': true as const },
    hint: 'Please enter a valid email',
  },
  {
    label: 'Disabled',
    props: { defaultValue: 'locked@field.cc', disabled: true },
    hint: undefined,
  },
] as const;

const inputTypes = [
  { label: 'Text', type: 'text', placeholder: 'Ride name' },
  { label: 'Email', type: 'email', placeholder: 'you@example.com' },
  { label: 'Password', type: 'password', placeholder: '••••••••' },
  { label: 'Number', type: 'number', placeholder: '42' },
] as const;

// ── Badge showcase ────────────────────────────────────────────────────────────

const badgeVariants = ['default', 'accent', 'destructive', 'inverse', 'soft'] as const;

const badgeExamples: Record<(typeof badgeVariants)[number], React.ReactNode> = {
  default: 'Saturday',
  accent: (
    <>
      <BadgeDot />
      Road · Social
    </>
  ),
  destructive: 'First-timers welcome',
  inverse: 'Joined',
  soft: 'Drop ride',
};

// ── Filter chip showcase ──────────────────────────────────────────────────────

const chipOptions = ['All', 'Road', 'Gravel', 'MTB', 'Urban'] as const;

// ── Shared ────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-data text-muted-foreground text-[9.5px] font-medium tracking-[0.12em] uppercase">
      {children}
    </span>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mb-8">
      <p className="font-data text-muted-foreground mb-2 text-[10px] font-medium tracking-[0.14em] uppercase">
        {eyebrow}
      </p>
      <h2 className="font-editorial mb-1 text-3xl font-normal tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border border-t pt-4 pb-4">
      <p className="font-data text-muted-foreground mb-3 text-[10px] tracking-widest uppercase">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  const [activeChip, setActiveChip] = useState<string>('All');
  const t = useTranslations('HomePage');

  return (
    <main className="bg-background min-h-screen space-y-20 p-12">
      <h1>{t('title')}</h1>

      {/* ── Typography ── */}
      <section>
        <SectionHeader
          eyebrow="00 · Typography"
          title="Type scale"
          desc="Bricolage Grotesque for headings · Geist for body · Geist Mono for data"
        />

        <div className="border-border space-y-1 border-t pt-6">
          <p className="type-label text-muted-foreground mb-6">Heading · Bricolage Grotesque</p>
          <div className="space-y-6">
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">
                XXL · 64/64 −2.5%
              </span>
              <Text variant="heading-xxl">Find rides you belong on</Text>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">XL · 38/40 −1%</span>
              <Text variant="heading-xl">Join loopra</Text>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">
                L · 30/34 −1.5%
              </span>
              <Text variant="heading-l">Saturday morning gravel</Text>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">
                M · 22/30 italic
              </span>
              <Text variant="heading-m">
                &quot;The best rides start before the city wakes up.&quot;
              </Text>
            </div>
          </div>
        </div>

        <div className="border-border mt-8 space-y-1 border-t pt-6">
          <p className="type-label text-muted-foreground mb-6">Body · Geist</p>
          <div className="max-w-xl space-y-4">
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">L · 17/26</span>
              <Text variant="body-l">
                A global community platform for cyclists who want to explore more, ride together,
                and find their local scene.
              </Text>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">M · 14/22 500</span>
              <Text variant="body-m">
                Cobbles &amp; Coffee — Sunday, 07:00 · 62 km · 820 m gain
              </Text>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">S · 13/20</span>
              <Text variant="body-s">
                Moderate pace, no drop policy. Road bikes and gravel welcome. Café stop at km 38.
              </Text>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">
                Caption · 11.5/16
              </span>
              <Text variant="caption" className="text-muted-foreground">
                Posted 4 hours ago · by aleks.k
              </Text>
            </div>
          </div>
        </div>

        <div className="border-border mt-8 space-y-1 border-t pt-6">
          <p className="type-label text-muted-foreground mb-6">Mono · Geist Mono</p>
          <div className="space-y-4">
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">Label · 10px</span>
              <Text variant="label" className="text-muted-foreground">
                Section label · Contract label
              </Text>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">
                Stat · 15px 600
              </span>
              <div className="flex gap-8">
                <div>
                  <Text variant="stat">42 km</Text>
                  <Text variant="label" className="text-muted-foreground mt-0.5 block">
                    Distance
                  </Text>
                </div>
                <div>
                  <Text variant="stat">580 m</Text>
                  <Text variant="label" className="text-muted-foreground mt-0.5 block">
                    Elevation
                  </Text>
                </div>
                <div>
                  <Text variant="stat">24</Text>
                  <Text variant="label" className="text-muted-foreground mt-0.5 block">
                    Riders
                  </Text>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="type-label text-muted-foreground w-28 shrink-0">Meta · 11px</span>
              <Text variant="meta" className="text-muted-foreground">
                04/12 CONFIRMED · 07:00 CET
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* ── Buttons ── */}
      <section>
        <SectionHeader
          eyebrow="01 · Buttons"
          title="Button variants"
          desc="All variants × all sizes. Hover and click to feel transitions."
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="font-data text-muted-foreground pr-8 pb-4 text-left text-[10px] tracking-widest uppercase">
                  Variant
                </th>
                {sizes.map((s) => (
                  <th
                    key={s}
                    className="font-data text-muted-foreground px-4 pb-4 text-left text-[10px] tracking-widest whitespace-nowrap uppercase"
                  >
                    {sizeLabels[s]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v} className="border-border border-t">
                  <td className="font-data text-muted-foreground py-5 pr-8 text-[11px] tracking-wide whitespace-nowrap">
                    {variantLabels[v]}
                  </td>
                  {sizes.map((s) => (
                    <td key={s} className="px-4 py-5">
                      <Button variant={v} size={s}>
                        {s.startsWith('icon') ? '+' : variantLabels[v]}
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Row label="Disabled states">
          {variants
            .filter((v) => v !== 'link')
            .map((v) => (
              <Button key={v} variant={v} disabled>
                {variantLabels[v]}
              </Button>
            ))}
        </Row>
      </section>

      {/* ── Inputs ── */}
      <section>
        <SectionHeader
          eyebrow="02 · Inputs"
          title="Form fields"
          desc="Hover to strengthen border. Focus for cobalt glow. Interact live."
        />
        <div className="space-y-6">
          <Row label="States">
            {inputStates.map(({ label, props, hint }) => (
              <div key={label} className="flex w-56 flex-col gap-1.5">
                <Label>{label}</Label>
                <Input type="email" {...props} />
                {hint && <span className="text-destructive text-[11.5px]">{hint}</span>}
              </div>
            ))}
          </Row>
          <Row label="Types">
            {inputTypes.map(({ label, type, placeholder }) => (
              <div key={label} className="flex w-44 flex-col gap-1.5">
                <Label>{label}</Label>
                <Input type={type} placeholder={placeholder} />
              </div>
            ))}
          </Row>
        </div>
      </section>

      {/* ── Badges (pills) ── */}
      <section>
        <SectionHeader
          eyebrow="03 · Badges"
          title="Pills"
          desc="Static status indicators. Not interactive — use the chip for filters."
        />
        <Row label="md · all variants">
          {badgeVariants.map((v) => (
            <Badge key={v} variant={v}>
              {badgeExamples[v]}
            </Badge>
          ))}
        </Row>
        <Row label="sm · all variants">
          {badgeVariants.map((v) => (
            <Badge key={v} variant={v} size="sm">
              {badgeExamples[v]}
            </Badge>
          ))}
        </Row>
        <Row label="With dot · accent &amp; destructive">
          <Badge variant="accent">
            <BadgeDot />
            Road · Social
          </Badge>
          <Badge variant="destructive">
            <BadgeDot />
            First-timers welcome
          </Badge>
          <Badge variant="accent" size="sm">
            <BadgeDot />
            Gravel
          </Badge>
          <Badge variant="destructive" size="sm">
            FULL
          </Badge>
        </Row>
      </section>

      {/* ── Avatars ── */}
      <section>
        <SectionHeader
          eyebrow="05 · Avatar"
          title="Avatar &amp; stack"
          desc="Single-initial fallback with deterministic palette. Stack separates discs with a 2px background ring."
        />

        <Row label="Sizes — sm / default / lg">
          {(['sm', 'default', 'lg'] as const).map((size, i) => (
            <Avatar key={size} size={size}>
              <AvatarFallback color={i}>
                {size === 'sm' ? 'K' : size === 'default' ? 'M' : 'A'}
              </AvatarFallback>
            </Avatar>
          ))}
        </Row>

        <Row label="Palette — all 6 colors">
          {AVATAR_COLORS.map((_, i) => (
            <Avatar key={i}>
              <AvatarFallback color={i}>{'KMOADTJ'[i]}</AvatarFallback>
            </Avatar>
          ))}
        </Row>

        <Row label="With image + fallback">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback color={0}>S</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="/broken.png" alt="broken" />
            <AvatarFallback color={2}>B</AvatarFallback>
          </Avatar>
        </Row>

        <Row label="With badge indicator">
          {(['sm', 'default', 'lg'] as const).map((size, i) => (
            <Avatar key={size} size={size}>
              <AvatarFallback color={i + 3}>{['T', 'O', 'D'][i]}</AvatarFallback>
              <AvatarBadge />
            </Avatar>
          ))}
        </Row>

        <Row label="Stack — max 4 + overflow">
          {(['sm', 'default', 'lg'] as const).map((size) => (
            <AvatarGroup key={size}>
              {['K', 'M', 'A', 'D'].map((initial, i) => (
                <Avatar key={initial} size={size}>
                  <AvatarFallback color={i}>{initial}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+3</AvatarGroupCount>
            </AvatarGroup>
          ))}
        </Row>

        <Row label="Deterministic color from seed">
          {['aleks.k', 'monika92', 'tomek_cc', 'daria', 'olek.rider'].map((name) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <Avatar>
                <AvatarFallback color={getAvatarColorIndex(name)}>
                  {name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-data text-muted-foreground text-[9px] tracking-wide">
                {name}
              </span>
            </div>
          ))}
        </Row>
      </section>

      {/* ── Filter chips ── */}
      <section>
        <SectionHeader
          eyebrow="06 · Filter chips"
          title="Chips"
          desc="Selectable filters. Toggle aria-pressed to flip selected state. Click to try."
        />
        <Row label="Live — click to select">
          {chipOptions.map((opt) => (
            <Button
              key={opt}
              variant="chip"
              aria-pressed={activeChip === opt}
              onClick={() => setActiveChip(opt)}
            >
              {opt}
            </Button>
          ))}
        </Row>
        <Row label="States">
          <Button variant="chip" aria-pressed={false}>
            Unselected
          </Button>
          <Button variant="chip" aria-pressed={true}>
            Selected
          </Button>
          <Button variant="chip" disabled>
            Disabled
          </Button>
          <Button variant="chip" aria-pressed={true} disabled>
            Selected · disabled
          </Button>
        </Row>
      </section>
    </main>
  );
}
