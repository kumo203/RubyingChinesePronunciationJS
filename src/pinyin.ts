import { pinyin } from 'pinyin-pro';

export type RubyMode = 'pinyin' | 'zhuyin';
export type ToneDisplay = 'mark' | 'number';
export interface PinyinVariant { pinyin: string; zhuyin: string } // e.g. "zhōng" / "ㄓㄨㄥ"
export interface RubyToken extends PinyinVariant {
  text: string;
  isRuby: boolean;            // true for a Chinese character
  variants: PinyinVariant[];  // all readings; length 1 for non-polyphonic
  activeVariantIndex: number;
}
export interface ConversionItem { id: number; inputText: string; timestamp: Date; hash: string }

// Pinyin (toneless) → Zhuyin dictionary, ported from the original C# PinyinService.cs
const ZHUYIN: Record<string, string> = Object.fromEntries(`
  a:ㄚ ai:ㄞ an:ㄢ ang:ㄤ ao:ㄠ
  ba:ㄅㄚ bai:ㄅㄞ ban:ㄅㄢ bang:ㄅㄤ bao:ㄅㄠ be:ㄅㄜ bei:ㄅㄟ ben:ㄅㄣ beng:ㄅㄥ bi:ㄅㄧ bian:ㄅㄧㄢ biao:ㄅㄧㄠ bie:ㄅㄧㄝ
  bin:ㄅㄧㄣ bing:ㄅㄧㄥ bo:ㄅㄛ bu:ㄅㄨ
  ca:ㄘㄚ cai:ㄘㄞ can:ㄘㄢ cao:ㄘㄠ ce:ㄘㄜ cei:ㄘㄟ cen:ㄘㄣ ceng:ㄘㄥ cha:ㄔㄚ chai:ㄔㄞ chan:ㄔㄢ chang:ㄔㄤ chao:ㄔㄠ
  che:ㄔㄜ chen:ㄔㄣ cheng:ㄔㄥ chi:ㄔ chong:ㄔㄨㄥ chou:ㄔㄡ chu:ㄔㄨ chua:ㄔㄨㄚ chuai:ㄔㄨㄞ chuan:ㄔㄨㄢ chuang:ㄔㄨㄤ
  chui:ㄔㄨㄟ chun:ㄔㄨㄣ chuo:ㄔㄨㄛ ci:ㄘ cong:ㄘㄨㄥ cu:ㄘㄨ cuan:ㄘㄨㄢ cui:ㄘㄨㄟ cun:ㄘㄨㄣ cuo:ㄘㄨㄛ
  da:ㄉㄚ dai:ㄉㄞ dan:ㄉㄢ dang:ㄉㄤ dao:ㄉㄠ de:ㄉㄜ dei:ㄉㄟ den:ㄉㄣ deng:ㄉㄥ di:ㄉㄧ dian:ㄉㄧㄢ diao:ㄉㄧㄠ die:ㄉㄧㄝ
  ding:ㄉㄧㄥ dong:ㄉㄨㄥ dou:ㄉㄡ du:ㄉㄨ duan:ㄉㄨㄢ dui:ㄉㄨㄟ dun:ㄉㄨㄣ duo:ㄉㄨㄛ
  e:ㄜ ei:ㄟ en:ㄣ eng:ㄥ er:ㄦ
  fa:ㄈㄚ fan:ㄈㄢ fang:ㄈㄤ fei:ㄈㄟ fen:ㄈㄣ feng:ㄈㄥ fo:ㄈㄛ fou:ㄈㄡ fu:ㄈㄨ
  ga:ㄍㄚ gai:ㄍㄞ gan:ㄍㄢ gang:ㄍㄤ gao:ㄍㄠ ge:ㄍㄜ gei:ㄍㄟ gen:ㄍㄣ geng:ㄍㄥ gong:ㄍㄨㄥ gou:ㄍㄡ gu:ㄍㄨ gua:ㄍㄨㄚ
  guai:ㄍㄨㄞ guan:ㄍㄨㄢ guang:ㄍㄨㄤ gui:ㄍㄨㄟ gun:ㄍㄨㄣ guo:ㄍㄨㄛ
  ha:ㄏㄚ hai:ㄏㄞ han:ㄏㄢ hang:ㄏㄤ hao:ㄏㄠ he:ㄏㄜ hei:ㄏㄟ hen:ㄏㄣ heng:ㄏㄥ hong:ㄏㄨㄥ hou:ㄏㄡ hu:ㄏㄨ hua:ㄏㄨㄚ
  huai:ㄏㄨㄞ huan:ㄏㄨㄢ huang:ㄏㄨㄤ hui:ㄏㄨㄟ hun:ㄏㄨㄣ huo:ㄏㄨㄛ
  ji:ㄐㄧ jia:ㄐㄧㄚ jian:ㄐㄧㄢ jiang:ㄐㄧㄤ jiao:ㄐㄧㄠ jie:ㄐㄧㄝ jin:ㄐㄧㄣ jing:ㄐㄧㄥ jiong:ㄐㄩㄥ jiu:ㄐㄧㄡ ju:ㄐㄩ juan:ㄐㄩㄢ
  jue:ㄐㄩㄝ jun:ㄐㄩㄣ
  ka:ㄎㄚ kai:ㄎㄞ kan:ㄎㄢ kang:ㄎㄤ kao:ㄎㄠ ke:ㄎㄜ kei:ㄎㄟ ken:ㄎㄣ keng:ㄎㄥ kong:ㄎㄨㄥ kou:ㄎㄡ ku:ㄎㄨ kua:ㄎㄨㄚ
  kuai:ㄎㄨㄞ kuan:ㄎㄨㄢ kuang:ㄎㄨㄤ kui:ㄎㄨㄟ kun:ㄎㄨㄣ kuo:ㄎㄨㄛ
  la:ㄌㄚ lai:ㄌㄞ lan:ㄌㄢ lang:ㄌㄤ lao:ㄌㄠ le:ㄌㄜ lei:ㄌㄟ leng:ㄌㄥ li:ㄌㄧ lia:ㄌㄧㄚ lian:ㄌㄧㄢ liang:ㄌㄧㄤ liao:ㄌㄧㄠ
  lie:ㄌㄧㄝ lin:ㄌㄧㄣ ling:ㄌㄧㄥ liu:ㄌㄧㄡ lo:ㄌㄛ long:ㄌㄨㄥ lou:ㄌㄡ lu:ㄌㄨ luan:ㄌㄨㄢ lüe:ㄌㄩㄝ lun:ㄌㄨㄣ luo:ㄌㄨㄛ lü:ㄌㄩ
  ma:ㄇㄚ mai:ㄇㄞ man:ㄇㄢ mang:ㄇㄤ mao:ㄇㄠ me:ㄇㄜ mei:ㄇㄟ men:ㄇㄣ meng:ㄇㄥ mi:ㄇㄧ mian:ㄇㄧㄢ miao:ㄇㄧㄠ mie:ㄇㄧㄝ
  min:ㄇㄧㄣ ming:ㄇㄧㄥ miu:ㄇㄧㄡ mo:ㄇㄛ mou:ㄇㄡ mu:ㄇㄨ
  na:ㄋㄚ nai:ㄋㄞ nan:ㄋㄢ nang:ㄋㄤ nao:ㄋㄠ ne:ㄋㄜ nei:ㄋㄟ nen:ㄋㄣ neng:ㄋㄥ ni:ㄋㄧ nian:ㄋㄧㄢ niang:ㄋㄧㄤ niao:ㄋㄧㄠ
  nie:ㄋㄧㄝ nin:ㄋㄧㄣ ning:ㄋㄧㄥ niu:ㄋㄧㄡ nong:ㄋㄨㄥ nou:ㄋㄡ nu:ㄋㄨ nuan:ㄋㄨㄢ nüe:ㄋㄩㄝ nun:ㄋㄨㄣ nuo:ㄋㄨㄛ nü:ㄋㄩ
  o:ㄛ ou:ㄡ
  pa:ㄆㄚ pai:ㄆㄞ pan:ㄆㄢ pang:ㄆㄤ pao:ㄆㄠ pe:ㄆㄜ pei:ㄆㄟ pen:ㄆㄣ peng:ㄆㄥ pi:ㄆㄧ pian:ㄆㄧㄢ piao:ㄆㄧㄠ pie:ㄆㄧㄝ
  pin:ㄆㄧㄣ ping:ㄆㄧㄥ po:ㄆㄛ pou:ㄆㄡ pu:ㄆㄨ
  qi:ㄑㄧ qia:ㄑㄧㄚ qian:ㄑㄧㄢ qiang:ㄑㄧㄤ qiao:ㄑㄧㄠ qie:ㄑㄧㄝ qin:ㄑㄧㄣ qing:ㄑㄧㄥ qiong:ㄑㄩㄥ qiu:ㄑㄧㄡ qu:ㄑㄩ quan:ㄑㄩㄢ
  que:ㄑㄩㄝ qun:ㄑㄩㄣ
  ran:ㄖㄢ rang:ㄖㄤ rao:ㄖㄠ re:ㄖㄜ rei:ㄖㄟ ren:ㄖㄣ reng:ㄖㄥ ri:ㄖ rong:ㄖㄨㄥ rou:ㄖㄡ ru:ㄖㄨ ruan:ㄖㄨㄢ rui:ㄖㄨㄟ
  run:ㄖㄨㄣ ruo:ㄖㄨㄛ
  sa:ㄙㄚ sai:ㄙㄞ san:ㄙㄢ sang:ㄙㄤ sao:ㄙㄠ se:ㄙㄜ sei:ㄙㄟ sen:ㄙㄣ seng:ㄙㄥ sha:ㄕㄚ shai:ㄕㄞ shan:ㄕㄢ shang:ㄕㄤ
  shao:ㄕㄠ she:ㄕㄜ shei:ㄕㄟ shen:ㄕㄣ sheng:ㄕㄥ shi:ㄕ shou:ㄕㄡ shu:ㄕㄨ shua:ㄕㄨㄚ shuai:ㄕㄨㄞ shuan:ㄕㄨㄢ shuang:ㄕㄨㄤ
  shui:ㄕㄨㄟ shun:ㄕㄨㄣ shuo:ㄕㄨㄛ si:ㄙ song:ㄙㄨㄥ sou:ㄙㄡ su:ㄙㄨ suan:ㄙㄨㄢ sui:ㄙㄨㄟ sun:ㄙㄨㄣ suo:ㄙㄨㄛ
  ta:ㄊㄚ tai:ㄊㄞ tan:ㄊㄢ tang:ㄊㄤ tao:ㄊㄠ te:ㄊㄜ tei:ㄊㄟ teng:ㄊㄥ ti:ㄊㄧ tian:ㄊㄧㄢ tiao:ㄊㄧㄠ tie:ㄊㄧㄝ ting:ㄊㄧㄥ
  tong:ㄊㄨㄥ tou:ㄊㄡ tu:ㄊㄨ tuan:ㄊㄨㄢ tui:ㄊㄨㄟ tun:ㄊㄨㄣ tuo:ㄊㄨㄛ
  wa:ㄨㄚ wai:ㄨㄞ wan:ㄨㄢ wang:ㄨㄤ wei:ㄨㄟ wen:ㄨㄣ weng:ㄨㄥ wo:ㄨㄛ wu:ㄨ
  xi:ㄒㄧ xia:ㄒㄧㄚ xian:ㄒㄧㄢ xiang:ㄒㄧㄤ xiao:ㄒㄧㄠ xie:ㄒㄧㄝ xin:ㄒㄧㄣ xing:ㄒㄧㄥ xiong:ㄒㄩㄥ xiu:ㄒㄧㄡ xu:ㄒㄩ xuan:ㄒㄩㄢ
  xue:ㄒㄩㄝ xun:ㄒㄩㄣ
  ya:ㄧㄚ yan:ㄧㄢ yang:ㄧㄤ yao:ㄧㄠ ye:ㄧㄝ yi:ㄧ yin:ㄧㄣ ying:ㄧㄥ yo:ㄧㄛ yong:ㄩㄥ you:ㄧㄡ yu:ㄩ yuan:ㄩㄢ yue:ㄩㄝ
  yun:ㄩㄣ
  za:ㄗㄚ zai:ㄗㄞ zan:ㄗㄢ zang:ㄗㄤ zao:ㄗㄠ ze:ㄗㄜ zei:ㄗㄟ zen:ㄗㄣ zeng:ㄗㄥ zha:ㄓㄚ zhai:ㄓㄞ zhan:ㄓㄢ zhang:ㄓㄤ
  zhao:ㄓㄠ zhe:ㄓㄜ zhei:ㄓㄟ zhen:ㄓㄣ zheng:ㄓㄥ zhi:ㄓ zhong:ㄓㄨㄥ zhou:ㄓㄡ zhu:ㄓㄨ zhua:ㄓㄨㄚ zhuai:ㄓㄨㄞ zhuan:ㄓㄨㄢ
  zhuang:ㄓㄨㄤ zhui:ㄓㄨㄟ zhun:ㄓㄨㄣ zhuo:ㄓㄨㄛ zi:ㄗ zong:ㄗㄨㄥ zou:ㄗㄡ zu:ㄗㄨ zuan:ㄗㄨㄢ zui:ㄗㄨㄟ zun:ㄗㄨㄣ zuo:ㄗㄨㄛ
`.trim().split(/\s+/).map(pair => pair.split(':')));

// Combining tone diacritics (after NFD normalization): ā á ǎ à → tone 1-4; unmarked = 5 (neutral)
const TONE_DIACRITICS: Record<string, number> = { '̄': 1, '́': 2, '̌': 3, '̀': 4 };
const ZHUYIN_TONE_MARKS = ['', '', 'ˊ', 'ˇ', 'ˋ', '˙'];

/** Splits "nǚ" into ["nü", 3]. */
function splitTone(syllable: string): [string, number] {
  let tone = 5;
  const base = syllable.normalize('NFD')
    .replace(/[̀́̄̌]/g, d => { tone = TONE_DIACRITICS[d]; return ''; })
    .normalize('NFC');
  return [base, tone];
}

/** Ruby text for one reading, e.g. nǐ / ni3 / ㄋㄧˇ / ㄋㄧ3. */
export function formatReading({ pinyin, zhuyin }: PinyinVariant, mode: RubyMode, toneDisplay: ToneDisplay): string {
  if (!pinyin) return '';
  const [base, tone] = splitTone(pinyin);
  if (mode === 'pinyin') return toneDisplay === 'number' ? base + tone : pinyin;
  return zhuyin + (toneDisplay === 'number' ? tone : ZHUYIN_TONE_MARKS[tone]);
}

const isChineseCharacter = (char: string) => char >= '一' && char <= '龻';

function toVariant(p: string): PinyinVariant {
  const base = splitTone(p)[0].toLowerCase();
  return { pinyin: p, zhuyin: ZHUYIN[base] ?? base };
}

/** Converts text to tokens: one per Chinese character, one per run of other characters. */
export function getPinyin(text: string): RubyToken[] {
  const runs = text.match(/[一-龻]|[^一-龻]+/g) ?? [];
  return runs.map(run => {
    const isRuby = isChineseCharacter(run);
    const variants = isRuby
      ? [...new Set<string>(pinyin(run, { toneType: 'symbol', type: 'array', multiple: true }))].map(toVariant)
      : [];
    if (!variants.length) variants.push({ pinyin: '', zhuyin: '' });
    return { text: run, ...variants[0], isRuby, variants, activeVariantIndex: 0 };
  });
}

// ---- History (localStorage) ----
const STORAGE_KEY = 'pinyinRubyHistory';
const MAX_HISTORY_ITEMS = 20;

export function loadHistory(): ConversionItem[] {
  try {
    const items: ConversionItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return items.map(item => ({ ...item, timestamp: new Date(item.timestamp) }));
  } catch {
    return [];
  }
}

export function saveHistory(history: ConversionItem[]): ConversionItem[] {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch { /* ignore */ }
  return history;
}

async function sha256(text: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

/** Adds text as the newest item unless an item with the same SHA-256 exists (then returns its id). */
export async function addToHistory(history: ConversionItem[], inputText: string) {
  const trimmed = inputText.trim();
  if (!trimmed) return { history, duplicateId: null };
  const hash = await sha256(trimmed);
  const existing = history.find(h => h.hash === hash);
  if (existing) return { history, duplicateId: existing.id };
  const id = Math.max(0, ...history.map(h => h.id)) + 1;
  const item = { id, inputText: trimmed, timestamp: new Date(), hash };
  return { history: saveHistory([item, ...history].slice(0, MAX_HISTORY_ITEMS)), duplicateId: null };
}

/** "Just now", "5m ago", "3h ago", "2d ago", or "Jan 15". */
export function formatTime(dt: Date): string {
  const minutes = (Date.now() - dt.getTime()) / 60000;
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  if (minutes < 10080) return `${Math.floor(minutes / 1440)}d ago`;
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
