import {forwardRef, type SVGProps} from 'react';

/** 的（三重の円）のアイコン。Wonder の台紙は「目標と進捗」に lucide の target を使っていて、Heroicons には同じ形が無いので、
 *  Heroicons の outline と同じ作り（24 の枠・線の太さ 1.5・currentColor）で描く */
export const TargetIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function TargetIcon(props, ref) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
      data-slot="icon"
      ref={ref}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.25" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
});
