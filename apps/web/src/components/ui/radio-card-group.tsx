import { useFormContext, type FieldValues, type Path } from 'react-hook-form';

export type RadioCardOption = {
  value: string;
  label: string;
  description?: string;
};

type RadioCardGroupProps<TValues extends FieldValues> = {
  name: Path<TValues>;
  legend: string;
  options: readonly RadioCardOption[];
};

export function RadioCardGroup<TValues extends FieldValues>({
  name,
  legend,
  options,
}: RadioCardGroupProps<TValues>) {
  const { register } = useFormContext<TValues>();

  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="text-muted-foreground p-0 font-mono text-[9.5px] font-medium tracking-[0.12em] uppercase">
        {legend}
      </legend>
      <div className="mt-2 grid gap-1.5 md:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className="group block h-full cursor-pointer">
            <input type="radio" value={option.value} {...register(name)} className="sr-only" />
            <span className="border-border group-hover:border-border-strong group-has-[:checked]:border-accent group-has-[:checked]:bg-accent/10 group-has-[:checked]:group-hover:border-accent group-has-[:focus-visible]:border-ring group-has-[:focus-visible]:ring-ring/50 flex h-full items-start gap-2.5 rounded-[10px] border bg-clip-padding px-3 py-2.5 transition-all group-has-[:focus-visible]:ring-3">
              <span
                aria-hidden
                className="border-border-strong bg-background group-has-[:checked]:border-accent mt-[3px] size-3.5 shrink-0 rounded-full border transition-all group-has-[:checked]:border-[4.5px]"
              />
              <span className="min-w-0">
                <span className="block text-[12.5px] font-medium tracking-[-0.005em]">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-muted-foreground mt-0.5 block text-[11.5px] leading-snug">
                    {option.description}
                  </span>
                )}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
