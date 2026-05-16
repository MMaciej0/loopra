"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge, BadgeDot } from "@/components/ui/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
  AVATAR_COLORS,
  getAvatarColorIndex,
} from "@/components/ui/avatar"

// ── Button showcase ───────────────────────────────────────────────────────────

const variants = ["default", "secondary", "accent", "ghost", "outline", "destructive", "link"] as const
const sizes = ["sm", "default", "lg", "xs", "icon", "icon-sm", "icon-lg"] as const

const variantLabels: Record<typeof variants[number], string> = {
  default: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  ghost: "Ghost",
  outline: "Outline",
  destructive: "Destructive",
  link: "Link",
}

const sizeLabels: Record<typeof sizes[number], string> = {
  sm: "sm",
  default: "default (md)",
  lg: "lg",
  xs: "xs",
  icon: "icon",
  "icon-sm": "icon-sm",
  "icon-lg": "icon-lg",
}

// ── Input showcase ────────────────────────────────────────────────────────────

const inputStates = [
  { label: "Default",  props: { placeholder: "you@example.com" } },
  { label: "Error",    props: { defaultValue: "kasia@", "aria-invalid": true as const }, hint: "Please enter a valid email" },
  { label: "Disabled", props: { defaultValue: "locked@field.cc", disabled: true } },
] as const

const inputTypes = [
  { label: "Text",     type: "text",     placeholder: "Ride name" },
  { label: "Email",    type: "email",    placeholder: "you@example.com" },
  { label: "Password", type: "password", placeholder: "••••••••" },
  { label: "Number",   type: "number",   placeholder: "42" },
] as const

// ── Badge showcase ────────────────────────────────────────────────────────────

const badgeVariants = ["default", "accent", "coral", "inverse", "soft"] as const

const badgeLabels: Record<typeof badgeVariants[number], string> = {
  default: "Default",
  accent:  "Accent",
  coral:   "Coral",
  inverse: "Inverse",
  soft:    "Soft",
}

const badgeExamples: Record<typeof badgeVariants[number], React.ReactNode> = {
  default: "Saturday",
  accent:  <><BadgeDot />Road · Social</>,
  coral:   "First-timers welcome",
  inverse: "Joined",
  soft:    "Drop ride",
}

// ── Filter chip showcase ──────────────────────────────────────────────────────

const chipOptions = ["All", "Road", "Gravel", "MTB", "Urban"] as const

// ── Shared ────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-data text-[9.5px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
      {children}
    </span>
  )
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mb-8">
      <p className="font-data text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground mb-2">{eyebrow}</p>
      <h2 className="font-editorial text-3xl font-normal tracking-tight mb-1">{title}</h2>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-4 pb-4">
      <p className="font-data text-[10px] tracking-widest uppercase text-muted-foreground mb-3">{label}</p>
      <div className="flex flex-wrap gap-3 items-center">{children}</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeChip, setActiveChip] = useState<string>("All")

  return (
    <main className="min-h-screen bg-background p-12 space-y-20">

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
                <th className="text-left pb-4 pr-8 font-data text-[10px] tracking-widest uppercase text-muted-foreground">Variant</th>
                {sizes.map(s => (
                  <th key={s} className="text-left pb-4 px-4 font-data text-[10px] tracking-widest uppercase text-muted-foreground whitespace-nowrap">
                    {sizeLabels[s]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map(v => (
                <tr key={v} className="border-t border-border">
                  <td className="py-5 pr-8 font-data text-[11px] tracking-wide text-muted-foreground whitespace-nowrap">{variantLabels[v]}</td>
                  {sizes.map(s => (
                    <td key={s} className="py-5 px-4">
                      <Button variant={v} size={s}>{s.startsWith("icon") ? "+" : variantLabels[v]}</Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Row label="Disabled states">
          {variants.filter(v => v !== "link").map(v => (
            <Button key={v} variant={v} disabled>{variantLabels[v]}</Button>
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
              <div key={label} className="flex flex-col gap-1.5 w-56">
                <Label>{label}</Label>
                <Input type="email" {...props} />
                {hint && <span className="text-[11.5px] text-destructive">{hint}</span>}
              </div>
            ))}
          </Row>
          <Row label="Types">
            {inputTypes.map(({ label, type, placeholder }) => (
              <div key={label} className="flex flex-col gap-1.5 w-44">
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
          {badgeVariants.map(v => (
            <Badge key={v} variant={v}>{badgeExamples[v]}</Badge>
          ))}
        </Row>
        <Row label="sm · all variants">
          {badgeVariants.map(v => (
            <Badge key={v} variant={v} size="sm">{badgeExamples[v]}</Badge>
          ))}
        </Row>
        <Row label="With dot · accent &amp; coral">
          <Badge variant="accent"><BadgeDot />Road · Social</Badge>
          <Badge variant="coral"><BadgeDot />First-timers welcome</Badge>
          <Badge variant="accent" size="sm"><BadgeDot />Gravel</Badge>
          <Badge variant="coral" size="sm">FULL</Badge>
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
          {(["sm", "default", "lg"] as const).map((size, i) => (
            <Avatar key={size} size={size}>
              <AvatarFallback color={i}>
                {size === "sm" ? "K" : size === "default" ? "M" : "A"}
              </AvatarFallback>
            </Avatar>
          ))}
        </Row>

        <Row label="Palette — all 6 colors">
          {AVATAR_COLORS.map((_, i) => (
            <Avatar key={i}>
              <AvatarFallback color={i}>
                {"KMOADTJ"[i]}
              </AvatarFallback>
            </Avatar>
          ))}
        </Row>

        <Row label="With image + fallback">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback color={0}>S</AvatarFallback>
          </Avatar>
          <Avatar>
            {/* broken src → shows fallback */}
            <AvatarImage src="/broken.png" alt="broken" />
            <AvatarFallback color={2}>B</AvatarFallback>
          </Avatar>
        </Row>

        <Row label="With badge indicator">
          {(["sm", "default", "lg"] as const).map((size, i) => (
            <Avatar key={size} size={size}>
              <AvatarFallback color={i + 3}>{["T", "O", "D"][i]}</AvatarFallback>
              <AvatarBadge />
            </Avatar>
          ))}
        </Row>

        <Row label="Stack — max 4 + overflow">
          {(["sm", "default", "lg"] as const).map((size) => (
            <AvatarGroup key={size}>
              {["K", "M", "A", "D"].map((initial, i) => (
                <Avatar key={initial} size={size}>
                  <AvatarFallback color={i}>{initial}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+3</AvatarGroupCount>
            </AvatarGroup>
          ))}
        </Row>

        <Row label="Deterministic color from seed">
          {["aleks.k", "monika92", "tomek_cc", "daria", "olek.rider"].map((name) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <Avatar>
                <AvatarFallback color={getAvatarColorIndex(name)}>
                  {name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-data text-[9px] tracking-wide text-muted-foreground">{name}</span>
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
          {chipOptions.map(opt => (
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
          <Button variant="chip" aria-pressed={false}>Unselected</Button>
          <Button variant="chip" aria-pressed={true}>Selected</Button>
          <Button variant="chip" disabled>Disabled</Button>
          <Button variant="chip" aria-pressed={true} disabled>Selected · disabled</Button>
        </Row>
      </section>

    </main>
  )
}
