import {useEffect, useRef, type CSSProperties, type ReactNode} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Layout, LayoutContent, LayoutPanel, VStack, HStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {ChatMessage, ChatMessageBubble, ChatMessageList} from '@astryxdesign/core/Chat';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {SPACE} from '../../space';
import {
  ACTION_DONE,
  ACTION_METRIC,
  ACTION_OPEN,
  ACTION_OPEN_LABEL,
  AYA,
  AYA_ASK,
  CAREER,
  CAREER_METRIC,
  CHAT_ACTION,
  CHAT_TOPICS,
  GOAL_METRIC,
  GOALS,
  GOOD,
  HEAT,
  WEEK,
  SATISFACTION,
  SPLIT_GROUPS,
  TALK_DATES,
  TEAM_NAME,
  TREND_NOW,
  TREND_PREV,
  TREND_WEEKS_NOW,
  TREND_WEEKS_PREV,
  TROUBLE,
  WORDS,
  type CareerRow,
  type ChatMessage as AyaChatMessage,
  type GoalRow,
  type Word,
} from './managerData';
import {AyatanaSideNav} from '../AyatanaSideNav';
import {AskBar, AyaNote, MetricFigure, PageHeader, Phrase, ScoreGrid, Section, TopicRanking, TrendChart, usePointedPerson} from './ManagerParts';
import {CHAT_TOPIC_LABEL, chatHref, toChatTopic, type ChatTopic} from './chatTopics';
import {tableLabels} from './tableLabels';
import ayaImage from '../../assets/aya.png';
import './manager.css';

// 状態は文字を赤くせずタグで出す（本人「文字を赤で表現するのはやめよう、タグとかで表現するんだよ」）
// 表のセルの文は文節の切れ目で折り返す（「伝え／る」のような1文字だけの行を作らない）
// 日付・割合・金額が行の途中で割れないよう、文は Phrase を通す（Fable 7回目 S2）
const cell = (text: string) => <Text className="mg-phrase"><Phrase text={text} /></Text>;
const dateCell = (text: string) => <Text color="secondary">{text}</Text>;
// 表の名前は台紙の Name（fw:medium）。姓名の途中で割らない
const nameCell = (text: string) => <Text weight="medium" className="mg-keep">{text}</Text>;

/* ---------- 直近の活動 ---------- */

function ActionCard() {
  return (
    <Card padding={SPACE.page} data-chat-topic="action">
      {/* 台紙 lib のとおり、右の列を左の列の下端まで伸ばし、推移の線はその残りの高さいっぱいに描く（線の下に空きを残さない） */}
      <div className="mg-card-split mg-fill">
        <div className="mg-summary">
          <VStack gap={SPACE.block}>
            <Heading level={3} weight="semibold">次回までのアクション</Heading>
            <MetricFigure {...ACTION_METRIC} />
          </VStack>
          <AyaNote text={AYA.action} actions={[AYA_ASK.action]} askHref={chatHref('action')} />
        </div>
        <div className="mg-detail">
          <div className="mg-action-rows">
            <Badge label={ACTION_OPEN_LABEL} variant="error" />
            <HStack gap={SPACE.inline} vAlign="center" wrap="wrap">
              {ACTION_OPEN.map(n => <Text key={n}>{n}</Text>)}
            </HStack>
            {/* 完了の人がいないときは札ごと出さない（上の「6人中0人 完了」で0人と分かる） */}
            {ACTION_DONE.length > 0 && (
              <>
                <Badge label="完了" variant="green" />
                <HStack gap={SPACE.inline} vAlign="center" wrap="wrap">
                  {ACTION_DONE.map(n => <Text key={n}>{n}</Text>)}
                </HStack>
              </>
            )}
          </div>
          <TrendChart now={TREND_NOW} prev={TREND_PREV} weeksNow={TREND_WEEKS_NOW} weeksPrev={TREND_WEEKS_PREV} />
        </div>
      </div>
    </Card>
  );
}

function SatisfactionCard() {
  return (
    <Card padding={SPACE.page} data-chat-topic="satisfaction">
      <div className="mg-card-split">
        <div className="mg-summary">
          <VStack gap={SPACE.block}>
            <Heading level={3} weight="semibold" id="mg-satisfaction-title">仕事の満足度</Heading>
            <MetricFigure {...SATISFACTION} />
          </VStack>
          <AyaNote text={AYA.satisfaction} actions={[AYA_ASK.satisfaction]} askHref={chatHref('satisfaction')} />
        </div>
        <div className="mg-detail">
          <ScoreGrid labelledBy="mg-satisfaction-title" dates={TALK_DATES} rows={HEAT} />
        </div>
      </div>
    </Card>
  );
}

/* ---------- 業績目標 ---------- */

const GOAL_COLUMNS: TableColumn<GoalRow>[] = [
  // 同じ人の2行目からは名前を出さない（名前の列が人のまとまりの見出しになる）
  {key: 'name', header: '名前', width: pixel(104), renderCell: r => (r.isFirstOfPerson ? nameCell(r.name) : <span className="mg-person-cont" aria-hidden="true" />)},
  {
    key: 'goal',
    header: '目標',
    // 目標と実績の幅は 3:2。8:3 にするとチャットを開いた幅で表が横にはみ出し、実績が日付の途中で折れた（Fable 7回目 S1・S2）
    width: proportional(3, {minWidth: 200}),
    renderCell: r => (
      <HStack gap={SPACE.inline} vAlign="center" wrap="wrap">
        {cell(r.goal)}
        {r.isStalled ? <Badge label="停滞" variant="error" /> : null}
        {r.review ? <Badge label={r.review} variant="neutral" /> : null}
      </HStack>
    ),
  },
  {key: 'result', header: '実績', width: proportional(2, {minWidth: 160}), renderCell: r => cell(r.result)},
  {key: 'updated', header: '最終更新', width: pixel(72), renderCell: r => dateCell(r.updated)},
];

function GoalsCard() {
  return (
    <Card padding={SPACE.page} data-chat-topic="goals">
      <div className="mg-card-split mg-card-stack">
        <div className="mg-summary">
          <VStack gap={SPACE.block}>
            <Heading level={3} weight="semibold" id="mg-goals-title">見直し済みの目標</Heading>
            <MetricFigure {...GOAL_METRIC} />
          </VStack>
          <AyaNote text={AYA.goals} actions={[AYA_ASK.goals]} askHref={chatHref('goals')} />
        </div>
        <div className="mg-detail">
          <div className="mg-table mg-goals mg-stack mg-stack-goals" style={tableLabels(GOAL_COLUMNS)}>
            <Table
              data={GOALS}
              columns={GOAL_COLUMNS}
              density="compact"
              verticalAlign="top"
              aria-labelledby="mg-goals-title"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- キャリアプラン・コンピテンシー ---------- */

// 状態のタグの色は状態だけで決める（同じ「未反映」が赤と灰色に分かれると違いの説明が要る）
const STATE_VARIANT = {未反映: 'error', 未確認: 'neutral', 反映済み: 'green'} as const;

const careerColumns = (personCell: (name: string, content: ReactNode) => ReactNode): TableColumn<CareerRow>[] => [
  {key: 'name', header: '名前', width: pixel(104), renderCell: r => personCell(r.name, nameCell(r.name))},
  {key: 'wish', header: '希望', width: proportional(1), renderCell: r => cell(r.wish)},
  {key: 'last', header: '最終言及日', width: pixel(128), renderCell: r => dateCell(r.last)},
  {key: 'state', header: '状態', width: pixel(88), renderCell: r => <Badge label={r.state} variant={STATE_VARIANT[r.state]} />},
];

/** 反映済み・未反映・未確認の3つに、人を1人1マスで並べる（幅は人数に比例）。
 *  マスに触れると、下の表の同じ人の行に印が付く（表の行に触れたときはマスに印） */
function CareerSplit({segProps}: {segProps: ReturnType<typeof usePointedPerson>['segProps']}) {
  return (
    <div className="mg-split">
      {/* 0人の区分けは名前だけ出し、マスは置かない */}
      {SPLIT_GROUPS.map(g => (
        <div key={g.label} className="mg-split-group" style={{flex: g.members.length > 0 ? `${g.members.length} 1 0` : '0 0 auto', '--mg-seg-count': g.members.length} as CSSProperties}>
          <Text type="supporting" color="secondary">{g.label}</Text>
          <div className="mg-split-bar">
            {g.members.map(m => (
              <span key={m.name} className={`mg-split-seg mg-split-${m.kind}`} {...segProps(m.name)}>{m.name}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CareerCard() {
  const {segProps, tableProps, personCell} = usePointedPerson();
  const columns = careerColumns(personCell);
  return (
    <Card padding={SPACE.page} data-chat-topic="career">
      <div className="mg-card-split mg-card-wide">
        <div className="mg-summary">
          <VStack gap={SPACE.block}>
            <Heading level={3} weight="semibold" id="mg-career-title">キャリア希望の反映</Heading>
            <MetricFigure {...CAREER_METRIC} />
          </VStack>
          <AyaNote text={AYA.career} actions={[AYA_ASK.career]} askHref={chatHref('career')} />
        </div>
        <div className="mg-detail">
          <CareerSplit segProps={segProps} />
          <div className="mg-table mg-stack" style={tableLabels(columns)} {...tableProps}>
            <Table data={CAREER} columns={columns} density="compact" aria-labelledby="mg-career-title" />
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- メンバーの声 ---------- */

function TopicCard({title, topics, aya, topic}: {title: string; topics: typeof GOOD; aya: string; topic: ChatTopic}) {
  return (
    <Card padding={SPACE.page} data-chat-topic={topic}>
      <div className="mg-card-split">
        <div className="mg-summary">
          <Heading level={3} weight="semibold">{title}</Heading>
          <AyaNote text={aya} askHref={chatHref(topic)} />
        </div>
        <div className="mg-detail">
          <TopicRanking topics={topics} />
        </div>
      </div>
    </Card>
  );
}

const WORD_COLUMNS: TableColumn<Word>[] = [
  {key: 'date', header: '日付', width: pixel(128), renderCell: r => dateCell(r.date)},
  {key: 'name', header: '名前', width: pixel(112), renderCell: r => <Text weight="medium">{r.name}</Text>},
  {key: 'text', header: 'ひとこと', width: proportional(1), renderCell: r => cell(r.text)},
];

function WordsCard() {
  return (
    <Card padding={SPACE.page}>
      <VStack gap={SPACE.card}>
        <Heading level={3} weight="semibold" id="mg-words-title">今週のひとこと</Heading>
        <div className="mg-table mg-stack" style={tableLabels(WORD_COLUMNS)}>
          <Table data={WORDS} columns={WORD_COLUMNS} density="compact" aria-labelledby="mg-words-title" />
        </div>
      </VStack>
    </Card>
  );
}

/* ---------- ページの中身（縦に積んだ版） ---------- */

function TeamPage({hasAskBar}: {hasAskBar: boolean}) {
  return (
    <div className="mg-page">
      {/* 区画の間は 32（SPACE に 32 の名前が無いので段の番号 8 で書く） */}
      <VStack gap={8}>
        <PageHeader title={TEAM_NAME} period={WEEK} />

        <Section id="mg-sec-activity" title="直近の活動">
          <ActionCard />
          <SatisfactionCard />
        </Section>

        <Section id="mg-sec-goals" title="業績目標">
          <GoalsCard />
        </Section>

        <Section id="mg-sec-career" title="キャリアプラン・コンピテンシー">
          <CareerCard />
        </Section>

        <Section id="mg-sec-voices" title="メンバーの声">
          <TopicCard title="前向きな話題" topics={GOOD} aya={AYA.positive} topic="positive" />
          <TopicCard title="困りごとの話題" topics={TROUBLE} aya={AYA.trouble} topic="trouble" />
          <WordsCard />
        </Section>

        {hasAskBar ? (
          <Card padding={SPACE.block}>
            <AskBar />
          </Card>
        ) : null}
      </VStack>
    </div>
  );
}

/* ---------- アヤとのチャット（話題ごと） ---------- */

/** 話題ごとのやり取り。次回までのアクションは台紙のやり取り、ほかはアヤの一言（とその下のボタン）から始まる */
function chatMessages(topic: ChatTopic): AyaChatMessage[] {
  return topic === 'action' ? CHAT_ACTION : CHAT_TOPICS[topic];
}

function AyaChatPanel({topic}: {topic: ChatTopic}) {
  const messages = chatMessages(topic);
  // 開いたときは会話の頭（最初の吹き出し）から見せる（本人の回答「会話の頭から見せる」2026-11-16）。
  // 話題ごとに key で作り直すので、ほかの話題で送った位置は持ち越さない
  return (
    <div className="mg-chat">
      <div className="mg-chat-head">
        <Avatar src={ayaImage} alt="" size="sm" />
        <Text weight="semibold">アヤ</Text>
        <Badge label={CHAT_TOPIC_LABEL[topic]} variant="neutral" />
        <span className="mg-chat-head-end">
          <Button label="閉じる" variant="ghost" size="sm" icon={<XMarkIcon />} isIconOnly href="/ayatana-manager-stacked" />
        </span>
      </div>
      <div className="mg-chat-log">
        <ChatMessageList gap={SPACE.card} align="top">
          {messages.map(m => {
            if (m.from === 'manager') {
              return (
                <div key={m.id}>
                  <ChatMessage sender="user">
                    <ChatMessageBubble><span className="mg-phrase"><Phrase text={m.text} /></span></ChatMessageBubble>
                  </ChatMessage>
                </div>
              );
            }
            return (
              <div key={m.id}>
                {/* 本人「ayaのコメントが吹き出しやないし」: アヤの文はほかの画面と同じ吹き出し（AyaNote）で出す。チャットの中なので「アヤに聞く」は付けない */}
                <AyaNote text={m.text} actions={m.action ? [m.action] : []} hasAskAya={false}>
                  {m.quotes ? (
                    <div className="mg-chat-quotes">
                      <Text type="supporting" color="secondary" weight="semibold">もとの発言</Text>
                      {m.quotes.map(q => (
                        <div key={q.source} className="mg-chat-quote">
                          {/* 出典の名前と日付も行の途中で割らない（「鈴木／さん）」と折れないように） */}
                          <Text type="supporting" color="secondary" className="mg-phrase"><Phrase text={q.source} /></Text>
                          <Text textWrap="pretty" className="mg-phrase"><Phrase text={q.text} /></Text>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </AyaNote>
              </div>
            );
          })}
        </ChatMessageList>
      </div>
      <div className="mg-chat-foot">
        <AskBar />
      </div>
    </div>
  );
}

/* ---------- 画面 ---------- */

/** ホームの本文（縦に送る箱）を頭に戻す */
function scrollHomeToTop() {
  const box = document.querySelector<HTMLElement>('.mg-home-content');
  box?.closest<HTMLElement>('.astryx-layout-content')?.scrollTo({top: 0});
}

/** 上司ホーム 縦に積んだ版。道筋が /ayatana-manager-chat（/:topic）のとき、右にその話題のアヤとのチャットを開いた状態になる。
 *  ホームとチャットの道筋は同じこの部品を出すので、行き来しても本文は作り直されず、読んでいた位置のまま右にチャットが開く。 */
export function ManagerHomeStacked() {
  const {pathname} = useLocation();
  const params = useParams();
  const isChatOpen = pathname.startsWith('/ayatana-manager-chat');
  const topic = toChatTopic(params.topic);
  // チャットを開くと本文が狭くなり、押したカードが下へずれる。開いた話題のカードが画面の上半分に無ければ、そこまで送る
  useEffect(() => {
    if (!isChatOpen) return;
    const frame = requestAnimationFrame(() => {
      const card = document.querySelector<HTMLElement>(`[data-chat-topic="${topic}"]`);
      if (!card) return;
      const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      // ページの最初のカードなら、ページの題から見せる（台紙 fun も一番上から出ている。節の見出しで止めると題が隠れる）
      if (document.querySelector('[data-chat-topic]') === card) {
        card.closest<HTMLElement>('.astryx-layout-content')?.scrollTo({top: 0, behavior});
        return;
      }
      // 節の最初のカードなら、節の見出しから見せる（カードの頭で止めると、見出しが上端で半分切れる）
      const section = card.closest<HTMLElement>('section');
      const target = section?.querySelector('[data-chat-topic]') === card ? section : card;
      const top = target.getBoundingClientRect().top;
      if (top >= 0 && top <= window.innerHeight / 2) return;
      target.scrollIntoView({block: 'start', behavior});
    });
    return () => cancelAnimationFrame(frame);
  }, [isChatOpen, topic]);
  // 左メニューのロゴと「ホーム」はホームの頭に戻る。チャットの「閉じる」は読んでいた位置のまま（同じ部品なので、何もしないと位置が持ち越される）
  const toTopRef = useRef(false);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('nav a[href="/ayatana-manager-stacked"]');
      if (!link) return;
      if (window.location.pathname === '/ayatana-manager-stacked') scrollHomeToTop();
      else toTopRef.current = true;
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  useEffect(() => {
    if (isChatOpen || !toTopRef.current) return;
    toTopRef.current = false;
    scrollHomeToTop();
  }, [isChatOpen]);
  return (
    <AppShell
      contentPadding={0}
      sideNav={<AyatanaSideNav initialTab={isChatOpen ? 'chat' : 'home'} selected={isChatOpen ? `chat-${topic}` : 'home'} />}
    >
      <Layout
        height="fill"
        content={
          <LayoutContent padding={SPACE.none} className={isChatOpen ? 'mg-home-content mg-chat-page' : 'mg-home-content'}>
            <TeamPage hasAskBar={!isChatOpen} />
          </LayoutContent>
        }
        end={
          isChatOpen ? (
            <LayoutPanel width={360} hasDivider padding={SPACE.none} role="complementary" label="アヤ" className="mg-chat-panel">
              {/* 話題が変わったら作り直す（最後の発言まで送り直す） */}
              <AyaChatPanel key={topic} topic={topic} />
            </LayoutPanel>
          ) : undefined
        }
      />
    </AppShell>
  );
}
