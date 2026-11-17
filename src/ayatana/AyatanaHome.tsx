import {useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {AyatanaSideNav} from './AyatanaSideNav';
import {HStack, Layout, LayoutContent, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Grid} from '@astryxdesign/core/Grid';
import {Avatar} from '@astryxdesign/core/Avatar';
import {List, ListItem} from '@astryxdesign/core/List';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {SPACE} from '../space';
import {AYA, CAREER, COMPETENCY, HOME, PERIOD} from './manager/managerData';
import {GluedText} from './manager/ManagerParts';
import './AyatanaHome.css';

// int（Wonder の Home）の項目と文言をそのまま、Astryx の部品だけで組む。
// 値は AME のテストデータ（名古屋支店。~/Downloads/AME_分析プロジェクト_テストデータ/）。

// 電話の回数と会話時間は半年分の合計。問題点は、面談で決めて期限を過ぎても終わっていないアクション
const METRICS = HOME.metrics;
// タイルを選ぶと、その値の人ごとの内訳を下の一覧に出す（値の大きい順）
const METRIC_ROWS: Record<string, {name: string; value: string; text: string}[]> = {
  電話: HOME.calls,
  会話時間: HOME.talkTime,
  問題点: HOME.overdue,
};
// 業績目標のタブの人数は、実績の更新が止まっている目標（停滞）がある人。キャリアプランは、希望がまだ反映されていない人。
// コンピテンシーは6人全員の強みと課題を並べるので、人数は出さない
const CAREER_OPEN = CAREER.filter(c => c.state !== '反映済み').length;
const GOALS = [
  {id: 'perf', label: '業績目標', count: `${HOME.stalled.length}人`},
  {id: 'career', label: 'キャリアプラン', count: `${CAREER_OPEN}人`},
  {id: 'comp', label: 'コンピテンシー', count: ''},
];
// キャリアプランのタブの中身。台紙 ito の表と同じ札の色
const CAREER_GROUPS = [
  {state: '未反映', variant: 'error'},
  {state: '未確認', variant: 'neutral'},
  {state: '反映済み', variant: 'green'},
] as const;

const initial = (name: string) => name.slice(0, 1);

export function AyatanaHome() {
  const [metric, setMetric] = useState('電話');
  const [goal, setGoal] = useState('perf');
  return (
    <AppShell
      contentPadding={0}
      sideNav={<AyatanaSideNav initialTab="home" selected="home" />}>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={SPACE.none}>
            <VStack padding={SPACE.page} gap={SPACE.page}>
              <Heading level={1}>ホーム</Heading>

              <HStack gap={SPACE.card} vAlign="start" className="ah-top">
                <StackItem size="fill">
                  <Card padding={SPACE.page}>
                    <VStack gap={SPACE.block}>
                      <Heading level={3} weight="semibold" accessibilityLevel={2}>アヤの活動</Heading>
                      {/* 3つの札は、1枚の幅が 160px を下回る幅（375px の画面）では縦に1列で並べる。3列のままだと「20時間26分」が2行に折れ、札ごとに数字の高さがずれていた（Fable 10回目 V8） */}
                      <Grid columns={{minWidth: 160, max: 3}} gap={SPACE.block}>
                        {METRICS.map(m => (
                          <SelectableCard key={m.label} className="ah-metric" label={m.label} isSelected={metric === m.label} onChange={() => setMetric(m.label)} padding={SPACE.block}>
                            <VStack gap={SPACE.tight}>
                              <Text type="supporting" color="secondary">{m.label}</Text>
                              <Text type="large" weight="semibold">{m.value}</Text>
                            </VStack>
                          </SelectableCard>
                        ))}
                      </Grid>
                      <List hasDividers edge="flush">
                        {METRIC_ROWS[metric].map(r => (
                          <ListItem
                            key={r.name}
                            startContent={<Avatar name={initial(r.name)} />}
                            label={r.name}
                            description={r.text}
                            endContent={<Text type="supporting" color="secondary">{r.value}</Text>}
                          />
                        ))}
                      </List>
                    </VStack>
                  </Card>
                </StackItem>
                <StackItem size="static">
                  <Card padding={SPACE.page} className="ah-side">
                    <VStack gap={SPACE.block}>
                      <Heading level={3} weight="semibold" accessibilityLevel={2}>チーム概要</Heading>
                      <VStack gap={SPACE.tight}>
                        <Heading level={4} accessibilityLevel={3}>直近の課題</Heading>
                        <Text color="secondary"><GluedText text={HOME.issue} /></Text>
                      </VStack>
                      <VStack gap={SPACE.tight}>
                        <Heading level={4} accessibilityLevel={3}>目標到達への課題</Heading>
                        <Text color="secondary"><GluedText text={AYA.goals} /></Text>
                      </VStack>
                    </VStack>
                  </Card>
                </StackItem>
              </HStack>

              <Card padding={SPACE.page}>
                <VStack gap={SPACE.block}>
                  <HStack gap={SPACE.inline} vAlign="center">
                    <Heading level={3} weight="semibold" accessibilityLevel={2}>メンバー概要</Heading>
                    <Text type="supporting" color="secondary">{PERIOD}</Text>
                  </HStack>
                  <TabList value={goal} onChange={setGoal} hasDivider>
                    {GOALS.map(g => (
                      <Tab key={g.id} value={g.id} label={g.label} endContent={g.count ? <Text type="supporting" color="secondary">{g.count}</Text> : undefined} />
                    ))}
                  </TabList>
                  {/* タブで下の中身を切り替える。中身の見出しはタブと同じなので出さない（同じ情報を2回出さない） */}
                  {goal === 'perf' ? (
                    <VStack gap={SPACE.block}>
                      <HStack gap={SPACE.inline} vAlign="center">
                        <Badge label="停滞" variant="error" />
                        <Text type="supporting" color="secondary">{HOME.stalled.length}人</Text>
                      </HStack>
                      <List hasDividers edge="flush">
                        {HOME.stalled.map(m => (
                          <ListItem
                            key={m.name}
                            className="ah-stalled-item"
                            startContent={<Avatar name={initial(m.name)} />}
                            label={m.name}
                            description={<><GluedText text={m.text} /><br />最終更新 {m.updated}</>}
                            endContent={<Button label="1on1を入れる" variant="secondary" size="sm" />}
                          />
                        ))}
                      </List>
                    </VStack>
                  ) : goal === 'comp' ? (
                    <List hasDividers edge="flush">
                      {COMPETENCY.map(c => (
                        <ListItem
                          key={c.name}
                          align="start"
                          startContent={<Avatar name={initial(c.name)} />}
                          label={c.name}
                          description={
                            <MetadataList label={{position: 'start', width: 'var(--ah-comp-label-w)'}} className="ah-comp-meta">
                              <MetadataListItem label="強み">{c.strength}</MetadataListItem>
                              <MetadataListItem label="課題">{c.issue}</MetadataListItem>
                            </MetadataList>
                          }
                        />
                      ))}
                    </List>
                  ) : (
                    <VStack gap={SPACE.block}>
                      {CAREER_GROUPS.map(g => {
                        const rows = CAREER.filter(c => c.state === g.state);
                        return (
                          <VStack key={g.state} gap={SPACE.block}>
                            <HStack gap={SPACE.inline} vAlign="center">
                              <Badge label={g.state} variant={g.variant} />
                              <Text type="supporting" color="secondary">{rows.length}人</Text>
                            </HStack>
                            <List hasDividers edge="flush">
                              {rows.map(c => (
                                // 希望は文の途中で切らずに全文を折り返す（文字列で渡すと Astryx が1行で「…」に省略する。Fable 10回目 V2）
                                <ListItem key={c.id} startContent={<Avatar name={initial(c.name)} />} label={c.name} description={<>{c.wish}</>} />
                              ))}
                            </List>
                          </VStack>
                        );
                      })}
                    </VStack>
                  )}
                </VStack>
              </Card>
            </VStack>
          </LayoutContent>
        }
      />
    </AppShell>
  );
}
