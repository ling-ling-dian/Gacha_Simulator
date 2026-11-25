export type GameSlug = "genshin" | "hsr" | "zzz" | "lads" | "nikki";

export type PackKind = "double" | "topup" | "monthly" | "bundle";

export type ShopPack = {
  id: string;
  name: string;
  priceCny: number;
  crystals: number;
  kind: PackKind;
  maxQty: number;
  note?: string;
};

export type PoolDef = {
  key: string;
  label: string;
  hardPity: number;
  /** 非保底时，这一发五星是「指定目标」的概率 */
  featuredRate: number;
  /** 含保底的五星综合概率，用来估算期望 */
  consolidatedFiveRate: number;
  /** 连续几次「歪了再大保底」后，下一次小保底必中。原神捕获明光为 3 */
  radianceAfterCycles?: number;
  model: "rateup" | "nikki";
  setSize?: number;
  unit: string;
};

export type ItemDef = {
  id: string;
  name: string;
  kind: string;
  rarity: number;
  pool: string;
  maxCopies: number;
  imageUrl?: string | null;
};

export type GameDef = {
  slug: GameSlug;
  name: string;
  accent: string;
  /** 首页竖条立绘。文件放 public/covers/ */
  coverUrl: string;
  bgArtUrl: string | null;
  currencyName: string;
  currencyPerPull: number;
  pools: PoolDef[];
  packs: ShopPack[];
  items: ItemDef[];
  notes: string[];
};

function item(
  id: string,
  name: string,
  pool: string,
  maxCopies: number,
  kind = "character",
): ItemDef {
  return { id, name, kind, rarity: 5, pool, maxCopies, imageUrl: null };
}

function mihoyoPacks(prefix: string, monthlyName: string, perPull: number): ShopPack[] {
  const doubles: Array<[string, number, number, number]> = [
    ["6 元首充双倍", 6, 120, 1],
    ["30 元首充双倍", 30, 630, 1],
    ["98 元首充双倍", 98, 2070, 1],
    ["198 元首充双倍", 198, 4220, 1],
    ["328 元首充双倍", 328, 7160, 1],
    ["648 元首充双倍", 648, 14560, 1],
  ];
  const topups: Array<[string, number, number]> = [
    ["6 元直充", 6, 60],
    ["30 元直充", 30, 330],
    ["98 元直充", 98, 1090],
    ["198 元直充", 198, 2240],
    ["328 元直充", 328, 3880],
    ["648 元直充", 648, 8080],
  ];
  return [
    ...doubles.map(([name, price, crystals], i) => ({
      id: `${prefix}-d${i}`,
      name,
      priceCny: price,
      crystals,
      kind: "double" as const,
      maxQty: 1,
      note: "双倍只算基础档，赠送部分按国服商店常见规则加在外面",
    })),
    ...topups.map(([name, price, crystals], i) => ({
      id: `${prefix}-t${i}`,
      name,
      priceCny: price,
      crystals,
      kind: "topup" as const,
      maxQty: 999,
    })),
    {
      id: `${prefix}-month`,
      name: monthlyName,
      priceCny: 30,
      crystals: 3000,
      kind: "monthly",
      maxQty: 36,
      note: "30 天每天登录才拿齐，不是立刻到账",
    },
    {
      id: `${prefix}-bundle`,
      name: "版本礼包（示例，10 抽）",
      priceCny: 68,
      crystals: perPull * 10,
      kind: "bundle",
      maxQty: 1,
      note: "占位示例。当期密约、累充礼包价格以商店为准，可在数据里替换",
    },
  ];
}

export const games: GameDef[] = [
  {
    slug: "genshin",
    name: "原神",
    accent: "#e0a45a",
    coverUrl: "/covers/genshin.jpg",
    bgArtUrl: null,
    currencyName: "原石",
    currencyPerPull: 160,
    pools: [
      {
        key: "character",
        label: "角色活动祈愿",
        hardPity: 90,
        featuredRate: 0.5,
        consolidatedFiveRate: 0.016,
        radianceAfterCycles: 3,
        model: "rateup",
        unit: "个角色",
      },
      {
        key: "weapon",
        label: "神铸赋形",
        hardPity: 80,
        featuredRate: 0.375,
        consolidatedFiveRate: 0.0185,
        model: "rateup",
        unit: "把武器",
      },
    ],
    packs: mihoyoPacks("genshin", "空月祝福", 160),
    items: [
      item("genshin-hutao", "胡桃", "character", 7),
      item("genshin-raiden", "雷电将军", "character", 7),
      item("genshin-nahida", "纳西妲", "character", 7),
      item("genshin-furina", "芙宁娜", "character", 7),
      item("genshin-zhongli", "钟离", "character", 7),
      item("genshin-yelan", "夜兰", "character", 7),
      item("genshin-mavuika", "玛薇卡", "character", 7),
      item("genshin-neuv", "那维莱特", "character", 7),
      item("genshin-homa", "护摩之杖", "weapon", 5, "weapon"),
      item("genshin-engulfing", "薙草之稻光", "weapon", 5, "weapon"),
      item("genshin-aqua", "若水", "weapon", 5, "weapon"),
    ],
    notes: [
      "角色池 90 抽硬保底，小保底 50%。歪了下一发五星必是 UP。5.0 起捕获明光：连续 3 次「歪了再靠大保底出 UP」后，下一次小保底必中。",
      "武器池 80 抽。定轨命定值满 1 点后，下一把五星是指定武器。命定值不跨武器池继承，抽数保底继承。",
      "最坏按硬保底、且捕获明光只算必触发的那次。期望按综合概率估算，不是官方逐抽公式。",
      "满命按 7 份（0 命到 6 命），武器精炼满按 5 份。",
    ],
  },
  {
    slug: "hsr",
    name: "崩坏：星穹铁道",
    accent: "#7eb6ff",
    coverUrl: "/covers/hsr.jpg",
    bgArtUrl: null,
    currencyName: "星琼",
    currencyPerPull: 160,
    pools: [
      {
        key: "character",
        label: "角色活动跃迁",
        hardPity: 90,
        featuredRate: 0.5,
        consolidatedFiveRate: 0.016,
        model: "rateup",
        unit: "个角色",
      },
      {
        key: "lightcone",
        label: "光锥活动跃迁",
        hardPity: 80,
        featuredRate: 0.75,
        consolidatedFiveRate: 0.018,
        model: "rateup",
        unit: "张光锥",
      },
    ],
    packs: mihoyoPacks("hsr", "列车补给凭证", 160),
    items: [
      item("hsr-firefly", "流萤", "character", 7),
      item("hsr-acheron", "黄泉", "character", 7),
      item("hsr-kafka", "卡芙卡", "character", 7),
      item("hsr-sunday", "星期日", "character", 7),
      item("hsr-robin", "知更鸟", "character", 7),
      item("hsr-lc-firefly", "流萤专属光锥", "lightcone", 5, "light_cone"),
      item("hsr-lc-acheron", "黄泉专属光锥", "lightcone", 5, "light_cone"),
    ],
    notes: [
      "角色 90 / 50%，最坏 180 出 1 个 UP。光锥 80 / 75%，歪了下一发必是 UP，最坏 160。",
      "没有原神那种捕获明光。满星魂按 7 份，光锥叠影满按 5 份。",
      "星琼 160 一点抽。小月卡 30 元合计约 3000 星琼，分 30 天领取。",
    ],
  },
  {
    slug: "zzz",
    name: "绝区零",
    accent: "#ff8a3d",
    coverUrl: "/covers/zzz.jpg",
    bgArtUrl: null,
    currencyName: "菲林",
    currencyPerPull: 160,
    pools: [
      {
        key: "agent",
        label: "独家频段",
        hardPity: 90,
        featuredRate: 0.5,
        consolidatedFiveRate: 0.016,
        model: "rateup",
        unit: "个代理人",
      },
      {
        key: "wengine",
        label: "音擎频段",
        hardPity: 80,
        featuredRate: 0.75,
        consolidatedFiveRate: 0.018,
        model: "rateup",
        unit: "把音擎",
      },
    ],
    packs: mihoyoPacks("zzz", "绳网会员", 160),
    items: [
      item("zzz-ellen", "艾莲", "agent", 7),
      item("zzz-zhu", "朱鸢", "agent", 7),
      item("zzz-qingyi", "青衣", "agent", 7),
      item("zzz-jane", "简", "agent", 7),
      item("zzz-burnice", "柏妮思", "agent", 7),
      item("zzz-we-ellen", "艾莲专属音擎", "wengine", 5, "wengine"),
    ],
    notes: [
      "独家频段 90 / 50%，音擎 80 / 75%，规则和星铁同型。满特写按 7 份估算。",
      "独家重映的「本期第一个 S 必中」请把进度勾成「下一发必出目标」。",
      "邦布池不进主计算器。",
    ],
  },
  {
    slug: "lads",
    name: "恋与深空",
    accent: "#e38aa9",
    coverUrl: "/covers/lads.jpg",
    bgArtUrl: null,
    currencyName: "钻石",
    currencyPerPull: 150,
    pools: [
      {
        key: "solo",
        label: "单人限定许愿",
        hardPity: 70,
        featuredRate: 0.5,
        consolidatedFiveRate: 0.02,
        model: "rateup",
        unit: "张思念",
      },
      {
        key: "multi",
        label: "多人限定（定向）",
        hardPity: 70,
        featuredRate: 0.25,
        consolidatedFiveRate: 0.02,
        model: "rateup",
        unit: "张思念",
      },
    ],
    packs: mihoyoPacks("lads", "深空月卡（估算）", 150),
    items: [
      item("lads-xavier", "沈星回·当期五星思念", "solo", 3, "memory"),
      item("lads-zayne", "黎深·当期五星思念", "solo", 3, "memory"),
      item("lads-rafayel", "祁煜·当期五星思念", "solo", 3, "memory"),
      item("lads-sylus", "秦彻·当期五星思念", "solo", 3, "memory"),
      item("lads-caleb", "夏以昼·当期五星思念", "solo", 3, "memory"),
      item("lads-multi-xavier", "沈星回·多人池定向", "multi", 3, "memory"),
      item("lads-multi-zayne", "黎深·多人池定向", "multi", 3, "memory"),
      item("lads-multi-rafayel", "祁煜·多人池定向", "multi", 3, "memory"),
    ],
    notes: [
      "五星硬保底 70。第 61 抽起概率上升，期望用综合概率估算。",
      "单人池 UP 占五星 50%，歪了下一张五星必是 UP，最坏 140。",
      "多人池定向：第一张五星不是定向目标时，下一张必是。最坏同样 140。定向不跨期保留。",
      "日冕活动常有累计 150 抽出自选，能把「两张套装」压到 150。这里默认不算这条活动福利，你可以在「额外抽数」里手动扣掉。",
      "钻石档位按米哈游同型估算，1 抽 = 150 钻。和实机商店不一致时，以商店为准改种子数据。",
    ],
  },
  {
    slug: "nikki",
    name: "无限暖暖",
    accent: "#f2a7c3",
    coverUrl: "/covers/nikki.jpg",
    bgArtUrl: null,
    currencyName: "钻石",
    currencyPerPull: 120,
    pools: [
      {
        key: "outfit",
        label: "五星限定共鸣",
        hardPity: 20,
        featuredRate: 1,
        consolidatedFiveRate: 0.0606,
        model: "nikki",
        setSize: 9,
        unit: "套",
      },
    ],
    packs: mihoyoPacks("nikki", "月卡（估算）", 120),
    items: [
      item("nikki-set-demo", "示例五星套装（9 件）", "outfit", 2, "outfit_set"),
      item("nikki-piece-demo", "指定单件（大裙子等）", "outfit", 1, "outfit_piece"),
    ],
    notes: [
      "五星部件最多 20 抽一件。集齐前保新，不重复。9 件套最坏 180 抽。",
      "海风的祝颂：每期 1 次，前 5 个五星里必出你选的那一件。只影响「要某一件」，不影响「整套还要凑齐几件」。",
      "复刻继承该池历史抽数，不继承别的池。集齐后再抽重复件不再保新，第二套按再抽 180 估算，实际可能更亏。",
      "1 抽 = 120 钻是估算，不是官方确认值。暖暖商店档位也先按常见直充结构占位。",
    ],
  },
];

export function getGame(slug: string): GameDef | undefined {
  return games.find((g) => g.slug === slug);
}
