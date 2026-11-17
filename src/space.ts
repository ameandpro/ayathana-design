// Astryx の余白の段（SpacingStep → --spacing-N）を役で引く。
// 段の値そのものは @astryxdesign/core/dist/astryx.css の --spacing-* が正本。
export const SPACE = {
  /** 画面の外周・画面内の大きなまとまりの間 */
  page: 6,
  /** カードの内側・カード同士の間 */
  card: 4,
  /** カードの中の見出しと中身の間 */
  block: 3,
  /** 横に並ぶ小さな部品の間 */
  inline: 2,
  /** 見出しと補足の行の間 */
  tight: 1,
  none: 0,
} as const;
