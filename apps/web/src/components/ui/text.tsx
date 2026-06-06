import { cn } from '@/lib/utils';
import { type ElementType, type ReactNode, type ComponentPropsWithoutRef } from 'react';

const variantClass = {
  'heading-xxl': 'type-heading-xxl',
  'heading-xl': 'type-heading-xl',
  'heading-l': 'type-heading-l',
  'heading-m': 'type-heading-m',
  'poster-body': 'type-poster-body',
  'body-l': 'type-body-l',
  'body-m': 'type-body-m',
  'body-s': 'type-body-s',
  caption: 'type-caption',
  label: 'type-label',
  stat: 'type-stat',
  meta: 'type-meta',
} as const;

const variantDefaultTag = {
  'heading-xxl': 'h1',
  'heading-xl': 'h1',
  'heading-l': 'h2',
  'heading-m': 'blockquote',
  'poster-body': 'p',
  'body-l': 'p',
  'body-m': 'p',
  'body-s': 'p',
  caption: 'span',
  label: 'span',
  stat: 'span',
  meta: 'span',
} as const;

export type TextVariant = keyof typeof variantClass;

type TextProps<T extends ElementType> = {
  variant: TextVariant;
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'variant' | 'className' | 'children'>;

export function Text<T extends ElementType = 'span'>({
  variant,
  as,
  className,
  children,
  ...props
}: TextProps<T>) {
  const Tag = (as ?? variantDefaultTag[variant]) as ElementType;
  return (
    <Tag className={cn(variantClass[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
