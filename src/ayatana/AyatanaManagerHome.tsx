import {useState} from 'react';
import type {CSSProperties} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {AyatanaSideNav} from './AyatanaSideNav';
import {HStack, Layout, LayoutContent, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {List, ListItem} from '@astryxdesign/core/List';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {SPACE} from '../space';
import './AyatanaManagerHome.css';
// 値は AME のテストデータ（名古屋支店）。縦に積んだ版と同じ managerData から取る
import {
  ACTION_DONE,
  ACTION_METRIC,
  ACTION_OPEN,
  ACTION_OPEN_LABEL,
  AYA,
  AYA_ASK,
  CAREER,
  CAREER_METRIC,
  COMPARE,
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
  type GoalRow,
  type Metric,
  type SplitKind,
  type Topic,
  type Word,
} from './manager/managerData';
import {AyaNote, Phrase, ScoreGrid, TrendChart, usePointedPerson} from './manager/ManagerParts';
import {tableLabels} from './manager/tableLabels';
import {chatHref, topicOfLabel} from './manager/chatTopics';

// Wonder「上司ホーム ワイヤー」の bug（楽しい版）の項目・数字をそのまま、Astryx の部品で組む。
// 本人「UI は、そういう変に説明的なのとかはやめてね」: 区画の問い・基準の文・説明の行は外し、名詞の見出しと数字だけにした。

/* ---------- 共通の部品 ---------- */

type MetricHeadProps = Metric & {
  title: string;
  /** 見出しの id（点の表の名前に使う） */
  id?: string;
};

/** 指標の頭: 見出し・大きな数字・増減・比べる値
 *  （GREAT の札と基準は CRISP METRICS から写した物で、本人の依頼にも会議にも無いので外した。本人「全部外して」） */
function MetricHead({title, id, value, unit, delta, isDown, base}: MetricHeadProps) {
  return (
    <VStack gap={SPACE.block}>
      <Heading level={3} weight="semibold" id={id}>{title}</Heading>
      <HStack gap={SPACE.inline} vAlign="end" wrap="wrap">
        <Text type="display-2" weight="bold" hasTabularNumbers>{value}</Text>
        {unit ? <Text type="supporting" color="secondary">{unit}</Text> : null}
        {delta ? <Badge label={delta} variant={isDown ? 'error' : 'green'} /> : null}
        {base ? <Text type="supporting" color="secondary">{base}</Text> : null}
      </HStack>
    </VStack>
  );
}

/* ---------- 直近の活動 ---------- */


function ActionCard() {
  return (
    <Card padding={SPACE.page} height="100%">
      <VStack gap={SPACE.card}>
        <MetricHead title="次回までのアクション" {...ACTION_METRIC} />
        <div className="mh-action-rows">
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
        {/* 縦版と同じ推移の部品（触れると週の人数が出る）。高さは台紙 ito と同じ 128 */}
        <TrendChart now={TREND_NOW} prev={TREND_PREV} weeksNow={TREND_WEEKS_NOW} weeksPrev={TREND_WEEKS_PREV} />
        <AyaNote text={AYA.action} actions={[AYA_ASK.action]} askHref={chatHref('action')} />
      </VStack>
    </Card>
  );
}

function SatisfactionCard() {
  return (
    <Card padding={SPACE.page} height="100%">
      <VStack gap={SPACE.card}>
        <MetricHead title="仕事の満足度" id="mh-satisfaction-title" {...SATISFACTION} />
        <ScoreGrid labelledBy="mh-satisfaction-title" dates={TALK_DATES} rows={HEAT} />
        <AyaNote text={AYA.satisfaction} actions={[AYA_ASK.satisfaction]} askHref={chatHref('satisfaction')} />
      </VStack>
    </Card>
  );
}

/* ---------- 業績目標 ---------- */

const GOAL_COLUMNS: TableColumn<GoalRow>[] = [
  {key: 'name', header: '名前', width: pixel(104), renderCell: r => (r.isFirstOfPerson ? nameCell(r.name) : <span className="mh-person-cont" aria-hidden="true" />)},
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
  {key: 'updated', header: '最終更新', width: pixel(128), renderCell: r => dateCell(r.updated)},
];

function GoalsCard() {
  return (
    <Card padding={SPACE.page}>
      {/* 表の列が広く要るので、頭とアヤの文を上に、表をカードの幅いっぱいに置く（台紙 ito の見直し済みの目標） */}
      <VStack gap={SPACE.page}>
        <VStack gap={SPACE.card}>
          <MetricHead title="見直し済みの目標" {...GOAL_METRIC} />
          <AyaNote text={AYA.goals} actions={[AYA_ASK.goals]} askHref={chatHref('goals')} />
        </VStack>
        {/* 表の幅が 480px 未満では「見出し: 値」の形に積む（縦版と同じ manager.css の .mg-stack。Fable 9回目 U1） */}
        <div className="mh-table mh-goals mg-stack mg-stack-goals" style={tableLabels(GOAL_COLUMNS)}>
          <Table
            data={GOALS}
            columns={GOAL_COLUMNS}
            density="compact"
            verticalAlign="top"
          />
        </div>
      </VStack>
    </Card>
  );
}

/* ---------- キャリアプラン・コンピテンシー ---------- */

const SPLIT_CLASS: Record<SplitKind, string> = {
  done: 'mh-split-seg mh-split-done',
  alert: 'mh-split-seg mh-split-alert',
  open: 'mh-split-seg mh-split-open',
  unknown: 'mh-split-seg mh-split-unknown',
};

// 状態のタグの色は状態だけで決める（同じ「未反映」が赤と灰色に分かれると違いの説明が要る）
const STATE_VARIANT = {未反映: 'error', 未確認: 'neutral', 反映済み: 'green'} as const;

// 表のセルの文は文節の切れ目で折り返す（「伝え／る」のような1文字だけの行を作らない）
// 日付・割合・金額が行の途中で割れないよう、文は Phrase を通す（Fable 7回目 S2）
const cell = (text: string) => <Text className="mg-phrase"><Phrase text={text} /></Text>;
// 表の名前は台紙 ito と同じ中くらいの太さにし、姓と名の間で割らない（Fable 6回目 R2）
const nameCell = (text: string) => <Text weight="medium" className="mg-keep">{text}</Text>;
const dateCell = (text: string) => <Text color="secondary">{text}</Text>;
const careerColumns = (personCell: ReturnType<typeof usePointedPerson>['personCell']): TableColumn<CareerRow>[] => [
  {key: 'name', header: '名前', width: pixel(104), renderCell: r => personCell(r.name, nameCell(r.name))},
  // 中くらいの幅でも希望の文が1〜2文字ずつ折れないよう、最小の幅を決める（表の幅が 480px 未満では「見出し: 値」に積む）
  {key: 'wish', header: '希望', width: proportional(1, {minWidth: 200}), renderCell: r => cell(r.wish)},
  {key: 'last', header: '最終言及日', width: pixel(120), renderCell: r => dateCell(r.last)},
  {key: 'state', header: '状態', width: pixel(104), renderCell: r => <Badge label={r.state} variant={STATE_VARIANT[r.state]} />},
];

function CareerCard() {
  // 帯のマスと表の行の同じ人に印を付ける（縦版と同じ）
  const {segProps, tableProps, personCell} = usePointedPerson();
  const columns = careerColumns(personCell);
  return (
    <Card padding={SPACE.page}>
      {/* 本文が狭い幅では、頭とアヤの文を上に、内訳と表を下に積む（AyatanaManagerHome.css の .mh-career） */}
      <HStack gap={SPACE.page} vAlign="start" className="mh-career">
        <StackItem size="static">
          <VStack gap={SPACE.card} className="mh-career-head">
            <MetricHead title="キャリア希望の反映" {...CAREER_METRIC} />
            <AyaNote text={AYA.career} actions={[AYA_ASK.career]} askHref={chatHref('career')} />
          </VStack>
        </StackItem>
        <StackItem size="fill">
          <VStack gap={SPACE.card}>
            <div className="mh-split" role="img" aria-label="キャリア希望の反映の内訳">
              {/* 0人の区分けは名前だけ出し、マスは置かない */}
              {SPLIT_GROUPS.map(g => (
                <div key={g.label} className="mh-split-group" style={{flex: g.members.length > 0 ? `${g.members.length} 1 0` : '0 0 auto', '--mh-seg-count': g.members.length} as CSSProperties}>
                  <Text type="supporting" color="secondary">{g.label}</Text>
                  <div className="mh-split-bar">
                    {g.members.map(s => (
                      <span key={s.name} className={SPLIT_CLASS[s.kind]} {...segProps(s.name)}>{s.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mh-table mg-stack" style={tableLabels(columns)} {...tableProps}><Table data={CAREER} columns={columns} density="compact" /></div>
          </VStack>
        </StackItem>
      </HStack>
    </Card>
  );
}

/* ---------- メンバーの声 ---------- */


function TopicCard({title, topics, aya}: {title: string; topics: Topic[]; aya: string}) {
  // 「アヤに聞く」は見出しと同じ話題のチャットを開く
  const topic = topicOfLabel(title);
  return (
    <Card padding={SPACE.page} height="100%">
      <VStack gap={SPACE.card}>
        <VStack gap={SPACE.block}>
          <Heading level={3} weight="semibold">{title}</Heading>
          <List hasDividers edge="flush" density="compact">
            {topics.map((t, i) => (
              <ListItem
                key={t.label}
                startContent={<Text type="supporting" color="secondary" hasTabularNumbers>{i + 1}</Text>}
                label={t.label}
                endContent={
                  <HStack gap={SPACE.block} vAlign="center">
                    <Text hasTabularNumbers>{t.count}</Text>
                    {/* 4〜6月と比べた増減。大きく増えた困りごとだけ札にする */}
                    <span className="mh-topic-delta">
                      {t.isAlert ? <Badge label={t.delta} variant="error" /> : <Text type="supporting" color="secondary" hasTabularNumbers>{t.delta}</Text>}
                    </span>
                  </HStack>
                }
              />
            ))}
          </List>
        </VStack>
        <AyaNote text={aya} askHref={topic ? chatHref(topic) : undefined} />
      </VStack>
    </Card>
  );
}

const WORD_COLUMNS: TableColumn<Word>[] = [
  {key: 'date', header: '日付', width: pixel(128), renderCell: r => dateCell(r.date)},
  {key: 'name', header: '名前', width: pixel(112), renderCell: r => nameCell(r.name)},
  // ひとことの列が1〜2文字の幅に潰れないよう、最小の幅を決める（表の幅が 480px 未満では「見出し: 値」に積む）
  {key: 'text', header: 'ひとこと', width: proportional(1, {minWidth: 240})},
];

/* ---------- 画面 ---------- */

function SectionHead({title}: {title: string}) {
  return <Heading level={2}>{title}</Heading>;
}

export function AyatanaManagerHome() {
  const [ask, setAsk] = useState('');
  return (
    <AppShell contentPadding={0} sideNav={<AyatanaSideNav initialTab="home" selected="home" />}>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={SPACE.none}>
            <VStack padding={SPACE.page} gap={SPACE.page}>
              {/* 狭い幅では日付を見出しの下に回す（縦版の見出し ManagerParts と同じ） */}
              <HStack gap={SPACE.card} vAlign="center" hAlign="between" wrap="wrap">
                <Heading level={1}>{TEAM_NAME}</Heading>
                <HStack gap={SPACE.block} vAlign="center" wrap="wrap">
                  <Text color="secondary">{WEEK}</Text>
                  <Text color="secondary">比較対象: {COMPARE}</Text>
                </HStack>
              </HStack>

              <VStack gap={SPACE.block}>
                <SectionHead title="直近の活動" />
                {/* 2枚が1枚 360px 未満になる幅では1列に積む（375px でアクションの箱が幅150に潰れていた） */}
                <Grid columns={{minWidth: 360, max: 2}} gap={SPACE.card}>
                  <ActionCard />
                  <SatisfactionCard />
                </Grid>
              </VStack>

              <VStack gap={SPACE.block}>
                <SectionHead title="業績目標" />
                <GoalsCard />
              </VStack>

              <VStack gap={SPACE.block}>
                <SectionHead title="キャリアプラン・コンピテンシー" />
                <CareerCard />
              </VStack>

              <VStack gap={SPACE.block}>
                <SectionHead title="メンバーの声" />
                <VStack gap={SPACE.card}>
                <Grid columns={{minWidth: 360, max: 2}} gap={SPACE.card}>
                  <TopicCard title="前向きな話題" topics={GOOD} aya={AYA.positive} />
                  <TopicCard title="困りごとの話題" topics={TROUBLE} aya={AYA.trouble} />
                </Grid>
                <Card padding={SPACE.page}>
                  <VStack gap={SPACE.block}>
                    <Heading level={3} weight="semibold">今週のひとこと</Heading>
                    <div className="mh-table mg-stack" style={tableLabels(WORD_COLUMNS)}><Table data={WORDS} columns={WORD_COLUMNS} density="compact" /></div>
                  </VStack>
                </Card>
                </VStack>
              </VStack>

              <Card padding={SPACE.block}>
                <HStack gap={SPACE.inline} vAlign="center">
                  <StackItem size="fill">
                    <TextInput label="アヤに聞く" isLabelHidden placeholder="アヤに聞く" value={ask} onChange={v => setAsk(v)} />
                  </StackItem>
                  <Button label="送る" variant="primary" />
                </HStack>
              </Card>
            </VStack>
          </LayoutContent>
        }
      />
    </AppShell>
  );
}
