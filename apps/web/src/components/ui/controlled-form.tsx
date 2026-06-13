'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { FormError } from '@/components/ui/form-error';

export interface ControlledFormRenderProps {
  showErrors: boolean;
}

export interface ControlledFormProps
  extends Omit<ComponentProps<'form'>, 'onChange' | 'onSubmit' | 'children'> {
  isLoading: boolean;
  formError?: ReactNode;
  children: (props: ControlledFormRenderProps) => ReactNode;
}

export function ControlledForm({
  isLoading,
  formError,
  children,
  ...formProps
}: ControlledFormProps) {
  const [isDirty, setIsDirty] = useState(false);
  const showErrors = !isDirty && !isLoading;

  return (
    <form {...formProps} onChange={() => setIsDirty(true)} onSubmit={() => setIsDirty(false)}>
      {formError && showErrors && <FormError>{formError}</FormError>}
      {children({ showErrors })}
    </form>
  );
}
