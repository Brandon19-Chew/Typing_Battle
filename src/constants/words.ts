import { Language } from '@/types/game';

const englishWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "great", "between", "need",
  "large", "often", "hand", "high", "place", "hold", "turn", "fact", "keep",
  "children", "side", "feet", "car", "mile", "night", "walk", "white",
  "sea", "began", "grow", "took", "river", "four", "carry", "state", "once",
  "book", "hear", "stop", "without", "second", "late", "miss", "idea",
  "eat", "face", "watch", "far", "indian", "real", "almost", "let", "above",
  "girl", "sometimes", "mountain", "cut", "young", "talk", "soon", "list",
  "song", "leave", "family", "body", "music", "color", "stand", "sun",
  "questions", "fish", "area", "mark", "dog", "horse", "birds", "problem",
  "complete", "room", "knew", "since", "ever", "piece", "told", "usually",
  "didn", "friends", "easy", "heard", "order", "red", "door", "sure",
  "become", "top", "ship", "across", "today", "during", "short", "better",
  "best", "however", "low", "hours", "black", "products", "happened",
  "whole", "measure", "remember", "early", "waves", "reached", "listen",
  "wind", "rock", "space", "covered", "fast", "several", "hold", "himself",
  "toward", "five", "step", "morning", "passed", "vowel", "true", "hundred",
  "against", "pattern", "numeral", "table", "north", "slowly", "money",
  "map", "farm", "pulled", "draw", "voice", "power", "town", "fine",
  "drive", "warm", "free", "bring", "explain", "rain", "dream", "evening",
  "condition", "feed", "tool", "total", "basic", "smell", "valley", "nor",
  "double", "seat", "arrive", "master", "track", "parent", "shore",
  "division", "sheet", "substance", "favor", "connect", "post", "spend",
  "chord", "fat", "glad", "original", "share", "station", "dad", "bread",
  "charge", "proper", "bar", "offer", "segment", "slave", "duck", "instant",
  "market", "degree", "populate", "chick", "dear", "enemy", "reply", "drink",
  "occur", "support", "speech", "nature", "range", "steam", "motion",
  "path", "liquid", "log", "meant", "quotient", "teeth", "shell", "neck",
];

const chineseTexts = [
  "时间就是金钱，效率就是生命。",
  "学而时习之，不亦说乎？",
  "知识改变命运，学习成就未来。",
  "天行健，君子以自强不息。",
  "人生如旅，且行且珍惜。",
  "努力奋斗，创造美好生活。",
  "科技改变世界，创新引领未来。",
  "读书百遍，其义自见。",
  "千里之行，始于足下。",
  "不积跬步，无以至千里。",
  "业精于勤，荒于嬉。",
  "锲而不舍，金石可镂。",
  "海内存知己，天涯若比邻。",
  "会当凌绝顶，一览众山小。",
  "春眠不觉晓，处处闻啼鸟。",
  "床前明月光，疑是地上霜。",
  "人生得意须尽欢，莫使金樽空对月。",
  "问渠那得清如许，为有源头活水来。",
  "不识庐山真面目，只缘身在此山中。",
  "两岸猿声啼不住，轻舟已过万重山。",
];

const japaneseTexts = [
  "はやくタイピングができるようになりたい。",
  "にほんごのれんしゅうをまいにちしています。",
  "きょうはいいてんきですね。",
  "わたしはにほんごがすきです。",
  "たのしいゲームをしましょう。",
  "はるのはなはとてもきれいです。",
  "まいにちがんばってべんきょうします。",
  "ともだちとたのしいじかんをすごしました。",
  "あたらしいことにちょうせんするのはたのしい。",
  "ゆめにむかってまいにちどりょくしています。",
  "コンピューターのスキルをみがいています。",
  "スピードとせいかくさをきたえましょう。",
  "キーボードをはやくうてるようになりたい。",
  "れんしゅうをかさねることでうまくなります。",
  "チャレンジすることをたのしんでいます。",
  "タイピングのたつじんをめざしています。",
  "にほんのぶんかはとてもゆたかです。",
  "むかしむかし、あるところにおじいさんとおばあさんがいました。",
  "はじめてのチャレンジにどきどきしています。",
  "さくらのはなびらがかぜにまっています。",
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateText(language: Language, targetLength: number = 200): string {
  if (language === 'english') {
    const shuffled = shuffle(englishWords);
    let text = '';
    let i = 0;
    while (text.length < targetLength) {
      text += (text ? ' ' : '') + shuffled[i % shuffled.length];
      i++;
    }
    return text.trim();
  }

  if (language === 'chinese') {
    const shuffled = shuffle(chineseTexts);
    let text = '';
    let i = 0;
    while (text.length < targetLength) {
      text += shuffled[i % shuffled.length];
      i++;
    }
    return text.slice(0, Math.min(text.length, targetLength + 20));
  }

  if (language === 'japanese') {
    const shuffled = shuffle(japaneseTexts);
    let text = '';
    let i = 0;
    while (text.length < targetLength) {
      text += shuffled[i % shuffled.length];
      i++;
    }
    return text.slice(0, Math.min(text.length, targetLength + 30));
  }

  return '';
}
