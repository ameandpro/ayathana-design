import type {CSSProperties} from 'react';
import type {TableColumn} from '@astryxdesign/core/Table';

/**
 * 表を囲む要素（.mg-stack。縦版・横版・個人の画面の表）に、列の見出しを --label-1〜 として渡す。
 * 狭い幅では見出しの行を隠して1行ずつ縦に積み、各セルの前にこの見出しを出す
 * （ガイド responsive-table「Define column labels as CSS variables」「Inject labels」）。
 */
export function tableLabels<T extends Record<string, unknown>>(columns: TableColumn<T>[]): CSSProperties {
  const labels = columns.map(c => String(c.header));
  // 見出しの欄の幅は、一番長い見出しの文字数ぶん（日本語は1文字がほぼ 1em）
  const widest = Math.max(...labels.map(l => [...l].length));
  return {
    ...Object.fromEntries(labels.map((l, i) => [`--label-${i + 1}`, JSON.stringify(l)])),
    '--label-w': `${widest}em`,
  } as CSSProperties;
}
