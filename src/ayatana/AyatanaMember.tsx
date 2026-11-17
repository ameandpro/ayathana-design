import {useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {AyatanaSideNav} from './AyatanaSideNav';
import {HStack, Layout, LayoutContent, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {ChevronRightIcon} from '@heroicons/react/24/outline';
import {SPACE} from '../space';
import './manager/manager.css';
import './AyatanaMember.css';
import {tableLabels} from './manager/tableLabels';
import {GluedText} from './manager/ManagerParts';
import {MEMBER, MEMBER_ACTIONS, MEMBER_GOALS, MEMBER_TALKS, PERIOD, type ActionRow, type TalkRow} from './manager/managerData';

// can（Wonder の A メンバー詳細）の項目・文言・並びをそのまま、Astryx の部品だけで組む。

type TaskRow = {id: string; action: string; owner: string; due: string; talk: string; progress: string; variant: 'green' | 'error' | 'neutral'};
// 値は名古屋支店の山田 拓也さんの、2026年4月〜9月の面談と電話（半年分の再現データ）。行動は面談で決めた次回までのアクション
const INTERVIEWER = MEMBER.interviewer;
// 台紙 tug・can のとおり、未完了は期限の前後にかかわらず同じ赤のタグ（灰色と赤が混ざると違いの説明が要る）
const progressVariant = (a: ActionRow) => (a.progress === '完了' ? 'green' : 'error');
const TASKS: TaskRow[] = MEMBER_ACTIONS.map(a => ({
  id: a.id,
  action: a.action,
  owner: MEMBER.name,
  due: a.due,
  talk: a.meeting,
  progress: a.progress,
  variant: progressVariant(a),
}));
const TASK_COLUMNS: TableColumn<TaskRow>[] = [
  {key: 'action', header: '行動', width: proportional(1), renderCell: r => <Text weight="semibold">{r.action}</Text>},
  {key: 'owner', header: '担当者', width: pixel(112)},
  {key: 'due', header: '期限', width: pixel(96)},
  {key: 'talk', header: '面談', width: pixel(176), renderCell: r => <Text type="supporting" color="secondary">{r.talk}</Text>},
  {key: 'progress', header: '進捗', width: pixel(88), align: 'end', renderCell: r => <Badge label={r.progress} variant={r.variant} />},
];

const GROWTH = ['キャリアシート', '学習とスキル', '経歴'];

// 山田 拓也さんの面談（新しい順。2026年4月以降は半年分の再現データ、それより前は文字起こしから）
const TALKS: TalkRow[] = MEMBER_TALKS;
const TALK_COLUMNS: TableColumn<TalkRow>[] = [
  {key: 'when', header: '日付', width: pixel(176), renderCell: r => <Text type="supporting" color="secondary">{r.when}</Text>},
  {key: 'host', header: '担当者', width: pixel(112)},
  {key: 'summary', header: '要約', width: proportional(1), renderCell: r => <GluedText text={r.summary} />},
  {key: 'open', header: '', width: pixel(48), align: 'end', renderCell: () => <Icon icon={ChevronRightIcon} size="sm" color="secondary" />},
];

export function AyatanaMember() {
  const [taskFilter, setTaskFilter] = useState('open');
  return (
    <AppShell
      contentPadding={0}
      sideNav={<AyatanaSideNav initialTab="home" selected={null} section="home" />}>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={SPACE.none}>
            <VStack padding={SPACE.page} gap={SPACE.page}>
              <VStack gap={SPACE.tight}>
                <Heading level={1}>{MEMBER.name}</Heading>
                {/* 差し替え前は「期間 ・ 担当者 名前」。期間はデータの基準日、担当者は面談者 */}
                <Text type="supporting" color="secondary">{PERIOD} ・ 担当者 {INTERVIEWER}</Text>
              </VStack>

              <VStack gap={SPACE.card}>
                <Card padding={SPACE.page}>
                  <VStack gap={SPACE.block}>
                    <HStack gap={SPACE.card} vAlign="center">
                      <StackItem size="fill">
                        <Heading level={3} weight="semibold" accessibilityLevel={2}>直近の課題</Heading>
                      </StackItem>
                      <SegmentedControl label="直近の課題の進捗" value={taskFilter} onChange={setTaskFilter} size="sm">
                        <SegmentedControlItem value="open" label="未完了" />
                        <SegmentedControlItem value="done" label="完了" />
                      </SegmentedControl>
                    </HStack>
                    {/* 台紙 can のとおり、切り替えで選んだ進捗の行だけを出す（未完了を選ぶと完了の行は出ない） */}
                    {/* 表の幅が 480px 未満では、山田 拓也さんの画面と同じ「見出し: 値」の形に積む（manager.css の .mg-stack。Fable 10回目 V1） */}
                    <div className="am-table mg-stack" style={tableLabels(TASK_COLUMNS)}><Table<TaskRow> data={TASKS.filter(t => (taskFilter === 'done') === (t.progress === '完了'))} columns={TASK_COLUMNS} idKey="id" density="balanced" verticalAlign="middle" /></div>
                  </VStack>
                </Card>

                <Card padding={SPACE.page}>
                  <VStack gap={SPACE.block}>
                    <HStack gap={SPACE.inline} vAlign="center">
                      <Heading level={3} weight="semibold" accessibilityLevel={2}>業績目標</Heading>
                      <Text type="supporting" color="secondary">{PERIOD}</Text>
                    </HStack>
                    <VStack gap={SPACE.none}>
                      {MEMBER_GOALS.map(g => (
                        <VStack key={g.id} gap={SPACE.none}>
                          <Divider />
                          <HStack className="am-goal-row" gap={SPACE.card} vAlign="start" paddingBlock={SPACE.card}>
                            <StackItem size="fill">
                              <VStack gap={SPACE.inline}>
                                <HStack gap={SPACE.inline} vAlign="center" wrap="wrap">
                                  <Text>{g.goal}</Text>
                                  {g.isStalled ? <Badge label="停滞" variant="error" /> : null}
                                </HStack>
                                <MetadataList label={{position: 'start'}} className="am-goal-meta">
                                  <MetadataListItem label="実績"><GluedText text={g.result} /></MetadataListItem>
                                  <MetadataListItem label="取り組み"><GluedText text={g.effort} /></MetadataListItem>
                                </MetadataList>
                                <Text type="supporting" color="secondary">最終更新 {g.updated}</Text>
                              </VStack>
                            </StackItem>
                            {g.review ? (
                              <StackItem size="static">
                                <Badge label={g.review} variant="neutral" />
                              </StackItem>
                            ) : null}
                          </HStack>
                        </VStack>
                      ))}
                    </VStack>
                  </VStack>
                </Card>

                <Card padding={SPACE.page}>
                  <VStack gap={SPACE.block}>
                    <HStack gap={SPACE.inline} vAlign="center">
                      <Heading level={3} weight="semibold" accessibilityLevel={2}>成長の課題</Heading>
                      <Text type="supporting" color="secondary">コンピテンシー／スキル／経験</Text>
                    </HStack>
                    <HStack gap={SPACE.page} vAlign="center" wrap="wrap">
                      {GROWTH.map(label => (
                        <Link key={label} href="#" hasUnderline={false}>
                          <HStack gap={SPACE.tight} vAlign="center">
                            <span className="mg-keep">{label}</span>
                            <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                          </HStack>
                        </Link>
                      ))}
                    </HStack>
                  </VStack>
                </Card>

                <Card padding={SPACE.page}>
                  <VStack gap={SPACE.block}>
                    <HStack gap={SPACE.card} vAlign="center">
                      <StackItem size="fill">
                        <Heading level={3} weight="semibold" accessibilityLevel={2}>面談履歴</Heading>
                      </StackItem>
                      <Link href="#">傾向分析を見る</Link>
                    </HStack>
                    <div className="am-table am-talks mg-stack" style={tableLabels(TALK_COLUMNS)}><Table<TalkRow> data={TALKS} columns={TALK_COLUMNS} idKey="id" density="balanced" verticalAlign="top" hasHover /></div>
                  </VStack>
                </Card>
              </VStack>
            </VStack>
          </LayoutContent>
        }
      />
    </AppShell>
  );
}
