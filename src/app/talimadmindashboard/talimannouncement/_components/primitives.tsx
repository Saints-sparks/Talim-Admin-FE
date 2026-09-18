'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * A numbered step heading in the create modal.
 *
 * @param props - The step number and title.
 * @param props.number - Which step this is.
 * @param props.title - The step title.
 * @returns The heading element.
 */
export function ModalStep({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B63CE] text-xs font-semibold text-white">
        {number}
      </span>
      <h3 className="font-semibold text-[#101828]">{title}</h3>
    </div>
  );
}

/**
 * A labelled form field in the create modal.
 *
 * @param props - The label and content.
 * @param props.label - The field name.
 * @param props.required - Adds the required marker.
 * @param props.htmlFor - The id of the control the label describes.
 * @param props.children - The control.
 * @returns The field element.
 */
export function ModalField({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-[#344054]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * One labelled fact in the detail view.
 *
 * @param props - The icon, label and value.
 * @param props.icon - Rendered beside the label.
 * @param props.label - The field name.
 * @param props.value - The value.
 * @returns The row element.
 */
export function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[20px_100px_minmax(0,1fr)] items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 text-[#667085]" />
      <span className="font-semibold text-[#667085]">{label}</span>
      <span className="text-[#344054]">{value}</span>
    </div>
  );
}

/**
 * One counter tile in the delivery summary.
 *
 * @param props - The label, value and accent.
 * @param props.label - What is being counted.
 * @param props.value - The formatted count, or an em dash when unknown.
 * @param props.accent - Optional colour emphasis.
 * @returns The tile element.
 */
export function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'emerald' | 'red';
}) {
  return (
    <div className="rounded-lg border border-[#E8EDF5] bg-[#FBFCFE] p-3">
      <p className="text-xs text-[#667085]">{label}</p>
      <p
        className={cn(
          'mt-1 font-semibold',
          accent === 'emerald' && 'text-emerald-700',
          accent === 'red' && 'text-red-600',
          !accent && 'text-[#101828]',
        )}
      >
        {value}
      </p>
    </div>
  );
}
