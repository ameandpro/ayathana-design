// 上司ホーム（横に並べた版・縦に積んだ版・チャットを開いた状態）・個人画面・フィード・ホーム・メンバー詳細の項目と数字。
// はじめは gen-data.py で書き出し、いまは手で直している（書き出し直すと手で直した所が消える）。元は AME のテストデータ（名古屋支店の在籍者6人）と、
// そのデータを元に6人それぞれを2026年4月〜9月の半年分再現したデータ（週1回の会話・電話の点と言葉、月1回の面談とアクション、業績目標、キャリア希望）。
// 名前はテストデータに無い（番号だけ）ので、番号ごとに仮の名前を1つ決め、全画面で同じ名前にした（文の中は名字＋さん、名前の欄は氏名）。

/** 基準日 */
export const PERIOD = '2026年9月30日時点';
/** 上司ホーム・個人画面の上の帯に出す週（台紙 ito・lib・fun・tug は「11月4日〜11月10日」の形。基準日 9月30日までの1週間） */
export const WEEK = '9月24日〜9月30日';
export const TEAM_NAME = '名古屋支店';
/** 数字を比べる相手 */
export const COMPARE = '先週';

export const MEMBERS = ['佐藤 健一', '鈴木 美咲', '田中 翔太', '伊藤 彩', '渡辺 大輔', '山田 拓也'];

/** 文の中で、名前の後ろと日付の途中で行を割らないための名前（退職した加藤さんも文に出る） */
export const NAMES_IN_TEXT = ['佐藤 健一', '鈴木 美咲', '田中 翔太', '伊藤 彩', '渡辺 大輔', '山田 拓也', '加藤 正樹', '中村 恵', '小林 修', '佐藤', '鈴木', '田中', '伊藤', '渡辺', '山田', '加藤', '中村', '小林'];

/** 指標の数字の行（大きな数字・単位・増減の札・比べる値） */
export type Metric = {value: string; unit?: string; delta?: string; isDown?: boolean; base?: string};

/* ---------- 次回までのアクション ---------- */

// 面談で決めたアクションを、期限を過ぎて終わっていないものが1件も無い人を完了にする。
// ホームの「問題点」と同じく全部の面談のアクションを数える（基準日では6人とも2件以上残っている）

export const ACTION_DONE: string[] = [];
export const ACTION_OPEN = ['佐藤 健一', '鈴木 美咲', '田中 翔太', '伊藤 彩', '渡辺 大輔', '山田 拓也'];
/** 約束の状態（ダッシュボード「面談で約束したことの進捗」の言い方） */
export const ACTION_OPEN_LABEL = '未完了';
// 「6人中0人」が完了か未完了か分かるよう、山田さんの画面の「5件中3件 完了」と同じく「完了」を添える（Fable a562 10）
export const ACTION_METRIC: Metric = {value: '6人中0人', unit: '完了', base: '先週 6人中0人'};
/** 完了した人数の推移（今期は7〜9月の直近10週、前期は4〜6月の同じ10週＝13週前。ほかの札の「前期」「4〜6月」と同じ区切り） */
export const TREND_NOW = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
export const TREND_PREV = [4, 2, 2, 2, 0, 0, 0, 0, 0, 0];
/** 推移の各週の初めの日（今期・前期） */
export const TREND_WEEKS_NOW = ['7/27', '8/3', '8/10', '8/17', '8/24', '8/31', '9/7', '9/14', '9/21', '9/28'];
export const TREND_WEEKS_PREV = ['4/27', '5/4', '5/11', '5/18', '5/25', '6/1', '6/8', '6/15', '6/22', '6/29'];

/* ---------- 仕事の満足度 ---------- */

/** 週の初めの日（直近8週） */
export const TALK_DATES = ['8/10', '8/17', '8/24', '8/31', '9/7', '9/14', '9/21', '9/28'];
/** low は点が下がった週（前の週より2点以上下がったか、4点以下。0 から数えた位置） */
export type HeatRow = {name: string; scores: number[]; low?: number[]};
export const HEAT: HeatRow[] = [
  {name: '佐藤 健一', scores: [6, 8, 5, 4, 6, 7, 5, 7], low: [2, 3, 6]},
  {name: '鈴木 美咲', scores: [3, 4, 5, 5, 6, 6, 7, 7], low: [0, 1]},
  {name: '田中 翔太', scores: [5, 6, 4, 6, 7, 8, 7, 7], low: [2]},
  {name: '伊藤 彩', scores: [6, 8, 7, 6, 5, 6, 7, 8], low: []},
  {name: '渡辺 大輔', scores: [6, 7, 6, 5, 6, 6, 7, 6], low: []},
  {name: '山田 拓也', scores: [5, 7, 7, 6, 7, 6, 5, 8], low: []},
];
export const SATISFACTION: Metric = {value: '7.2点', unit: '10点満点', delta: '↑0.9点', base: '先週 6.3点'};

/* ---------- 業績目標 ---------- */

export type GoalRow = Record<string, unknown> & {
  id: string;
  name: string;
  goal: string;
  result: string;
  updated: string;
  review?: string;
  isStalled?: boolean;
  isFirstOfPerson?: boolean;
};
export const GOALS: GoalRow[] = [
  {id: 'g11991', name: '佐藤 健一', goal: '上期の担当先の売上 9,000万円（前年同期比105%）', result: '9月30日時点 8,100万円（前年同期比101%）', updated: '9月25日', review: '9/16の面談で見直し', isFirstOfPerson: true},
  {id: 'g11992', name: '佐藤 健一', goal: '上期の設備更新の新規受注 3件', result: '9月30日時点 2件受注、見積もり中 1件', updated: '8月7日', review: '8/19の面談で見直し', isStalled: true},
  {id: 'g12891', name: '鈴木 美咲', goal: '上期の受注額 1億2000万円（担当10社の合計）', result: '9月30日時点 受注額 8400万円（目標比70%）', updated: '9月28日', review: '9/15の面談で見直し', isFirstOfPerson: true},
  {id: 'g12892', name: '鈴木 美咲', goal: '上期に新規のお客様を5社開拓する', result: '9月30日時点 新規開拓 1社（目標比20%）', updated: '7月15日', review: '7/15の面談で見直し', isStalled: true},
  {id: 'g14971', name: '田中 翔太', goal: '上期（4〜9月）の設備入れ替えの受注 4件', result: '9月30日時点で2件（2件目は6月に受注）', updated: '6月22日', review: '8/14の面談で見直し', isStalled: true, isFirstOfPerson: true},
  {id: 'g14972', name: '田中 翔太', goal: '上期の担当先への訪問 半期72社（月平均12社）', result: '9月30日時点で51社（目標の71%）', updated: '9月21日', review: '6/15の面談で見直し'},
  {id: 'g16811', name: '伊藤 彩', goal: '引き継いだ担当先から、設備の追加受注を上期（4月〜9月）で5件取る', result: '9月30日時点で3件（達成率60%）', updated: '9月25日', review: '9/16の面談で見直し', isFirstOfPerson: true},
  {id: 'g16812', name: '伊藤 彩', goal: '上期中に、新規のお客様を3社開拓する', result: '9月30日時点で2社（達成率67%）', updated: '7月10日', review: '7/15の面談で見直し', isStalled: true},
  {id: 'g17671', name: '渡辺 大輔', goal: '自分で開拓した担当先で、上期（4〜9月）に見積もりを5件通す', result: '見積もりが3件通った（9月28日時点）', updated: '9月25日', review: '9/16の面談で見直し', isFirstOfPerson: true},
  {id: 'g17672', name: '渡辺 大輔', goal: '新規訪問を月平均20件（上期）', result: '4〜6月は月平均12件。7月以降は実績を更新していない', updated: '7月10日', isStalled: true},
  {id: 'g18421', name: '山田 拓也', goal: '上期の見積もりからの受注 1,200万円（4〜9月）', result: '9月30日時点 980万円（達成率82%）', updated: '9月25日', review: '9/16の面談で見直し', isFirstOfPerson: true},
  {id: 'g18422', name: '山田 拓也', goal: '上期の訪問件数 月平均8社', result: '9月30日時点 月平均5社（最後の更新は7月20日）', updated: '7月20日', isStalled: true},
];
export const GOAL_METRIC: Metric = {value: '12件中10件', base: '先週 12件中10件'};

/* ---------- キャリア希望の反映 ---------- */

export type SplitKind = 'done' | 'alert' | 'open' | 'unknown';
export type SplitGroup = {label: string; members: {name: string; kind: SplitKind}[]};
export const SPLIT_GROUPS: SplitGroup[] = [
  {label: '反映済み 1人', members: [{name: '山田 拓也', kind: 'done'}]},
  {label: '未反映 4人', members: [{name: '田中 翔太', kind: 'alert'}, {name: '佐藤 健一', kind: 'alert'}, {name: '鈴木 美咲', kind: 'alert'}, {name: '渡辺 大輔', kind: 'alert'}]},
  {label: '未確認 1人', members: [{name: '伊藤 彩', kind: 'unknown'}]},
];

export type CareerState = '未反映' | '未確認' | '反映済み';
export type CareerRow = Record<string, unknown> & {id: string; name: string; wish: string; last: string; state: CareerState; isStalled?: boolean};
/** 最終言及日は、会話か電話でキャリアの話をした最後の日 */
export const CAREER: CareerRow[] = [
  {id: 'c1', name: '田中 翔太', wish: '大きな設備の入れ替えを、自分で提案して任される営業になる', last: '9月29日', state: '未反映', isStalled: true},
  {id: 'c2', name: '佐藤 健一', wish: 'チームで成果を出せる係長になり、いずれ課長として大きな工場の設備更新を最初から最後まで任される営業になりたい', last: '9月15日', state: '未反映'},
  {id: 'c3', name: '鈴木 美咲', wish: 'チームをまとめる立場で後輩を育て、人に教える仕組みを学びたい', last: '9月30日', state: '未反映'},
  {id: 'c4', name: '渡辺 大輔', wish: '自分で見つけたお客様をもっと持つ（来期は担当を3社まで）', last: '9月16日', state: '未反映'},
  {id: 'c5', name: '伊藤 彩', wish: '自分の担当のお客様を持ち、若手に説明会の準備を教えられるようになって、将来はチームを率いたい', last: '9月29日', state: '未確認'},
  {id: 'c6', name: '山田 拓也', wish: '自分一人で担当するお客様を持つ（一社から、次は複数社へ）', last: '9月29日', state: '反映済み'},
];
// 比べる相手は画面の右上の「比較対象: 先週」にそろえる。「前期」は推移の図の4〜6月だけに使う（Fable a562 9）
export const CAREER_METRIC: Metric = {value: '6人中1人', delta: '↑1人', base: '先週 6人中0人'};

/* ---------- メンバーの声 ---------- */

// 7〜9月の13週に会話と電話でその話が出た回数。増減は4〜6月の13週と比べた差
export type Topic = {label: string; count: string; delta: string; isAlert?: boolean};
export const GOOD: Topic[] = [
  {label: '任される範囲が広がった', count: '12回', delta: '±0'},
  {label: '支店長が声をかけてくれる', count: '8回', delta: '+3'},
  {label: '課長や先輩が教えてくれる', count: '7回', delta: '−4'},
  {label: '朝会でうまくいった話を共有', count: '5回', delta: '−2'},
  {label: '受注できた', count: '2回', delta: '−9'},
];
export const TROUBLE: Topic[] = [
  {label: '業務負荷', count: '22回', delta: '+2'},
  {label: 'キャリア見通し', count: '15回', delta: '+12', isAlert: true},
  {label: '家庭との両立', count: '8回', delta: '+4'},
  {label: '評価・処遇', count: '4回', delta: '−2'},
];

export type Word = Record<string, unknown> & {id: string; date: string; name: string; text: string};
export const WORDS: Word[] = [
  {id: 'w1', date: '9月30日', name: '鈴木 美咲', text: '来期は、人に教える順番まで自分で考えられるようにしたいです。'},
  {id: 'w2', date: '9月30日', name: '渡辺 大輔', text: '数字は二回数えます。次の見積もりも、そうします。'},
  {id: 'w3', date: '9月29日', name: '佐藤 健一', text: 'まだ自分で出したほうが早いけど、今週は後輩に任せてみました。'},
  {id: 'w4', date: '9月29日', name: '田中 翔太', text: '数字より先に、工場の人の困りごとを聞くのが自分らしいと思います。'},
  {id: 'w5', date: '9月29日', name: '伊藤 彩', text: '話を聞いて短くまとめるのが自分の強みなので、次もそこで勝負します。'},
  {id: 'w6', date: '9月29日', name: '山田 拓也', text: 'まだ一人では不安なところもあるけど、お客様が名前で呼んでくれると、やっていけそうだと思えます。'},
];

/* ---------- アヤの一言（折り返しはブラウザに任せる） ---------- */

export const AYA = {
  // 2文目は1文目（期限を過ぎて終わっていない）の例にする。鈴木さんのいちばん古いもの（HOME.overdue と同じ。Fable 9回目 U5）。研修の話は続きの会話につなげる
  action: '6人全員に、期限を過ぎても終わっていないアクションが残っています。鈴木さんは、5月31日が期限の「新規のお客様を月2件訪問する」がまだ終わっていません。2023年に頼んだ主任向けの研修も、まだ案内されていません。',
  satisfaction: '平均は先週の6.3点から7.2点に上がりました。佐藤さんは8月24日の週から点が上下していて、下がった週が3回あります。',
  goals: '6人全員に、実績の更新が止まっている目標が1つずつあります。いちばん長いのは田中さんの「上期（4〜9月）の設備入れ替えの受注 4件」で、6月22日から更新が止まっています。',
  career: 'キャリア希望が反映されていないのは4人です。田中さんは、技術研修の申し込みが止まったままで、提案を任される話もまだ決まっていません。9月15日の面談で決めた「技術研修の申し込みを人事に出す」は、期限の9月30日までに出ていません。',
  positive: '「任される範囲が広がった」の話は、7〜9月に6人から12回出ています。',
  trouble: '「キャリア見通し」の話が、4〜6月の3回から7〜9月は15回に増えました。6人全員が話しています。',
};

/** アヤの一言の下に置くボタン */
export const AYA_ASK = {
  action: '鈴木さんに聞く',
  // 左メニューの「日程調整」と同じ呼び方（Fable a562 19）
  satisfaction: '日程調整',
  goals: '田中さんに聞く',
  career: '田中さんに聞く',
};

/* ---------- チャット（次回までのアクション） ---------- */

export type Quote = {source: string; text: string};
export type ChatMessage =
  | {id: string; from: 'aya'; text: string; quotes?: Quote[]; action?: string}
  | {id: string; from: 'manager'; text: string};

export const CHAT_ACTION: ChatMessage[] = [
  {id: 'm1', from: 'aya', text: AYA.action},
  {id: 'm2', from: 'manager', text: 'どんな約束だった？'},
  {
    id: 'm3',
    from: 'aya',
    text: '2023年3月のキャリア面談で、鈴木さんが新しく主任になる人向けの研修を頼み、人事は検討すると答えています。その研修の案内は、まだ届いていません。',
    quotes: [
      {source: '2023年3月16日 キャリア面談（鈴木さん）', text: '「新しく主任になる人向けの研修があるとうれしいです。営業のやり方は教わってきましたが、人に教えるやり方は誰にも教わっていないので。」'},
      {source: '2023年3月16日 キャリア面談（人事）', text: '「主任向けの研修の件は、人事の中でも検討しますね。」'},
    ],
  },
  {id: 'm4', from: 'manager', text: '面談までに何をしておけばいい？'},
  // 最初の一言（AYA.action）の2つの話にそろえる（Fable 10回目 V5。前は最初の一言に出てこない「人事に希望を出す文章」の話だった）
  {id: 'm5', from: 'aya', text: '5月31日が期限の「新規のお客様を月2件訪問する」が、どこで止まっているかを鈴木さんに聞いておくとよさそうです。研修のほうは、案内がいつ届くかを人事に確かめておくと、面談で答えられます。', action: AYA_ASK.action},
];

/* ---------- チャット（ほかの話題） ----------
   もとの発言は、6人の7〜9月の会話と電話の記録（再現データ haiku/out-*.json の weeks.words）からそのまま引いた */

export const CHAT_TOPICS: Record<'trouble' | 'goals' | 'career' | 'satisfaction' | 'positive', ChatMessage[]> = {
  trouble: [
    {id: 't1', from: 'aya', text: AYA.trouble},
    {id: 't2', from: 'manager', text: 'どんな話が出てる？'},
    {
      id: 't3',
      from: 'aya',
      text: 'この先どんな仕事を任されたいか、何に力を入れるかの話が多いです。',
      quotes: [
        {source: '2026年9月16日 電話（渡辺さん）', text: '「この先は、大きな会社の担当も持ちたいと思い始めました。」'},
        {source: '2026年7月22日 アヤとの会話（鈴木さん）', text: '「新規を開拓し直すか、既存の提案に力を入れるか迷っています。」'},
      ],
    },
  ],
  goals: [
    {id: 'g1', from: 'aya', text: AYA.goals},
    {id: 'g2', from: 'manager', text: '田中さんはどうしてる？'},
    {
      id: 'g3',
      from: 'aya',
      text: '6月に2件目を受注してから、実績は2件のままです。8月には数字が届かないのがしんどいと話し、9月には次の大きな相談に意欲を見せています。',
      quotes: [
        {source: '2026年8月25日 電話（田中さん）', text: '「数字がまだ目標に届いていないのが、しんどいです。」'},
        {source: '2026年9月1日 アヤとの会話（田中さん）', text: '「来月、もう一件大きな相談が来そうです。やりたいです。」'},
      ],
      action: AYA_ASK.goals,
    },
  ],
  career: [
    {id: 'c1', from: 'aya', text: AYA.career},
    {id: 'c2', from: 'manager', text: '田中さんはどうしたいと言ってる？'},
    {
      id: 'c3',
      from: 'aya',
      text: '次の期は、設備の提案を一人で仕切りたいと話しています。6月15日の面談で決めた「技術研修の空きを人事に確認する」も、まだ人事に連絡できていません。',
      quotes: [
        {source: '2026年9月22日 電話（田中さん）', text: '「次の期は、設備の提案を一人で仕切りたいです。」'},
        {source: '2026年6月9日 アヤとの会話（田中さん）', text: '「技術の研修がまだ取れていなくて、提案に自信が持てません。」'},
      ],
      action: AYA_ASK.career,
    },
  ],
  satisfaction: [
    {id: 's1', from: 'aya', text: AYA.satisfaction},
    {id: 's2', from: 'manager', text: '佐藤さんは何があった？'},
    {
      id: 's3',
      from: 'aya',
      text: '点が下がった週は、チームの仕事量の見直しと、上期の数字の話をしています。',
      quotes: [
        {source: '2026年8月25日 電話（佐藤さん）', text: '「後輩の話を聞いて、チームの仕事量を見直しました。」'},
        {source: '2026年9月22日 電話（佐藤さん）', text: '「上期の数字が詰まってきて、正直まだ不安があります。」'},
      ],
      action: AYA_ASK.satisfaction,
    },
  ],
  positive: [
    {id: 'p1', from: 'aya', text: AYA.positive},
    {id: 'p2', from: 'manager', text: 'どんな話？'},
    {
      id: 'p3',
      from: 'aya',
      text: '担当先や説明会を一人で任されるようになった話が多いです。',
      quotes: [
        {source: '2026年8月19日 電話（渡辺さん）', text: '「説明会を一人でできるようになってきて、少し自信がつきました。」'},
        {source: '2026年8月26日 アヤとの会話（山田さん）', text: '「一人で最初の訪問をして、お客様に名前を覚えてもらえました。」'},
      ],
    },
  ],
};

/* ---------- 個人（山田さん） ---------- */

export const MEMBER = {
  name: '山田 拓也',
  // 2025年4月1日入社。基準日の2026年9月30日で2年目
  meta: '名古屋支店・入社2年目',
  status: '上期の訪問件数は月平均5社で、目標の月平均8社に届いていません。実績は7月20日から更新されていません。9月16日の面談で決めた訪問件数の目標の再計算は、9月26日に送り終えています。',
  // 佐藤さんは9月16日の面談で、山田さんに見積もりを一件、最後まで任せることになっている
  actions: ['中村さんに聞く', '日程調整', '山田さんに電話する'],
  careerState: '反映済み' as CareerState,
  careerAya: '8月から一社を一人で担当することになりました。9月29日の電話では「担当先が増えてきて、やっと一人の営業らしくなってきました。」と話しています。',
  careerAsk: '山田さんに聞く',
  /** 面談の担当者 */
  interviewer: '中村 恵',
  scores: [5, 7, 7, 6, 7, 6, 5, 8],
  low: [],
};

/** 進捗が「未完了」で、期限を過ぎたものは isOverdue */
export type ActionRow = Record<string, unknown> & {id: string; action: string; due: string; meeting: string; progress: string; isOverdue?: boolean};
// 7月からの面談で決めたアクションと、それより前の面談で決めて終わっていないもの
export const MEMBER_ACTIONS: ActionRow[] = [
  // 9月16日（いちばん新しい面談）のアクションは済み。6月と4月の面談のアクションが期限を過ぎて残っている
  {id: 'a1', action: '訪問件数の目標を再計算して送る', due: '10月5日', meeting: '9月16日', progress: '完了'},
  {id: 'a2', action: '訪問計画を作って支店長に見せる', due: '8月31日', meeting: '8月19日', progress: '完了'},
  {id: 'a3', action: '引き継いだお客様に初回の挨拶をする', due: '7月31日', meeting: '7月15日', progress: '完了'},
  {id: 'a4', action: '訪問先の一覧を課長に出す', due: '7月3日', meeting: '6月17日', progress: '未完了', isOverdue: true},
  {id: 'a5', action: '先輩と担当先の一覧を作る', due: '5月8日', meeting: '4月15日', progress: '未完了', isOverdue: true},
];
export const MEMBER_ACTION_METRIC: Metric = {value: '5件中3件', unit: '完了', delta: '↑1件', base: '先週 5件中2件'};
export const MEMBER_SATISFACTION: Metric = {value: '8点', unit: '10点満点', delta: '↑3点', base: '先週 5点'};

export type MemberCareerRow = Record<string, unknown> & {id: string; item: string; date: string; source: string; text: string};
export const MEMBER_CAREER: MemberCareerRow[] = [
  {id: 'mc1', item: 'やりたいこと', date: '4月8日', source: '入社後フォローアップ面談', text: '「自分一人で担当するお客様を持ちたいです。」'},
  {id: 'mc2', item: 'できること', date: '4月8日', source: '入社後フォローアップ面談', text: '「確認したいことを先に紙にまとめて、一回で聞けるようにしています。」'},
  {id: 'mc3', item: 'やってほしいこと', date: '4月8日', source: '入社後フォローアップ面談', text: '「課長からは、夏ごろに一社任せたいと言われています。」'},
];

export type VoiceRow = Record<string, unknown> & {id: string; date: string; source: string; text: string};
export type MemberGoalRow = Record<string, unknown> & {id: string; goal: string; review?: string; result: string; updated: string; effort: string; isStalled?: boolean};
export const MEMBER_GOALS: MemberGoalRow[] = [
  {id: 'yg1', goal: '上期の見積もりからの受注 1,200万円（4〜9月）', review: '9/16の面談で見直し', result: '9月30日時点 980万円（達成率82%）', updated: '9月25日', effort: '引き継いだお客様に初回の挨拶をする（7月29日に完了）'},
  {id: 'yg2', goal: '上期の訪問件数 月平均8社', result: '9月30日時点 月平均5社（最後の更新は7月20日）', updated: '7月20日', effort: '訪問計画を作って支店長に見せる（8月28日に完了）。訪問件数の目標を再計算して送る（9月26日に完了）', isStalled: true},
];
export const MEMBER_GOAL_METRIC: Metric = {value: '2件中1件'};
/** 本人聞き取り（仕事の満足度）。直近3週の会話と電話 */
export type HearingRow = {id: string; source: string; score: string; text: string};
export const MEMBER_HEARING: HearingRow[] = [
  {id: 'h1', source: '9月29日・電話 10分', score: '8点', text: '「担当先が増えてきて、やっと一人の営業らしくなってきました。」'},
  {id: 'h2', source: '9月22日・アヤとの会話 5分', score: '5点', text: '「訪問が思うように増えず、朝会で話すのが少し重く感じました。」'},
  {id: 'h3', source: '9月16日・アヤとの会話 7分', score: '6点', text: '「目標を見直して、訪問の件数を一度相談しました。」'},
];
// 台紙 tug と同じく、いちばん新しい会話から新しい順に3件。
// 9月29日の電話は、本人聞き取りと同じ言葉を2回出さないよう、上司ホームのひとこと（WORDS の w6、同じ日）を出す
export const MEMBER_VOICES: VoiceRow[] = [
  {id: 'mv0', date: '9月29日', source: '電話 10分', text: 'まだ一人では不安なところもあるけど、お客様が名前で呼んでくれると、やっていけそうだと思えます。'},
  {id: 'mv1', date: '9月9日', source: '電話 9分', text: '上期の受注の数字が見えてきて、少し前向きになりました。'},
  {id: 'mv2', date: '9月2日', source: 'アヤとの会話 6分', text: '見積もりは自分で出せるようになりましたが、確認の時間が長いです。'},
];
/** 面談履歴（半年の月1回の面談と、それより前の面談） */
export type TalkRow = {id: string; when: string; host: string; summary: string};
export const MEMBER_TALKS: TalkRow[] = [
  {id: 'm1', when: '2026年9月16日', host: '中村 恵', summary: '上期の訪問件数の見直しと、10月以降の目標について話した。'},
  {id: 'm2', when: '2026年8月19日', host: '中村 恵', summary: '一人担当になったことの確認と、9月までの訪問計画を話した。'},
  {id: 'm3', when: '2026年7月15日', host: '中村 恵', summary: '引き継いだ一社の進め方と、夏からの担当の準備を話した。'},
  {id: 'm4', when: '2026年6月17日', host: '中村 恵', summary: '追加の見積もりが通ったことと、来期の担当について話した。'},
  {id: 'm5', when: '2026年5月13日', host: '中村 恵', summary: '同行が減ったことへの不安と、一社の担当候補について話した。'},
  {id: 'm6', when: '2026年4月15日', host: '中村 恵', summary: '確認を紙にまとめる進め方と、次の一社に向けた担当先の整理を話した。'},
  {id: 'm7', when: '2026年4月8日', host: '中村 恵', summary: '入社後フォローアップ面談。先輩と3社を一緒に担当し、2月に先輩に直されずに出した見積もりが通った。次は自分一人で担当するお客様を持ちたい。'},
  {id: 'm8', when: '2025年7月4日', host: '中村 恵', summary: '入社後フォローアップ面談。見積もりの作成と、技術の担当との仕様の調整をしている。技術の方に何を確認すればいいかの例がほしい。'},
  {id: 'm9', when: '2025年2月14日', host: '小林 修', summary: '採用面接。お客様の工場に通って、困りごとを聞き、それに合う提案ができるようになりたい。'},
];

/* ---------- ホーム ---------- */

/** 「6月22日」を並べ替えのための数（622）にする */
const monthDay = (s: string) => {
  const m = s.match(/(\d+)月(\d+)日/);
  return m ? Number(m[1]) * 100 + Number(m[2]) : 0;
};

export const HOME = {
  metrics: [
    {label: '電話', value: '49回'},
    {label: '会話時間', value: '20時間26分'},
    {label: '問題点', value: '19件'},
  ],
  issue: '面談で決めたアクションのうち19件が、期限を過ぎても終わっていません。いちばん多いのは田中さんの5件です。',
  // タイルを選んだときの人ごとの内訳（haiku/out-*.json の4〜9月26週から数えた。合計はタイルの値と同じ）
  /** 電話の回数と、いちばん新しい電話で出た言葉 */
  calls: [
    {name: '渡辺 大輔', value: '13回', text: '数字は二回数えます。次の見積もりも、そうします。'},
    {name: '山田 拓也', value: '9回', text: '担当先が増えてきて、やっと一人の営業らしくなってきました。'},
    {name: '伊藤 彩', value: '8回', text: '期末の数字を見ると、正直、届かない気がします。'},
    {name: '佐藤 健一', value: '7回', text: '上期の数字が詰まってきて、正直まだ不安があります。'},
    {name: '鈴木 美咲', value: '6回', text: '来月、後輩が担当するお客様に一緒に同行する予定です。'},
    {name: '田中 翔太', value: '6回', text: '次の期は、設備の提案を一人で仕切りたいです。'},
  ],
  /** 電話とアヤとの会話を合わせた時間 */
  talkTime: [
    {name: '渡辺 大輔', value: '3時間33分', text: '電話 13回・アヤとの会話 13回'},
    {name: '鈴木 美咲', value: '3時間31分', text: '電話 6回・アヤとの会話 20回'},
    {name: '伊藤 彩', value: '3時間29分', text: '電話 8回・アヤとの会話 18回'},
    {name: '佐藤 健一', value: '3時間28分', text: '電話 7回・アヤとの会話 19回'},
    {name: '山田 拓也', value: '3時間14分', text: '電話 9回・アヤとの会話 17回'},
    {name: '田中 翔太', value: '3時間11分', text: '電話 6回・アヤとの会話 20回'},
  ],
  /** 期限を過ぎても終わっていないアクションの件数と、いちばん古いもの */
  overdue: [
    {name: '田中 翔太', value: '5件', text: '設備の相談先の技術の人に、対応できる範囲を聞く（期限 4月30日）'},
    {name: '佐藤 健一', value: '4件', text: '三河の部品メーカー3社の更新見込みをまとめる（期限 4月30日）'},
    {name: '鈴木 美咲', value: '3件', text: '新規のお客様を月2件訪問する（期限 5月31日）'},
    {name: '渡辺 大輔', value: '3件', text: '自動車部品の見積もりを、先輩に一度見てもらう（期限 5月8日）'},
    {name: '伊藤 彩', value: '2件', text: '負けた案件の理由を3行でまとめる（期限 5月29日）'},
    {name: '山田 拓也', value: '2件', text: '先輩と担当先の一覧を作る（期限 5月8日）'},
  ],
  talks: [
    {name: '鈴木 美咲', when: '9月30日・7分', text: '後輩と組んだ案件を、来期もチームで続けたいです。'},
    {name: '渡辺 大輔', when: '9月30日・12分', text: '数字は二回数えます。次の見積もりも、そうします。'},
    {name: '佐藤 健一', when: '9月29日・12分', text: 'まだ自分で出したほうが早いけど、今週は後輩に任せてみました。'},
    {name: '田中 翔太', when: '9月29日・4分', text: '数字は届きませんでしたが、工場の方の話はちゃんと聞けました。'},
    {name: '伊藤 彩', when: '9月29日・8分', text: '数字は届かなくても、教えたことは後輩に残ると思えています。'},
    {name: '山田 拓也', when: '9月29日・10分', text: '担当先が増えてきて、やっと一人の営業らしくなってきました。'},
  ],
  /** 実績の更新が止まっている目標（停滞）。最終更新の古い順（同じ日は業績目標の表の順） */
  stalled: GOALS.filter(g => g.isStalled)
    .sort((a, b) => monthDay(a.updated) - monthDay(b.updated))
    .map(g => ({name: g.name, text: `${g.goal}。${g.result}`, updated: g.updated})),
};

/** ホームのコンピテンシー。強みと課題は、テストデータの面談で「強み」「課題」「足りないところ」を聞かれて本人が答えた言葉から取った（佐藤さんの強みは「現場を見ないと、何に困っているのか分からない」から） */
export type CompetencyRow = {name: string; strength: string; issue: string};
export const COMPETENCY: CompetencyRow[] = [
  {name: '佐藤 健一', strength: 'お客様の現場を見て、何に困っているかをつかむこと', issue: '後輩に任せるより、つい自分で動いてしまうこと'},
  {name: '鈴木 美咲', strength: '人に教えること', issue: '人に教えるやり方を、まだ誰にも教わっていないこと'},
  {name: '田中 翔太', strength: '体力と、人に好かれるところ', issue: '細かい書類の作業で、数字をよく見間違えること'},
  {name: '伊藤 彩', strength: '話を聞いて、短くまとめること', issue: 'はじめての場では、緊張して声が小さくなること'},
  {name: '渡辺 大輔', strength: '初めての人とも、すぐに話せること', issue: '細かい数字の確認'},
  {name: '山田 拓也', strength: '相手の好みを覚えておくこと', issue: '一度にいくつも頼まれると、順番を決めるのに迷うこと'},
];

/* ---------- フィード ---------- */

export type FeedItem = {id: string; source: string; text: string; action?: string};
export type FeedDay = {date: string; items: FeedItem[]};
export const FEED: FeedDay[] = [
  {
    date: '9月30日',
    items: [
      {id: 'f1', source: '困りごとの話題', text: AYA.trouble},
      {id: 'f2', source: '次回までのアクション', text: AYA.action, action: AYA_ASK.action},
      {id: 'f3', source: '仕事の満足度', text: AYA.satisfaction, action: AYA_ASK.satisfaction},
      {id: 'f4', source: '見直し済みの目標', text: AYA.goals, action: AYA_ASK.goals},
      {id: 'f5', source: 'キャリア希望の反映', text: AYA.career, action: AYA_ASK.career},
      {id: 'f6', source: '前向きな話題', text: AYA.positive},
    ],
  },
];
