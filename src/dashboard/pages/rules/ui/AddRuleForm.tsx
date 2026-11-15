import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { notify } from '@/dashboard/shared/lib/notify';
import { RULE_TYPE_LABEL, ruleType } from '@/shared/lib/routing';
import type { RuleTarget } from '@/shared/model';
import { Button } from '@/shared/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

import { TargetPicker } from './TargetPicker';

import type { TargetOption } from '../lib/targets';
import type { KeyboardEvent } from 'react';

const schema = z.object({
  pattern: z.string().trim().min(1, 'Type a site pattern first'),
  target: z.custom<RuleTarget>(),
});
type AddRule = z.infer<typeof schema>;

export function AddRuleForm({
  options,
  onAdd,
  onCancel,
}: {
  options: TargetOption[];
  onAdd: (pattern: string, target: RuleTarget) => Promise<void>;
  onCancel: () => void;
}) {
  const form = useForm<AddRule>({
    resolver: zodResolver(schema),
    defaultValues: { pattern: '', target: options[0]?.target ?? { kind: 'direct' } },
  });
  const pattern = useWatch({ control: form.control, name: 'pattern' }).trim();

  const submit = form.handleSubmit(
    (values) => onAdd(values.pattern, values.target),
    (errors) => notify({ text: errors.pattern?.message ?? '', icon: CircleAlert, tone: 'warning' })
  );
  const cancelOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') onCancel();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={submit}
        onKeyDown={cancelOnEscape}
        className="border-fp-line bg-fp-soft flex flex-wrap items-center gap-2 border-t px-4 py-3.5"
      >
        <FormField
          control={form.control}
          name="pattern"
          render={({ field }) => (
            <FormItem className="flex-[1_1_14rem]">
              <FormControl>
                <Input
                  className="font-mono"
                  placeholder="*.example.com, 10.0.0.0/8 or ^https://…"
                  autoFocus
                  spellCheck={false}
                  aria-label="Site pattern"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <span className="text-fp-accent-ink text-xs font-semibold whitespace-nowrap">
          {pattern ? RULE_TYPE_LABEL[ruleType(pattern)] : 'Type a pattern'}
        </span>
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <TargetPicker value={field.value} options={options} onChange={field.onChange} />
          )}
        />
        <Button type="submit">Add</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </form>
    </Form>
  );
}
