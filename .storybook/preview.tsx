import type {Preview} from '@storybook/react-vite';
import {Theme} from '@astryxdesign/core/theme';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import jaJP from '@astryxdesign/core/locales/ja-JP.generated.js';
// アプリ（src/main.tsx）と同じ順で Astryx とテーマの CSS を読む
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import '../src/app.css';

const preview: Preview = {
  parameters: {layout: 'fullscreen'},
  // アプリ（src/App.tsx）と同じ言語とテーマで包む
  decorators: [
    Story => (
      <InternationalizationProvider locale="ja-JP" messages={{'ja-JP': jaJP}}>
        <Theme theme={neutralTheme} mode="light">
          <Story />
        </Theme>
      </InternationalizationProvider>
    ),
  ],
};
export default preview;
