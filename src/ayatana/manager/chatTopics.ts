// アヤとのチャットの話題。左メニューのチャットタブの行と、各カード・フィードの「アヤに聞く」が同じ行き先を使う。
// 名前は画面の見出し（カードの見出し・フィードの出どころ）と同じ言葉。

export type ChatTopic = 'action' | 'trouble' | 'goals' | 'career' | 'satisfaction' | 'positive';

export const CHAT_TOPIC_LABEL: Record<ChatTopic, string> = {
  action: '次回までのアクション',
  trouble: '困りごとの話題',
  goals: '見直し済みの目標',
  career: 'キャリア希望の反映',
  satisfaction: '仕事の満足度',
  positive: '前向きな話題',
};

/** チャットを開いた状態の行き先。次回までのアクションは前からの /ayatana-manager-chat のまま */
export function chatHref(topic: ChatTopic) {
  return topic === 'action' ? '/ayatana-manager-chat' : `/ayatana-manager-chat/${topic}`;
}

const TOPIC_BY_LABEL = Object.fromEntries(Object.entries(CHAT_TOPIC_LABEL).map(([k, v]) => [v, k])) as Record<string, ChatTopic>;

/** 見出しの言葉から話題を引く（フィードの出どころ・カードの見出し）。当たらなければ undefined */
export function topicOfLabel(label: string): ChatTopic | undefined {
  return TOPIC_BY_LABEL[label];
}

/** 道筋の :topic を話題にする。無い・知らない値は次回までのアクション */
export function toChatTopic(value: string | undefined): ChatTopic {
  return value && value in CHAT_TOPIC_LABEL ? (value as ChatTopic) : 'action';
}
