import {useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type FormEvent, type KeyboardEvent, type PointerEvent, type ReactNode} from 'react';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Avatar} from '@astryxdesign/core/Avatar';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {SPACE} from '../../space';
import {COMPARE, NAMES_IN_TEXT, type HeatRow, type Topic} from './managerData';
import ayaImage from '../../assets/aya.png';
import './manager.css';

/* ---------- 文の中の名前と日付 ---------- */

// 台紙では、文の中の名前（「佐藤さん」）と日付（「2021年9月14日」「9月12日」）と点の幅（「6〜7点」）は行の途中で割れない。
// かぎ括弧の言葉とその後の「と」（「「企画をやりたい」と」）も、台紙では同じ行にあり、「と」で行が始まらない。
// auto-phrase が名前や日付や点の幅の途中に置く改行の候補を、この範囲だけ消す。
// 名前は長い方から当てる（「佐藤 健一」を「佐藤」より先に）
const NAME_ALT = [...NAMES_IN_TEXT].sort((a, b) => b.length - a.length).join('|');
// 表の実績の「達成率82%」「8,100万円」「月平均5社」「最後の更新は7月20日」も、途中で割れると読めないので同じ扱いにする（Fable 7回目 S2）
const KEEP_TOGETHER = new RegExp(`((?:${NAME_ALT})(?:さん)?|\\d{4}年\\d{1,2}月(?:\\d{1,2}日)?|\\d{1,2}月\\d{1,2}日(?:時点)?|\\d{1,2}〜\\d{1,2}点|「[^」]{1,15}」と|(?:達成率|目標比|前年同期比|目標の)\\d+%|(?:\\d+億)?\\d[\\d,]*万円|\\d{1,2}月?〜\\d{1,2}月|月平均\\d+(?:社|件)|見積もり中 \\d+件)`);

// 吹き出しの中で上の塊ごと割らないと、行末に3〜4字の空きが残り、文の切れ目で折れて見えた（「残っています。／鈴木さんは」。Fable 9回目 U3）。
// 吹き出しでは塊の中をさらに小さな「離さない単位」（姓・「さん」・数字と単位）に分け、その間だけで折る（manager.css の .mg-glue）
// 名前のすぐ後の「さん」は名前と一緒に離さない（「佐藤／さん」と割れていた。Fable 10回目 V3）
// 小さい「っ」「ゃ」などと長音の「ー」は行の頭に置かない。前の1字と1つの塊にして、その前で折る（「終わ／っていない」と折れていた。Fable 11回目 W2）。
// line-break: strict にすると句切れで折れて右に空きが残った（10回目 V4）ので、CSS でなくこの塊で止める
// 「7〜9月」「4月〜9月」のような期間と、「9月30日」「2026年4月」のような日付も1つの塊にする
// （2026-11-17 Fable 12回目 X1: 「4／〜6月」と行の頭が「〜」になり、「期限の9月／30日」と日付が割れていた）
// 「達成率82%」「目標比20%」も札と数字を離さない（表で割らないと決めた Fable 7回目 S2 と同じ。375px で「（目標比／20%）」「（達成率／82%）」と割れていた。2026-11-17 Fable 13回目 Y1 の直しで測った）
const DATE_OR_NUM = `(?:\\d{4}年)?\\d{1,2}月(?:\\d{1,2}日)?(?:時点)?|\\d[\\d,.]*(?:億|万円|万|年|月|日|回|点|人|件|社|%|時間|分)?`;
const GLUE = new RegExp(`((?:${NAME_ALT})(?:さん)?|さん|(?:達成率|目標比|前年同期比|目標の)\\d+%|(?:${DATE_OR_NUM})(?:[〜～~](?:${DATE_OR_NUM}))?|[^\\s、。][ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶー]+)`);
function glued(part: string) {
  return part.split(GLUE).map((g, j) => (j % 2 === 1 ? <span key={j} className="mg-glue">{g}</span> : g));
}

export function Phrase({text}: {text: string}) {
  // 台紙が文の切れ目で改行している所（フィード）は、データの \n を <br> にする
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, l) => (
        <span key={l}>
          {l > 0 ? <br /> : null}
          {/* split に括弧つきの正規表現を渡すと、奇数番目が当たった部分になる */}
          {line.split(KEEP_TOGETHER).map((part, i) => (i % 2 === 1 ? <span key={i} className="mg-keep">{glued(part)}</span> : <span key={i}>{glued(part)}</span>))}
        </span>
      ))}
    </>
  );
}

// 吹き出しの外の本文（ホームの一覧の説明・チーム概要、メンバーの実績・取り組み・面談の要約）も、日付・数字と単位・名前と「さん」だけを離さない。
// 塊（.mg-keep）ごとは送らず、その中の小さな単位（.mg-glue）だけ止める（吹き出しと同じ。manager.css の .mg-glue-only）。
// 375px で「受注 4／件」「9月／30日時点」「10／月以降」、1440px で「6／月22日」「田中／さん」と割れていた（Fable 13回目 Y1）
export function GluedText({text}: {text: string}) {
  return (
    <span className="mg-glue-only">
      <Phrase text={text} />
    </span>
  );
}

/* ---------- 頭・区画 ---------- */

export function PageHeader({title, sub, period}: {title: string; sub?: string; /** データの週（右に出す） */ period?: string}) {
  return (
    <HStack gap={SPACE.card} vAlign="end" hAlign="between" wrap="wrap">
      {/* 台紙の Page Title Group: 名前の下に所属を置く（間は 4） */}
      <VStack gap={SPACE.tight}>
        <Heading level={1}>{title}</Heading>
        {sub ? <Text type="supporting" color="secondary">{sub}</Text> : null}
      </VStack>
      <HStack gap={SPACE.block} vAlign="center">
        {period ? <Text type="supporting" color="secondary">{period}</Text> : null}
        <Text type="supporting" color="secondary">比較対象: {COMPARE}</Text>
      </HStack>
    </HStack>
  );
}

/** 区画: 見出し（h2）と、その下に縦に積んだカード */
export function Section({id, title, children}: {id: string; title: string; children: ReactNode}) {
  return (
    <section aria-labelledby={id}>
      <VStack gap={SPACE.block}>
        <Heading level={2} id={id}>{title}</Heading>
        <VStack gap={SPACE.card}>{children}</VStack>
      </VStack>
    </section>
  );
}

/** 指標の数字の行: 大きな数字・単位・増減の札・比べる値 */
export function MetricFigure({
  value,
  unit,
  delta,
  isDown,
  base,
  size = 'large',
}: {
  value: string;
  unit?: string;
  delta?: string;
  isDown?: boolean;
  base?: string;
  size?: 'large' | 'medium';
}) {
  return (
    <HStack gap={SPACE.block} vAlign="end" wrap="wrap">
      {size === 'large' ? (
        <Text type="display-2" weight="bold" hasTabularNumbers>{value}</Text>
      ) : (
        <Text size="2xl" weight="bold" hasTabularNumbers>{value}</Text>
      )}
      <HStack gap={SPACE.inline} vAlign="center" wrap="wrap">
        {unit ? <Text type="supporting" color="secondary">{unit}</Text> : null}
        {delta ? <Badge label={delta} variant={isDown ? 'error' : 'green'} /> : null}
        {base ? <Text type="supporting" color="secondary">{base}</Text> : null}
      </HStack>
    </HStack>
  );
}

/* ---------- アヤの吹き出し ---------- */

export type AyaAction = {label: string};

/** アヤの一言。人の名前のボタンは灰色の地（secondary）、「アヤに聞く」は地が無く枠だけのボタン（Astryx に無いので ghost に枠を足す）。 */
export function AyaNote({
  text,
  source,
  actions = [],
  hasAskAya = true,
  size = 'small',
  askHref,
  children,
}: {
  text: string;
  /** どの話題からの一言か（フィードの「アヤ · 困りごとの話題」） */
  source?: string;
  actions?: string[];
  hasAskAya?: boolean;
  size?: 'small' | 'large';
  /** 「アヤに聞く」の行き先（その話題のチャットを開いた画面） */
  askHref?: string;
  /** 文の下に添える物（チャットの「もとの発言」） */
  children?: ReactNode;
}) {
  return (
    <div className={size === 'large' ? 'mg-aya mg-aya-large' : 'mg-aya'}>
      {/* 隣に「アヤ」の文字があるので顔は飾り。name を渡すと名前の吹き出しとタブ停止が付き、読み上げも二重になるので渡さない */}
      <Avatar src={ayaImage} alt="" size={size === 'large' ? 40 : 'sm'} />
      <span className="mg-aya-tail" aria-hidden="true">
        <svg viewBox="0 0 8 8" focusable="false">
          <path d="M8 0L0 4L8 8Z" fill="currentColor" />
        </svg>
      </span>
      <div className="mg-aya-body">
        {/* 名前と文はひとまとまり（台紙の Aya Status Message）。ボタンとの間はそれより広く空ける */}
        <div className="mg-aya-message">
          {source ? (
            <span className="mg-aya-head">
              <Text type="supporting" color="secondary" weight="medium">アヤ</Text>
              <Text type="supporting" color="secondary" aria-hidden="true">·</Text>
              {/* 何の知らせかを示す話題の名前は、吹き出しの中でいちばん薄い文字にしない（Fable a562 6） */}
              <Text type="supporting" weight="medium">{source}</Text>
            </span>
          ) : (
            <Text type="supporting" color="secondary" weight="medium">アヤ</Text>
          )}
          {/* 折り返しはブラウザに任せ、文字の切れ目で折る（manager.css の .mg-aya-body .mg-phrase）。台紙が文の切れ目で改行している所だけデータに \n を入れる */}
          <Text className="mg-phrase"><Phrase text={text} /></Text>
          {children}
        </div>
        {actions.length > 0 || hasAskAya ? (
          <div className="mg-aya-actions">
            {/* 先に押す1つだけ塗りつき（secondary）。2つ目からは「アヤに聞く」と同じ線だけの形にそろえ、ボタンが同じ強さで並ばないようにする
                （Fable 5回目の IMPECCABLE tug「ボタン4つが同じ強さで、どれを先に押すか決まらない」、6回目の R1「2つ目からと
                「アヤに聞く」で形が2種類ある」）。主ボタン（primary）は下の「アヤに聞く」の欄の「送る」だけにする */}
            {actions.map((a, i) => (
              <Button key={a} label={a} variant={i === 0 ? 'secondary' : 'ghost'} size="md" className={i === 0 ? undefined : 'mg-aya-sub'} />
            ))}
            {hasAskAya ? <Button label="アヤに聞く" variant="ghost" size="md" className="mg-ask-aya" href={askHref} /> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- 推移の線 ---------- */

// 0人を下端 90 に置き、上端 10 は「いちばん多い週の人数 + 1」にする（10週を横 10〜510 に等間隔。枠は 520×100）。
// 0〜6人で固定すると、1〜3人の週しか無いときに線が器の下半分に寄り、上に空きができる（Fable 10・N13）
const TREND_W = 520;
const trendX = (i: number, n: number) => 10 + i * (500 / (n - 1));
const trendY = (v: number, top: number) => 90 - (v / top) * 80;
function toPoints(values: number[], top: number) {
  return values.map((v, i) => `${trendX(i, values.length)},${trendY(v, top)}`).join(' ');
}

/** 完了した人数の推移（今期と前期）。データが無いときは呼ばずに空の表示にする。
 *  線に触れる（ポインタを乗せる・押す）と、いちばん近い週の人数を吹き出しで出す。
 *  キーボードでは Tab で入り、左右の矢印で週を動かす（Home・End で端、Esc で閉じる）。 */
export function TrendChart({
  now,
  prev,
  weeksNow,
  weeksPrev,
}: {
  now: number[];
  prev: number[];
  /** 各週の初めの日（今期） */
  weeksNow: string[];
  /** 各週の初めの日（前期） */
  weeksPrev: string[];
}) {
  const n = now.length;
  const top = Math.max(1, ...now, ...prev) + 1;
  // 縦の目盛りは 0人 と、いちばん多い週の人数の2つ（ポインタを当てなくても線の高さが読める。Fable P10）
  const peak = top - 1;
  const y = (v: number) => trendY(v, top);
  const last = n - 1;
  const [active, setActive] = useState<number | null>(null);
  // キーボードで動かしたときだけ読み上げる（ポインタで動かすたびに読み上げない）
  const [said, setSaid] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  // 吹き出しは線の上の帯に付ける（線の横に出すと、どの週でも点のすぐ隣で2本の線を隠した。Fable 7回目 R6）
  const tipRef = useRef<HTMLSpanElement>(null);
  const shown = active ?? last;
  const at = (i: number) => ({left: `${(trendX(i, n) / TREND_W) * 100}%`});
  const sentence = (i: number) => `今期 ${weeksNow[i]}の週 ${now[i]}人、前期 ${weeksPrev[i]}の週 ${prev[i]}人`;

  const pick = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * TREND_W;
    setActive(Math.min(last, Math.max(0, Math.round((x - 10) / (500 / (n - 1))))));
  };
  const moveByKey = (i: number) => {
    setActive(i);
    setSaid(sentence(i));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const from = active ?? last;
    const next =
      e.key === 'ArrowLeft' ? Math.max(0, from - 1)
      : e.key === 'ArrowRight' ? Math.min(last, from + 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next !== null) {
      e.preventDefault();
      moveByKey(next);
    } else if (e.key === 'Escape' && active !== null) {
      e.preventDefault();
      setActive(null);
    }
  };
  // 押して入ったとき（:focus-visible でない）は、押した週のまま。Tab で入ったときだけ今週から始める
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.matches(':focus-visible')) moveByKey(active ?? last);
  };
  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.matches(':focus-visible')) setActive(null);
  };

  return (
    <div className="mg-trend-frame">
      <span aria-hidden="true" />
      <div className="mg-trend-band" aria-hidden="true">
        <span ref={tipRef} className="mg-trend-dot mg-trend-tip-anchor" style={{...at(shown), top: '50%'}} />
      </div>
      <div className="mg-trend-axis" aria-hidden="true">
        {/* 幅を決めるだけの見えない目盛り（目盛りは位置を % で置くので、列の幅は自分では決まらない） */}
        <span className="mg-trend-tick-size"><Text type="supporting" color="secondary" hasTabularNumbers>{peak}人</Text></span>
        <span className="mg-trend-tick" style={{top: `${y(peak)}%`}}><Text type="supporting" color="secondary" hasTabularNumbers>{peak}人</Text></span>
        <span className="mg-trend-tick" style={{top: `${y(0)}%`}}><Text type="supporting" color="secondary" hasTabularNumbers>0人</Text></span>
      </div>
      <div
        ref={wrapRef}
        className="mg-trend-wrap"
        tabIndex={0}
        role="group"
        aria-label="完了した人数の推移"
        onPointerMove={e => pick(e.clientX)}
        onPointerDown={e => pick(e.clientX)}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={() => setActive(null)}
      >
        <svg className="mg-trend" viewBox={`0 0 ${TREND_W} 100`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <line className="mg-trend-grid" x1="0" y1={y(peak)} x2={TREND_W} y2={y(peak)} />
          <line className="mg-trend-grid" x1="0" y1={y(0)} x2={TREND_W} y2={y(0)} />
          <polyline className="mg-trend-prev" points={toPoints(prev, top)} />
          <polyline className="mg-trend-now" points={toPoints(now, top)} />
        </svg>
        {active !== null ? (
          <>
            <span className="mg-trend-guide" aria-hidden="true" style={at(active)} />
            <span className="mg-trend-dot mg-trend-dot-prev" aria-hidden="true" style={{...at(active), top: `${y(prev[active])}%`}} />
          </>
        ) : null}
        <span ref={dotRef} className={active === null ? 'mg-trend-dot mg-trend-dot-end' : 'mg-trend-dot'} aria-hidden="true" style={{...at(shown), top: `${y(now[shown])}%`}} />
        <Tooltip
          anchorRef={tipRef}
          // 吹き出しは線の上の帯の中、選んだ週の横に出す（線の横に出すと点の隣で線を隠した。Fable 7回目 R6）。
          // 左半分の週は右へ、右半分の週は左へ出して、カードの外へはみ出さない
          placement={shown < last / 2 ? 'end' : 'start'}
          alignment="center"
          isOpen={active !== null}
          onOpenChange={isOpen => {
            if (!isOpen) setActive(null);
          }}
          focusTrigger="never"
          content={
            active !== null ? (
              <VStack gap={SPACE.none}>
                <Text type="supporting" color="inherit" weight="semibold" hasTabularNumbers>今期 {weeksNow[active]}の週 {now[active]}人</Text>
                <Text type="supporting" color="inherit" hasTabularNumbers>前期 {weeksPrev[active]}の週 {prev[active]}人</Text>
              </VStack>
            ) : null
          }
        />
        <VisuallyHidden aria-live="polite">{said}</VisuallyHidden>
      </div>
      <span aria-hidden="true" />
      <HStack gap={SPACE.inline} vAlign="center" hAlign="between">
        <Text type="supporting" color="secondary">{last}週前</Text>
        <HStack gap={SPACE.card} vAlign="center">
          <HStack gap={SPACE.tight} vAlign="center"><span className="mg-key mg-key-now" aria-hidden="true" /><Text type="supporting" color="secondary">今期</Text></HStack>
          <HStack gap={SPACE.tight} vAlign="center"><span className="mg-key mg-key-prev" aria-hidden="true" /><Text type="supporting" color="secondary">前期</Text></HStack>
        </HStack>
        <Text type="supporting" color="secondary">今週</Text>
      </HStack>
    </div>
  );
}

/* ---------- 反映の帯と表の同じ人 ---------- */

/** 反映の帯のマスか表の行に触れている人。もう片方の同じ人にも印を付ける。
 *  表の名前のセルは personCell で包む（行の名前を data-person で持たせる） */
export function usePointedPerson() {
  const [person, setPerson] = useState<string | null>(null);
  const segProps = (name: string) => ({
    onPointerEnter: () => setPerson(name),
    onPointerLeave: () => setPerson(null),
    'data-pointed': person === name ? 'true' : undefined,
  });
  const tableProps = {
    onPointerOver: (e: PointerEvent<HTMLElement>) => {
      const row = (e.target as Element).closest('tbody tr');
      setPerson(row?.querySelector('[data-person]')?.getAttribute('data-person') ?? null);
    },
    onPointerLeave: () => setPerson(null),
  };
  const personCell = (name: string, content: ReactNode) => (
    <span data-person={name} data-pointed={person === name ? 'true' : undefined}>{content}</span>
  );
  return {segProps, tableProps, personCell};
}

/* ---------- 満足度の点の表 ---------- */

function heatClass(isLow: boolean) {
  if (isLow) return 'mg-heat-cell mg-heat-low';
  // 赤い週だけを目立たせ、ほかは点によらず同じ灰色にする。灰色の濃淡には意味の説明が無く、
  // 上司ホームと個人画面で色の付き方が違っていた（Fable 7回目 13・N9・M3）
  return 'mg-heat-cell mg-heat-s2';
}

/** 会話ごとの点。本物の table にして、列の見出し（日付）と行の見出し（名前）をセルに結び付ける。
 *  横に入りきらないときは枠の中で横に送れるよう、枠をキーボードで触れるようにする。 */
export function ScoreGrid({
  labelledBy,
  dates,
  rows,
  hasNames = true,
  isFlat = false,
}: {
  labelledBy: string;
  dates: string[];
  rows: HeatRow[];
  hasNames?: boolean;
  isFlat?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // ポインタが乗っているマス。その行の名前とその列の日付を濃くする
  const [pointed, setPointed] = useState<{row: number; col: number} | null>(null);
  const onPointerOver = (e: PointerEvent<HTMLTableElement>) => {
    const td = (e.target as Element).closest('td[data-col]');
    setPointed(td ? {row: Number(td.getAttribute('data-row')), col: Number(td.getAttribute('data-col'))} : null);
  };
  useLayoutEffect(() => {
    // 枠が狭くて横に送るときは、最新の週（右端）から見せる。scroll-initial-target に対応していないブラウザだけここで送る
    const el = scrollRef.current;
    if (el && !CSS.supports('scroll-initial-target', 'nearest')) {
      el.scrollLeft = el.scrollWidth;
    }
  }, []);
  // 赤いマスがある表だけ、表の下に赤の意味を1行で出す（同じ5でも赤と灰色がある理由。決め方は managerData の low と同じ）
  const hasLow = rows.some(row => (row.low ?? []).length > 0);
  return (
    <>
    <div ref={scrollRef} className="mg-heat-scroll" tabIndex={0} role="region" aria-labelledby={labelledBy}>
      <table
        className={isFlat ? 'mg-heat mg-heat-strip' : 'mg-heat'}
        style={{'--mg-heat-cols': dates.length} as CSSProperties}
        onPointerOver={onPointerOver}
        onPointerLeave={() => setPointed(null)}
      >
        {hasNames ? (
          <colgroup>
            <col className="mg-heat-name-col" />
            {dates.map(d => <col key={d} />)}
          </colgroup>
        ) : null}
        <thead>
          <tr>
            {hasNames ? <th scope="col" className="mg-heat-name-head">名前</th> : null}
            {dates.map((d, i) => (
              <th
                key={d}
                scope="col"
                className={[i === dates.length - 1 ? 'mg-heat-latest' : '', pointed?.col === i ? 'mg-heat-pointed' : ''].filter(Boolean).join(' ') || undefined}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={row.name}>
              {hasNames ? <th scope="row" className={pointed?.row === r ? 'mg-heat-pointed' : undefined}>{row.name}</th> : null}
              {row.scores.map((s, i) => (
                <td key={dates[i]} data-row={r} data-col={i}>
                  {/* 現れるときは古い週から順に（--mg-col で遅らせる） */}
                  <span
                    className={heatClass((row.low ?? []).includes(i))}
                    data-pointed={pointed?.row === r && pointed.col === i ? 'true' : undefined}
                    style={{'--mg-col': i} as CSSProperties}
                  >
                    {s}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {hasLow ? (
      <div className="mg-heat-legend">
        <span className="mg-heat-legend-swatch" aria-hidden="true" />
        <Text type="supporting" color="secondary">4点以下か、前の週から2点以上下がった週</Text>
      </div>
    ) : null}
    </>
  );
}

/* ---------- 話題の順位 ---------- */

export function TopicRanking({topics}: {topics: Topic[]}) {
  return (
    <ol className="mg-topics" role="list">
      {topics.map((t, i) => (
        <li key={t.label} className="mg-topic-row">
          <span className="mg-topic-rank"><Text type="supporting" color="secondary" hasTabularNumbers>{i + 1}</Text></span>
          <span className="mg-topic-label"><Text>{t.label}</Text></span>
          <span className="mg-topic-count"><Text weight="medium" hasTabularNumbers>{t.count}</Text></span>
          {/* 4〜6月と比べた増減。大きく増えた困りごとだけ札にする */}
          <span className="mg-topic-delta">
            {t.isAlert ? <Badge label={t.delta} variant="error" /> : <Text type="supporting" color="secondary" hasTabularNumbers>{t.delta}</Text>}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ---------- 頼む欄 ---------- */

/** アヤに聞く欄（ボタンの「アヤに聞く」と同じ呼び方。Fable a562 19）。form の既定の送信を使い、Enter の扱いはブラウザに任せる（変換中の Enter では送られない）。 */
export function AskBar() {
  const [ask, setAsk] = useState('');
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // 送り先はまだ無いので、画面は移らない
    e.preventDefault();
  };
  return (
    <form className="mg-ask" onSubmit={onSubmit}>
      <div className="mg-ask-input">
        <TextInput label="アヤに聞く" isLabelHidden placeholder="アヤに聞く" value={ask} onChange={v => setAsk(v)} />
      </div>
      <Button type="submit" label="送る" variant="primary" />
    </form>
  );
}
