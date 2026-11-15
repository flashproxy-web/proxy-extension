import { useFormContext } from 'react-hook-form';

import { PROTOCOLS, PROXY_KINDS } from '@/dashboard/shared/config';
import { LabelRow } from '@/dashboard/shared/ui/LabelRow';
import { SegmentedControl } from '@/dashboard/shared/ui/SegmentedControl';
import { FormControl, FormField, FormItem } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

import { TagInput } from './TagInput';

import type { ProxyForm } from '../model/proxy-form';

export function LabelField() {
  const { control } = useFormContext<ProxyForm>();
  return (
    <FormField
      control={control}
      name="label"
      render={({ field }) => (
        <FormItem>
          <LabelRow label="Label" />
          <FormControl>
            <Input placeholder="e.g. BD Residential · US" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export function KindField() {
  const { control } = useFormContext<ProxyForm>();
  return (
    <FormField
      control={control}
      name="kind"
      render={({ field }) => (
        <FormItem>
          <LabelRow label="Type" />
          <SegmentedControl
            fullWidth
            options={PROXY_KINDS}
            value={field.value}
            onValueChange={field.onChange}
          />
        </FormItem>
      )}
    />
  );
}

export function ProtocolField() {
  const { control } = useFormContext<ProxyForm>();
  return (
    <FormField
      control={control}
      name="protocol"
      render={({ field }) => (
        <FormItem>
          <LabelRow label="Protocol" />
          <SegmentedControl
            fullWidth
            options={PROTOCOLS}
            value={field.value}
            onValueChange={field.onChange}
          />
        </FormItem>
      )}
    />
  );
}

export function TagsField() {
  const { control } = useFormContext<ProxyForm>();
  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <LabelRow label="Tags" />
          <TagInput value={field.value} onChange={field.onChange} />
        </FormItem>
      )}
    />
  );
}
