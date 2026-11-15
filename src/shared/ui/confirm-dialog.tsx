import { useEffect, useState } from 'react';

import { cn } from '../lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';

import type * as React from 'react';

/**
 * Centralized, promise-based confirm — the single branded replacement for the
 * native window.confirm() gray box. Mount <ConfirmDialogHost/> once (done in the
 * dashboard layout), then call it anywhere:
 *
 *   if (await confirmDialog({ title: 'Delete sub-user?', description: '…',
 *                             confirmLabel: 'Delete', destructive: true })) { … }
 *
 * Resolves true (confirmed) / false (cancelled or dismissed). Falls back to
 * window.confirm if the host isn't mounted so a call can never hang.
 */
export interface ConfirmDialogOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  destructive?: boolean;
}

type ConfirmResolve = (result: boolean) => void;

interface ConfirmState {
  open: boolean;
  options: ConfirmDialogOptions;
  resolve: ConfirmResolve | null;
}

let openConfirm: ((options: ConfirmDialogOptions, resolve: ConfirmResolve) => void) | null = null;

export function confirmDialog(options: ConfirmDialogOptions = {}): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (typeof openConfirm !== 'function') {
      resolve(
        typeof window !== 'undefined'
          ? window.confirm((options.description || options.title || 'Are you sure?') as string)
          : false
      );
      return;
    }
    openConfirm(options, resolve);
  });
}

export function ConfirmDialogHost() {
  const [state, setState] = useState<ConfirmState>({ open: false, options: {}, resolve: null });

  useEffect(() => {
    openConfirm = (options, resolve) => setState({ open: true, options, resolve });
    return () => {
      openConfirm = null;
    };
  }, []);

  const settle = (result: boolean) => {
    state.resolve?.(result);
    setState((s) => ({ ...s, open: false, resolve: null }));
  };

  const o = state.options;

  return (
    <AlertDialog open={state.open} onOpenChange={(v) => !v && settle(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{o.title || 'Are you sure?'}</AlertDialogTitle>
          {o.description && <AlertDialogDescription>{o.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => settle(false)}>
            {o.cancelLabel || 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => settle(true)}
            className={cn(o.destructive && 'bg-status-error hover:bg-status-error/90 text-white')}
          >
            {o.confirmLabel || 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
