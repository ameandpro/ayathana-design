import {AppShell} from '@astryxdesign/core/AppShell';
import {Layout, LayoutContent, VStack, HStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {SPACE} from '../../space';
import {
  MEMBER,
  MEMBER_ACTION_METRIC,
  MEMBER_ACTIONS,
  MEMBER_CAREER,
  MEMBER_GOAL_METRIC,
  MEMBER_GOALS,
  MEMBER_HEARING,
  MEMBER_SATISFACTION,
  MEMBER_VOICES,
  WEEK,
  TALK_DATES,
  type ActionRow,
  type MemberCareerRow,
  type MemberGoalRow,
  type VoiceRow,
} from './managerData';
import {AyatanaSideNav} from '../AyatanaSideNav';
import {AskBar, AyaNote, MetricFigure, PageHeader, Phrase, ScoreGrid, Section} from './ManagerParts';
import {tableLabels} from './tableLabels';
import './manager.css';

// 状態は文字を赤くせずタグで出す（本人「文字を赤で表現するのはやめよう、タグとかで表現するんだよ」）
// 表のセルの文は文節の切れ目で折り返す（「伝え／る」のような1文字だけの行を作らない）
// 日付・割合・金額が行の途中で割れないよう、文は Phrase を通す（Fable 7回目 S2）
const cell = (text: string) => <Text className="mg-phrase"><Phrase text={text} /></Text>;
const subCell = (text: string) => <Text color="secondary">{text}</Text>;
// 進捗: 完了は緑、期限を過ぎて終わっていないものは赤、期限前のものは灰色
// 台紙 tug・can のとおり、未完了は期限の前後にかかわらず同じ赤のタグ（灰色と赤が混ざると違いの説明が要る）
const progressVariant = (r: ActionRow) => (r.progress === '完了' ? 'green' : 'error');

/* ---------- 直近の活動 ---------- */

const ACTION_COLUMNS: TableColumn<ActionRow>[] = [
  {key: 'action', header: '行動', width: proportional(1), renderCell: r => cell(r.action)},
  {key: 'due', header: '期限', width: pixel(88), renderCell: r => subCell(r.due)},
  {key: 'meeting', header: '面談', width: pixel(128), renderCell: r => subCell(r.meeting)},
  {key: 'progress', header: '進捗', width: pixel(80), renderCell: r => <Badge label={r.progress} variant={progressVariant(r)} />},
];

function ActionCard() {
  return (
    <Card padding={SPACE.page}>
      <div className="mg-card-split mg-tight">
        <div className="mg-summary mg-tight">
          <Heading level={3} weight="semibold" id="mg-y-action-title">次回までのアクション</Heading>
          <MetricFigure {...MEMBER_ACTION_METRIC} size="medium" />
        </div>
        <div className="mg-detail">
          <div className="mg-table mg-stack" style={tableLabels(ACTION_COLUMNS)}>
            <Table data={MEMBER_ACTIONS} columns={ACTION_COLUMNS} density="compact" aria-labelledby="mg-y-action-title" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function SatisfactionCard() {
  return (
    <Card padding={SPACE.page}>
      <div className="mg-card-split mg-tight">
        <div className="mg-summary mg-tight">
          <Heading level={3} weight="semibold" id="mg-y-satisfaction-title">仕事の満足度</Heading>
          <MetricFigure {...MEMBER_SATISFACTION} size="medium" />
        </div>
        <div className="mg-detail">
          <ScoreGrid
            labelledBy="mg-y-satisfaction-title"
            dates={TALK_DATES}
            rows={[{name: MEMBER.name, scores: MEMBER.scores, low: MEMBER.low}]}
            hasNames={false}
            isFlat
          />
          <VStack gap={SPACE.inline}>
            <Heading level={4} id="mg-y-hearing-title">本人聞き取り</Heading>
            <ul className="mg-hearing" role="list" aria-labelledby="mg-y-hearing-title">
              {MEMBER_HEARING.map(h => (
                <li key={h.id} className="mg-hearing-row">
                  {/* 出典は「日付・面談の種類」の区切りで折り返し、語の途中では割らない */}
                  <Text type="supporting" color="secondary">
                    {h.source.split('・').map((part, i, all) => (
                      <span key={i} className="mg-keep">{i < all.length - 1 ? `${part}・` : part}</span>
                    ))}
                  </Text>
                  <Text type="supporting" color="primary" weight="semibold" hasTabularNumbers>{h.score}</Text>
                  <Text>{h.text}</Text>
                </li>
              ))}
            </ul>
          </VStack>
        </div>
      </div>
    </Card>
  );
}

/* ---------- 業績目標 ---------- */

const GOAL_COLUMNS: TableColumn<MemberGoalRow>[] = [
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
  {key: 'updated', header: '最終更新', width: pixel(128), renderCell: r => subCell(r.updated)},
];


function GoalsCard() {
  return (
    <Card padding={SPACE.page}>
      <div className="mg-card-split mg-card-wide mg-tight">
        <div className="mg-summary mg-tight">
          <Heading level={3} weight="semibold" id="mg-y-goals-title">見直し済みの目標</Heading>
          <MetricFigure {...MEMBER_GOAL_METRIC} size="medium" />
        </div>
        <div className="mg-detail">
          <div className="mg-table mg-stack" style={tableLabels(GOAL_COLUMNS)}>
            <Table
              data={MEMBER_GOALS}
              columns={GOAL_COLUMNS}
              density="compact"
              aria-labelledby="mg-y-goals-title"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- キャリアプラン・コンピテンシー ---------- */

const CAREER_COLUMNS: TableColumn<MemberCareerRow>[] = [
  {key: 'item', header: '項目', width: pixel(136), renderCell: r => <Text weight="semibold">{r.item}</Text>},
  {key: 'date', header: '日付', width: pixel(128), renderCell: r => subCell(r.date)},
  {key: 'source', header: '出典', width: pixel(200), renderCell: r => subCell(r.source)},
  {key: 'text', header: '内容', width: proportional(1), renderCell: r => cell(r.text)},
];

function CareerCard() {
  return (
    <Card padding={SPACE.page}>
      <VStack gap={SPACE.card}>
        <HStack gap={SPACE.inline} vAlign="center">
          <Heading level={3} weight="semibold" id="mg-y-career-title">キャリア希望の反映</Heading>
          <Badge label={MEMBER.careerState} variant={MEMBER.careerState === '反映済み' ? 'green' : 'neutral'} />
        </HStack>
        <div className="mg-table mg-stack" style={tableLabels(CAREER_COLUMNS)}>
          <Table data={MEMBER_CAREER} columns={CAREER_COLUMNS} density="compact" verticalAlign="top" aria-labelledby="mg-y-career-title" />
        </div>
        <AyaNote text={MEMBER.careerAya} actions={[MEMBER.careerAsk]} />
      </VStack>
    </Card>
  );
}

/* ---------- メンバーの声 ---------- */

const VOICE_COLUMNS: TableColumn<VoiceRow>[] = [
  {key: 'date', header: '日付', width: pixel(128), renderCell: r => subCell(r.date)},
  {key: 'source', header: '出典', width: pixel(200), renderCell: r => subCell(r.source)},
  {key: 'text', header: 'ひとこと', width: proportional(1), renderCell: r => cell(r.text)},
];

function VoicesCard() {
  return (
    <Card padding={SPACE.page}>
      <VStack gap={SPACE.card}>
        <Heading level={3} weight="semibold" id="mg-y-voices-title">会話と電話</Heading>
        <div className="mg-table mg-stack" style={tableLabels(VOICE_COLUMNS)}>
          <Table data={MEMBER_VOICES} columns={VOICE_COLUMNS} density="compact" aria-labelledby="mg-y-voices-title" />
        </div>
      </VStack>
    </Card>
  );
}

/* ---------- 画面 ---------- */

/** 個人画面（Wonder の台紙 tug）。データは名古屋支店の山田 拓也さん */
export function MemberYamada() {
  return (
    <AppShell contentPadding={0} sideNav={
        // サイドバーのどの項目もこのページそのものではないので aria-current="page" は付けない
        // （ガイド navbar「Use aria-current="page" to identify the current page」）。
        // 台紙 tug ではホームに印があるので、このページを含む区画として見た目の印だけ付ける
        <AyatanaSideNav initialTab="home" selected={null} section="home" />
      }>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={SPACE.none}>
            <div className="mg-page">
              {/* 区画の間は 32（SPACE に 32 の名前が無いので段の番号 8 で書く） */}
              <VStack gap={8}>
                <PageHeader title={MEMBER.name} sub={MEMBER.meta} period={WEEK} />

                <AyaNote
                  text={MEMBER.status}
                  actions={MEMBER.actions}
                  size="large"
                />

                <Section id="mg-y-sec-activity" title="直近の活動">
                  <ActionCard />
                  <SatisfactionCard />
                </Section>

                <Section id="mg-y-sec-goals" title="業績目標">
                  <GoalsCard />
                </Section>

                <Section id="mg-y-sec-career" title="キャリアプラン・コンピテンシー">
                  <CareerCard />
                </Section>

                <Section id="mg-y-sec-voices" title="メンバーの声">
                  <VoicesCard />
                </Section>

                <Card padding={SPACE.block}>
                  <AskBar />
                </Card>
              </VStack>
            </div>
          </LayoutContent>
        }
      />
    </AppShell>
  );
}
