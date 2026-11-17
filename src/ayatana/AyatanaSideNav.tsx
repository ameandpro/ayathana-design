import {useState, type FocusEvent} from 'react';
import {SideNav, SideNavHeading, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Item} from '@astryxdesign/core/Item';
import {
  ArrowsRightLeftIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import {SPACE} from '../space';
import {TargetIcon} from './TargetIcon';
import {CHAT_TOPIC_LABEL, chatHref, type ChatTopic} from './manager/chatTopics';
import './AyatanaSideNav.css';

// Ayatana の全画面で使う1つのサイドバー（台紙 tug の Sidebar）。画面ごとに書かず、これを置く。
// 見本は AyatanaSideNav.stories.tsx（Storybook）。

export type SideTab = 'chat' | 'home';
export type NavKey = 'home' | 'feed' | `chat-${ChatTopic}` | null;

// チャットタブに並べる話題。並びは上司ホームの本文と同じ順（アクション・満足度・目標・キャリア・前向き・困りごと。台紙 fun・lib・tug・net も同じ6行）。
// 会議 11/13 00:11:15「チャットはちゃんと左側に履歴として溜まっていくんで」: 開けるチャットは全部、左の履歴に行がある
const CHAT_ROWS: ChatTopic[] = ['action', 'satisfaction', 'goals', 'career', 'positive', 'trouble'];

// 台紙の Nav Tabs（チャット／ホーム）。ページの移動ではなく、サイドバーの中身を切り替えるので tabs にする。
// Astryx の TabList が矢印キーでの移動とフォーカスを受け持つ（選んだタブに tabIndex 0、ほかは -1）。
// Astryx は矢印キーでフォーカスだけを動かすので、ガイド（tabs「Default to selection follows focus」）に合わせて
// フォーカスが来たタブを選ぶ。
const TAB_BY_ID: Record<string, SideTab> = {'mg-tab-chat': 'chat', 'mg-tab-home': 'home'};

export function AyatanaSideNav({
  initialTab,
  selected,
  section = null,
}: {
  initialTab: SideTab;
  /** このページそのもの（aria-current="page" が付く） */
  selected: NavKey;
  /** このページを含む区画（山田 拓也さん個人画面ならホーム）。見た目の印だけで、aria-current は付けない */
  section?: NavKey;
}) {
  const [tab, setTab] = useState<SideTab>(initialTab);
  // 同じ画面のまま道筋だけ変わる（ホーム→チャット）ときも、開くタブを道筋に合わせる
  const [shownInitial, setShownInitial] = useState<SideTab>(initialTab);
  if (shownInitial !== initialTab) {
    setShownInitial(initialTab);
    setTab(initialTab);
  }
  // 台紙ではこのページの項目も、このページを含む区画の項目も、文字が semibold（Astryx の選択中は medium）
  const navClass = (key: NavKey) => {
    if (key !== null && selected === key) return 'mg-nav-current';
    if (key !== null && section === key) return 'mg-nav-section';
    return undefined;
  };
  const followFocus = (e: FocusEvent<HTMLElement>) => {
    const next = TAB_BY_ID[(e.target as HTMLElement).id];
    if (next) setTab(next);
  };
  return (
    <SideNav
      // 幅は AyatanaSideNav.css の .mg-sidenav で当てる（style で渡すと、狭い画面の引き出しの外枠にも付き、中身が切れる）
      className="mg-sidenav"
      header={<SideNavHeading heading="Ayatana" icon={<NavIcon icon={<Text weight="semibold" color="inherit">A</Text>} />} headingHref="/ayatana-manager-stacked" />}
      topContent={
        <div className="mg-tabs">
          <TabList role="tablist" layout="fill" size="sm" hasDivider={false} value={tab} onChange={v => setTab(v as SideTab)} onFocus={followFocus} aria-label="サイドバー">
            <Tab id="mg-tab-chat" value="chat" label="チャット" panelId="mg-panel-chat" />
            <Tab id="mg-tab-home" value="home" label="ホーム" panelId="mg-panel-home" />
          </TabList>
        </div>
      }
      // 左メニューの一番下（台紙の Sidebar Footer）。どのタブでも出る。
      // 使う人は名古屋支店の支店長（テストデータの従業員147）。名前はテストデータに無いので仮の名前「高橋 誠」
      footer={
        <VStack gap={SPACE.tight}>
          <SideNavItem label="設定" icon={Cog6ToothIcon} href="#" />
          {/* Avatar は名前の最初と最後の語から頭文字を作るので、1文字だけ渡して「高」にする。
              名前は台紙の Account Name と同じ semibold（Item の label の既定は regular） */}
          <Item startContent={<Avatar name="高" size="sm" />} label={<Text weight="semibold" color="inherit">高橋 誠</Text>} description="名古屋支店" density="compact" />
        </VStack>
      }
    >
      {/* パネル自体には余白・枠・背景を付けない（付けるのは中の要素） */}
      <div role="tabpanel" id="mg-panel-chat" aria-labelledby="mg-tab-chat" hidden={tab !== 'chat'}>
        <SideNavSection title="チャット" isHeaderHidden>
          {CHAT_ROWS.map(topic => {
            const key = `chat-${topic}` as const;
            return <SideNavItem key={topic} label={CHAT_TOPIC_LABEL[topic]} href={chatHref(topic)} isSelected={selected === key} className={navClass(key)} />;
          })}
        </SideNavSection>
      </div>
      <div role="tabpanel" id="mg-panel-home" aria-labelledby="mg-tab-home" hidden={tab !== 'home'}>
        <VStack gap={SPACE.card}>
          <SideNavSection title="ホーム" isHeaderHidden>
            <SideNavItem label="ホーム" icon={HomeIcon} href="/ayatana-manager-stacked" isSelected={selected === 'home'} className={navClass('home')} />
            <SideNavItem label="フィード" icon={InboxIcon} href="/ayatana-feed" isSelected={selected === 'feed'} className={navClass('feed')} />
          </SideNavSection>
          <SideNavSection title="目標管理・評価">
            <SideNavItem label="目標と進捗" icon={TargetIcon} href="#" />
            <SideNavItem label="目標面談" icon={ChatBubbleBottomCenterTextIcon} href="#" />
            <SideNavItem label="評価シート" icon={DocumentTextIcon} href="#" />
          </SideNavSection>
          <SideNavSection title="面談管理">
            <SideNavItem label="日程調整" icon={CalendarIcon} href="#" />
            <SideNavItem label="面談" icon={ChatBubbleLeftRightIcon} href="#" />
            <SideNavItem label="傾向分析" icon={ChartBarIcon} href="#" />
          </SideNavSection>
          <SideNavSection title="キャリア">
            <SideNavItem label="経歴" icon={BriefcaseIcon} href="#" />
            <SideNavItem label="学習とスキル" icon={BookOpenIcon} href="#" />
            <SideNavItem label="異動希望" icon={ArrowsRightLeftIcon} href="#" />
          </SideNavSection>
        </VStack>
      </div>
    </SideNav>
  );
}
