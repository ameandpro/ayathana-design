import {AppShell} from '@astryxdesign/core/AppShell';
import {Layout, LayoutContent, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {SPACE} from '../../space';
import {FEED} from './managerData';
import {AyaNote} from './ManagerParts';
import {chatHref, topicOfLabel} from './chatTopics';
import {AyatanaSideNav} from '../AyatanaSideNav';
import './manager.css';

/** フィード（Wonder の台紙 net）: アヤの一言を日付ごとに新しい順で並べる */
export function ManagerFeed() {
  return (
    <AppShell contentPadding={0} sideNav={<AyatanaSideNav initialTab="home" selected="feed" />}>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={SPACE.none}>
            <div className="mg-page mg-feed-page">
              {/* 区画の間は 32（SPACE に 32 の名前が無いので段の番号 8 で書く） */}
              <VStack gap={8}>
                <Heading level={1}>フィード</Heading>
                <div className="mg-feed">
                  <VStack gap={8}>
                    {FEED.map((day, i) => (
                      <section key={day.date} aria-labelledby={`mg-feed-day-${i}`}>
                        <VStack gap={SPACE.block}>
                          {/* 見た目は小さな灰色の文字（台紙の Date Heading）。h1 の次なのでタグは h2 にする
                              （Heading level={5} だと h5 のタグに aria-level が付くだけで、見出しの段が飛ぶ） */}
                          <Text as="h2" type="supporting" color="secondary" weight="medium" id={`mg-feed-day-${i}`}>
                            {day.date}
                          </Text>
                          <ul className="mg-feed-list" role="list">
                            {day.items.map(item => {
                              const topic = topicOfLabel(item.source);
                              return (
                                <li key={item.id}>
                                  {/* 「アヤに聞く」は出どころの話題のチャットを開く */}
                                  <AyaNote text={item.text} source={item.source} actions={item.action ? [item.action] : []} askHref={topic ? chatHref(topic) : undefined} />
                                </li>
                              );
                            })}
                          </ul>
                        </VStack>
                      </section>
                    ))}
                  </VStack>
                </div>
              </VStack>
            </div>
          </LayoutContent>
        }
      />
    </AppShell>
  );
}
