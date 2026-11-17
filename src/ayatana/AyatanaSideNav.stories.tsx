import type {Meta, StoryObj} from '@storybook/react-vite';
import {AppShell} from '@astryxdesign/core/AppShell';
import {AyatanaSideNav} from './AyatanaSideNav';

// Ayatana の全画面で使うサイドバーの見本。画面はこの部品をそのまま置く（画面ごとに書き直さない）。
const meta = {
  title: 'Ayatana/サイドバー',
  component: AyatanaSideNav,
  // 画面と同じく AppShell の左に置いて見せる（右の本文は空）
  decorators: [
    Story => (
      <AppShell contentPadding={0} sideNav={<Story />}>
        <div />
      </AppShell>
    ),
  ],
} satisfies Meta<typeof AyatanaSideNav>;
export default meta;

type Story = StoryObj<typeof meta>;

/** 上司ホーム（/ayatana-manager-stacked）・ホーム（/ayatana-home）・旧の上司ホーム（/ayatana-manager） */
export const ホーム: Story = {args: {initialTab: 'home', selected: 'home'}};

/** フィード（/ayatana-feed） */
export const フィード: Story = {args: {initialTab: 'home', selected: 'feed'}};

/** メンバー個人の画面（/ayatana-member・/ayatana-member-yamada）。ページの項目は無く、区画のホームに印 */
export const メンバー個人: Story = {args: {initialTab: 'home', selected: null, section: 'home'}};

/** アヤとのチャットを開いた上司ホーム（/ayatana-manager-chat） */
export const チャット: Story = {args: {initialTab: 'chat', selected: 'chat-action'}};
