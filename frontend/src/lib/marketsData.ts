export interface TimeSeriesPoint {
  time: string;
  price: number;
  volume?: number;
}

export interface NewsArticle {
  id: string;
  category: "Personal-finance" | "Markets" | "Technology" | "Energy" | "Crypto";
  title: string;
  timestamp: string;
  source: string;
  imageUrl?: string;
  summary: string;
}

export interface ConstituentHolding {
  name: string;
  ticker: string;
  weight: number;
  price: number;
  changePct: number;
}

export interface SectorWeight {
  sector: string;
  percentage: number;
  color: string;
}

export interface SecurityData {
  symbol: string;
  tickerCode: string;
  name: string;
  assetType: "Index" | "Stock" | "Crypto" | "Commodity" | "Currency" | "Future";
  category: string;
  exchange: string;
  currency: string;
  marketStatus: "Market closed" | "Market open";
  price: number;
  changeDollar: number;
  changePct: number;
  timestamp: string;
  prevClose: number;
  open: number;
  dayLow: number;
  dayHigh: number;
  yearLow: number;
  yearHigh: number;
  yearReturnPct: number;
  ytdReturnPct: number;
  peRatio?: number | string;
  priceToBookRatio?: number | string;
  priceToSalesRatio?: number | string;
  thirtyDayAvgVolume: string;
  eps?: number | string;
  lastDividendReported?: number | string;
  marketCap?: string;
  aboutTitle: string;
  aboutText: string[];
  sectorWeights?: SectorWeight[];
  topHoldings?: ConstituentHolding[];
  methodologyDetails?: { label: string; value: string }[];
  timeSeries: {
    "1D": TimeSeriesPoint[];
    "1M": TimeSeriesPoint[];
    "6M": TimeSeriesPoint[];
    "YTD": TimeSeriesPoint[];
    "1Y": TimeSeriesPoint[];
    "5Y": TimeSeriesPoint[];
  };
  newsArticles: NewsArticle[];
}

export interface RegionalIndex {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  sparkline: number[];
}

export interface TopSecurityCard {
  symbol: string;
  name: string;
  price: string;
  changePct: string;
  isPositive: boolean;
  category: string;
}

export const TOP_SECURITIES_LIST: TopSecurityCard[] = [
  { symbol: "SPX", name: "S&P 500", price: "7,650.50", changePct: "▲ 0.17%", isPositive: true, category: "Indices" },
  { symbol: "NDX", name: "Nasdaq", price: "26,522.54", changePct: "▲ 0.39%", isPositive: true, category: "Indices" },
  { symbol: "FTSE", name: "FTSE 100", price: "10,659.13", changePct: "▼ 1.45%", isPositive: false, category: "Indices" },
  { symbol: "DJI", name: "Dow Jones", price: "51,682.64", changePct: "▼ 0.18%", isPositive: false, category: "Indices" },
  { symbol: "RUT", name: "Russell 2000", price: "2,860.40", changePct: "▼ 0.50%", isPositive: false, category: "Indices" },
  { symbol: "N225", name: "Nikkei 225", price: "65,018.95", changePct: "▲ 1.38%", isPositive: true, category: "Indices" },
  { symbol: "HSI", name: "Hang Seng", price: "24,750.78", changePct: "▲ 0.60%", isPositive: true, category: "Indices" },
  { symbol: "DAX", name: "DAX", price: "25,304.06", changePct: "▼ 1.60%", isPositive: false, category: "Indices" },
  { symbol: "CL", name: "Crude Oil", price: "100.30", changePct: "▼ 1.58%", isPositive: false, category: "Commodities" },
  { symbol: "GLD", name: "Gold", price: "4,424.90", changePct: "▲ 0.57%", isPositive: true, category: "Commodities" },
  { symbol: "EURUSD", name: "EUR/USD", price: "1.15", changePct: "▲ 0.09%", isPositive: true, category: "Currencies" },
  { symbol: "GBPUSD", name: "GBP/USD", price: "1.34", changePct: "▲ 0.27%", isPositive: true, category: "Currencies" },
  { symbol: "NVDA", name: "NVIDIA Corp", price: "128.50", changePct: "▲ 3.20%", isPositive: true, category: "Stocks" },
  { symbol: "BTC", name: "Bitcoin / USD", price: "65,420.00", changePct: "▲ 2.45%", isPositive: true, category: "Crypto" },
];

export const DATA_CATEGORIES = [
  {
    id: "stocks",
    title: "Stocks",
    items: [
      { name: "NVIDIA Corp", symbol: "NVDA", price: "128.50", change: "+3.20%" },
      { name: "Apple Inc.", symbol: "AAPL", price: "224.30", change: "+0.85%" },
      { name: "Microsoft Corp", symbol: "MSFT", price: "448.10", change: "-0.40%" },
      { name: "Tesla Inc.", symbol: "TSLA", price: "249.80", change: "+4.12%" },
    ],
  },
  {
    id: "crypto",
    title: "Crypto / BTC",
    items: [
      { name: "Bitcoin", symbol: "BTC", price: "65,420.00", change: "+2.45%" },
      { name: "Ethereum", symbol: "ETH", price: "3,480.20", change: "+1.90%" },
      { name: "Solana", symbol: "SOL", price: "152.60", change: "+5.10%" },
    ],
  },
  {
    id: "commodities",
    title: "Commodities / Gold",
    items: [
      { name: "Gold Comex", symbol: "GLD", price: "4,424.90", change: "+0.57%" },
      { name: "Silver Comex", symbol: "SLV", price: "32.14", change: "+1.12%" },
      { name: "Crude Oil (WTI)", symbol: "CL", price: "100.30", change: "-1.58%" },
    ],
  },
  {
    id: "futures",
    title: "Futures",
    items: [
      { name: "Generic 1st 'CO' Future", symbol: "CO1", price: "103.87", change: "-0.91%" },
      { name: "S&P 500 E-Mini", symbol: "ES1", price: "7,658.00", change: "+0.20%" },
      { name: "10-Yr US T-Note", symbol: "TY1", price: "110.16", change: "+0.14%" },
    ],
  },
  {
    id: "rates",
    title: "Rates & Bonds",
    items: [
      { name: "US 10 Year Yield", symbol: "US10Y", price: "4.28%", change: "+0.02%" },
      { name: "US 2 Year Yield", symbol: "US02Y", price: "4.56%", change: "-0.01%" },
      { name: "US 30 Year Yield", symbol: "US30Y", price: "4.45%", change: "+0.03%" },
    ],
  },
  {
    id: "currencies",
    title: "Currencies",
    items: [
      { name: "EUR/USD", symbol: "EURUSD", price: "1.15", change: "+0.09%" },
      { name: "GBP/USD", symbol: "GBPUSD", price: "1.34", change: "+0.27%" },
      { name: "USD/JPY", symbol: "USDJPY", price: "156.40", change: "-0.32%" },
    ],
  },
  {
    id: "sectors",
    title: "Sectors",
    items: [
      { name: "Technology (XLK)", symbol: "XLK", price: "235.40", change: "+1.15%" },
      { name: "Financials (XLF)", symbol: "XLF", price: "43.20", change: "-0.30%" },
      { name: "Energy (XLE)", symbol: "XLE", price: "91.80", change: "-1.45%" },
    ],
  },
  {
    id: "energy",
    title: "Energy",
    items: [
      { name: "Brent Crude", symbol: "BRENT", price: "84.50", change: "-1.20%" },
      { name: "Natural Gas", symbol: "NG", price: "2.84", change: "+3.10%" },
    ],
  },
];

export const REGIONAL_GLANCE: Record<string, RegionalIndex[]> = {
  Americas: [
    { symbol: "DJI", name: "Dow Jones Indu...", price: 51682.64, changePct: -0.18, sparkline: [51800, 51750, 51600, 51650, 51580, 51700, 51682] },
    { symbol: "SPX", name: "S&P 500 INDEX", price: 7650.50, changePct: 0.17, sparkline: [7637, 7632, 7624, 7630, 7642, 7648, 7650.5] },
    { symbol: "NDX", name: "NASDAQ Comp...", price: 26522.54, changePct: 0.39, sparkline: [26400, 26380, 26420, 26490, 26510, 26522.5] },
    { symbol: "B500", name: "Bloomberg 500 I...", price: 2768.99, changePct: 0.15, sparkline: [2760, 2758, 2762, 2765, 2767, 2768.99] },
    { symbol: "TSX", name: "S&P/TSX Comp...", price: 35806.65, changePct: -0.19, sparkline: [35900, 35880, 35820, 35800, 35810, 35806.65] },
    { symbol: "MXX", name: "S&P/BMV IPC", price: 63375.93, changePct: -0.78, sparkline: [63800, 63700, 63500, 63420, 63390, 63375.93] },
  ],
  Europe: [
    { symbol: "FTSE", name: "FTSE 100", price: 10659.13, changePct: -1.45, sparkline: [10800, 10750, 10700, 10680, 10659] },
    { symbol: "DAX", name: "DAX Performance", price: 25304.06, changePct: -1.60, sparkline: [25600, 25500, 25420, 25380, 25304] },
    { symbol: "CAC", name: "CAC 40", price: 8120.45, changePct: -0.85, sparkline: [8200, 8180, 8150, 8130, 8120] },
    { symbol: "SX5E", name: "Euro Stoxx 50", price: 5410.20, changePct: -1.10, sparkline: [5480, 5460, 5430, 5420, 5410] },
  ],
  APAC: [
    { symbol: "N225", name: "Nikkei 225", price: 65018.95, changePct: 1.38, sparkline: [64200, 64400, 64650, 64800, 65018] },
    { symbol: "HSI", name: "Hang Seng Index", price: 24750.78, changePct: 0.60, sparkline: [24500, 24580, 24620, 24700, 24750] },
    { symbol: "SHCOMP", name: "Shanghai Composite", price: 3412.50, changePct: 0.42, sparkline: [3390, 3400, 3405, 3410, 3412] },
    { symbol: "AS51", name: "S&P/ASX 200", price: 8320.10, changePct: 0.25, sparkline: [8290, 8305, 8312, 8318, 8320] },
  ],
  "Your List": [
    { symbol: "NVDA", name: "NVIDIA Corp", price: 128.50, changePct: 3.20, sparkline: [124, 125, 126.5, 127.8, 128.5] },
    { symbol: "BTC", name: "Bitcoin / USD", price: 65420.00, changePct: 2.45, sparkline: [63800, 64200, 64800, 65100, 65420] },
    { symbol: "GLD", name: "Gold COMEX", price: 4424.90, changePct: 0.57, sparkline: [4390, 4405, 4412, 4420, 4424.9] },
    { symbol: "AAPL", name: "Apple Inc.", price: 224.30, changePct: 0.85, sparkline: [222, 222.8, 223.5, 224, 224.3] },
  ],
};

export const RECENTLY_VIEWED = [
  { symbol: "SPX", name: "S&P 500 INDEX", price: "7,650.50 USD", changePct: "▲ 0.17%", isPositive: true },
  { symbol: "CO1", name: "Generic 1st 'CO' Future", price: "103.87 USD/bbl.", changePct: "▼ 0.91%", isPositive: false },
  { symbol: "NVDA", name: "NVIDIA Corp", price: "128.50 USD", changePct: "▲ 3.20%", isPositive: true },
  { symbol: "BTC", name: "Bitcoin / USD", price: "65,420.00 USD", changePct: "▲ 2.45%", isPositive: true },
  { symbol: "GLD", name: "Gold COMEX", price: "4,424.90 USD", changePct: "▲ 0.57%", isPositive: true },
];

export const SECURITIES_DATABASE: Record<string, SecurityData> = {
  SPX: {
    symbol: "SPX",
    tickerCode: "SPX:IND",
    name: "S&P 500 INDEX",
    assetType: "Index",
    category: "Indices",
    exchange: "INDEXSP",
    currency: "USD",
    marketStatus: "Market closed",
    price: 7650.50,
    changeDollar: 12.74,
    changePct: 0.17,
    timestamp: "As of 5:29 PM EDT 09/18/26.",
    prevClose: 7637.76,
    open: 7657.17,
    dayLow: 7610.52,
    dayHigh: 7657.17,
    yearLow: 6316.91,
    yearHigh: 7816.70,
    yearReturnPct: 16.12,
    ytdReturnPct: 11.76,
    peRatio: 26.24,
    priceToBookRatio: 5.60,
    priceToSalesRatio: 3.52,
    thirtyDayAvgVolume: "867,156,801.57",
    eps: 327.99,
    lastDividendReported: 0.04,
    marketCap: "$49.2T",
    aboutTitle: "About S&P 500 INDEX",
    aboutText: [
      "The S&P 500® is widely regarded as the best single gauge of large-cap U.S. equities and serves as the foundation for a wide range of investment products.",
      "The index includes 500 leading companies and captures approximately 80% coverage of available market capitalization across eleven GICS sectors.",
      "Constituent weights are determined via float-adjusted market capitalization, ensuring high liquidity and tracking feasibility for institutional portfolio mandates worldwide.",
    ],
    sectorWeights: [
      { sector: "Information Technology", percentage: 29.8, color: "#2563EB" },
      { sector: "Financials", percentage: 13.4, color: "#059669" },
      { sector: "Health Care", percentage: 11.9, color: "#D97706" },
      { sector: "Consumer Discretionary", percentage: 10.2, color: "#7C3AED" },
      { sector: "Communication Services", percentage: 8.9, color: "#EA580C" },
      { sector: "Industrials", percentage: 8.4, color: "#475569" },
      { sector: "Consumer Staples", percentage: 6.1, color: "#0D9488" },
      { sector: "Energy", percentage: 3.8, color: "#DC2626" },
      { sector: "Utilities & Real Estate", percentage: 7.5, color: "#64748B" },
    ],
    topHoldings: [
      { name: "Apple Inc.", ticker: "AAPL", weight: 7.12, price: 224.30, changePct: 0.85 },
      { name: "Microsoft Corp.", ticker: "MSFT", weight: 6.84, price: 448.10, changePct: -0.40 },
      { name: "NVIDIA Corp.", ticker: "NVDA", weight: 6.25, price: 128.50, changePct: 3.20 },
      { name: "Amazon.com Inc.", ticker: "AMZN", weight: 3.65, price: 186.40, changePct: 1.10 },
      { name: "Alphabet Inc. Class A", ticker: "GOOGL", weight: 2.30, price: 179.20, changePct: 0.45 },
      { name: "Meta Platforms Inc.", ticker: "META", weight: 2.25, price: 512.60, changePct: 1.80 },
      { name: "Berkshire Hathaway B", ticker: "BRK.B", weight: 1.70, price: 445.00, changePct: -0.15 },
      { name: "Eli Lilly & Co.", ticker: "LLY", weight: 1.45, price: 920.30, changePct: 0.90 },
      { name: "Broadcom Inc.", ticker: "AVGO", weight: 1.38, price: 168.20, changePct: 2.40 },
      { name: "JPMorgan Chase & Co.", ticker: "JPM", weight: 1.25, price: 212.50, changePct: -0.35 },
    ],
    methodologyDetails: [
      { label: "Calculation Methodology", value: "Float-Adjusted Market Cap Weighted" },
      { label: "Rebalancing Frequency", value: "Quarterly (March, June, September, December)" },
      { label: "Base Date", value: "1941 - 1943 = 10" },
      { label: "Benchmark Provider", value: "S&P Dow Jones Indices" },
    ],
    timeSeries: {
      "1D": [
        { time: "09:30", price: 7657.17 },
        { time: "10:00", price: 7642.30 },
        { time: "10:28", price: 7631.80 },
        { time: "11:00", price: 7635.40 },
        { time: "11:27", price: 7629.90 },
        { time: "12:00", price: 7634.10 },
        { time: "12:25", price: 7610.52 },
        { time: "13:00", price: 7621.50 },
        { time: "13:20", price: 7623.87 },
        { time: "13:45", price: 7628.10 },
        { time: "14:22", price: 7638.60 },
        { time: "15:00", price: 7645.20 },
        { time: "15:21", price: 7649.10 },
        { time: "15:45", price: 7654.80 },
        { time: "16:00", price: 7652.10 },
        { time: "16:18", price: 7650.50 },
        { time: "16:20", price: 7650.50 },
      ],
      "1M": [
        { time: "Aug 19", price: 7480.20 },
        { time: "Aug 24", price: 7510.50 },
        { time: "Aug 29", price: 7545.10 },
        { time: "Sep 03", price: 7520.80 },
        { time: "Sep 08", price: 7590.40 },
        { time: "Sep 13", price: 7620.00 },
        { time: "Sep 18", price: 7650.50 },
      ],
      "6M": [
        { time: "Mar 26", price: 7120.50 },
        { time: "Apr 26", price: 7240.80 },
        { time: "May 26", price: 7380.10 },
        { time: "Jun 26", price: 7490.40 },
        { time: "Jul 26", price: 7580.00 },
        { time: "Aug 26", price: 7540.20 },
        { time: "Sep 26", price: 7650.50 },
      ],
      "YTD": [
        { time: "Jan 02", price: 6845.20 },
        { time: "Feb 15", price: 7010.50 },
        { time: "Apr 01", price: 7230.10 },
        { time: "Jun 01", price: 7450.60 },
        { time: "Aug 01", price: 7580.40 },
        { time: "Sep 18", price: 7650.50 },
      ],
      "1Y": [
        { time: "Oct 25", price: 6588.00 },
        { time: "Dec 25", price: 6820.50 },
        { time: "Feb 26", price: 7010.30 },
        { time: "Apr 26", price: 7240.20 },
        { time: "Jun 26", price: 7490.80 },
        { time: "Aug 26", price: 7560.10 },
        { time: "Sep 26", price: 7650.50 },
      ],
      "5Y": [
        { time: "2021", price: 4400.00 },
        { time: "2022", price: 3850.50 },
        { time: "2023", price: 4769.80 },
        { time: "2024", price: 5850.20 },
        { time: "2025", price: 6900.40 },
        { time: "2026", price: 7650.50 },
      ],
    },
    newsArticles: [
      {
        id: "spx-1",
        category: "Personal-finance",
        title: "S&P 500 Volume Spikes on $7 Trillion Options Day: Markets Wrap",
        timestamp: "updated 14h ago",
        source: "Bloomberg Markets",
        summary: "Massive triple witching quarterly expiry sparks record options turnover across index constituents.",
      },
      {
        id: "spx-2",
        category: "Personal-finance",
        title: "Software Stocks Get New Life From Strong Earnings, AI Warnings",
        timestamp: "updated 22h ago",
        source: "Bloomberg Technology",
        summary: "Enterprise cloud hyperscalers post accelerating backlog figures, lifting overall tech valuations.",
      },
      {
        id: "spx-3",
        category: "Personal-finance",
        title: "Goldman's Snider Says Fears of US Earnings Bubble Are Misplaced",
        timestamp: "Sep 18, 2026",
        source: "Bloomberg Wealth",
        summary: "Cash return yields and corporate balance sheet liquidity buffer against macroeconomic headwinds.",
      },
      {
        id: "spx-4",
        category: "Personal-finance",
        title: "Stocks, Bonds Rise After Fed-Day Drop as Oil Falls: Markets Wrap",
        timestamp: "updated Sep 18, 2026",
        source: "Bloomberg Markets",
        summary: "Disinflationary crude dynamics offset hawkish terminal rate guidance across fixed income desks.",
      },
      {
        id: "spx-5",
        category: "Markets",
        title: "US Stocks Bounce Back From Fed Decision Slump as Oil Falls",
        timestamp: "updated Sep 18, 2026",
        source: "Bloomberg Markets",
        summary: "Broad-based buying propelled the S&P 500 past previous resistance bands into market close.",
      },
      {
        id: "spx-6",
        category: "Markets",
        title: "US Stocks Poised to Turn a Corner, Citadel Securities' Rubner Says",
        timestamp: "updated Sep 17, 2026",
        source: "Bloomberg Intelligence",
        summary: "Systematic CTA fund positioning shifts from short-delta de-leveraging to rapid re-leveraging.",
      },
      {
        id: "spx-7",
        category: "Personal-finance",
        title: "Risk of Midterm 'Blue Wave' Leaves Defense Stocks Out of Favor",
        timestamp: "Sep 17, 2026",
        source: "Bloomberg Politics",
        summary: "Defense contractor multiples face compression as fiscal appropriation scrutiny accelerates.",
      },
      {
        id: "spx-8",
        category: "Personal-finance",
        title: "Stocks Fall as Fed Hikes and Signals More to Come: Markets Wrap",
        timestamp: "Sep 17, 2026",
        source: "Bloomberg Markets",
        summary: "Short duration bond yields reached fresh multi-month cycle highs following policy statement.",
      },
      {
        id: "spx-9",
        category: "Personal-finance",
        title: "Stocks Bull Yardeni Cuts S&P 500 View to 7,900 on Downturn Risks",
        timestamp: "updated Sep 16, 2026",
        source: "Bloomberg Economics",
        summary: "Veteran strategist recalibrates year-end targets accounting for revised global trade forecasts.",
      },
      {
        id: "spx-10",
        category: "Personal-finance",
        title: "Worst Performing S&P Sector Set for More Pain If Fed Hikes",
        timestamp: "updated Sep 16, 2026",
        source: "Bloomberg Markets",
        summary: "Highly leveraged commercial real estate REITs navigate capital refinancing cliffs.",
      },
    ],
  },
  NVDA: {
    symbol: "NVDA",
    tickerCode: "NVDA:US",
    name: "NVIDIA CORP",
    assetType: "Stock",
    category: "Stocks",
    exchange: "NASDAQ",
    currency: "USD",
    marketStatus: "Market open",
    price: 128.50,
    changeDollar: 3.98,
    changePct: 3.20,
    timestamp: "As of 5:29 PM EDT 09/18/26.",
    prevClose: 124.52,
    open: 125.10,
    dayLow: 124.20,
    dayHigh: 129.15,
    yearLow: 45.10,
    yearHigh: 140.76,
    yearReturnPct: 154.20,
    ytdReturnPct: 122.40,
    peRatio: 52.40,
    priceToBookRatio: 38.10,
    priceToSalesRatio: 24.80,
    thirtyDayAvgVolume: "64,210,500.00",
    eps: 2.45,
    lastDividendReported: 0.01,
    marketCap: "$3.15T",
    aboutTitle: "About NVIDIA CORP",
    aboutText: [
      "NVIDIA Corporation designs and manufactures graphics processing units (GPUs), accelerated computing architectures, and end-to-end full-stack AI hardware and software platforms.",
      "The company pioneered GPU-accelerated parallel computing through CUDA and powers sovereign AI infrastructure, hyperscale data centers, autonomous vehicles, and robotics simulation worldwide.",
      "Its flagship Blackwell and Hopper architectures form the de facto global computational foundation for frontier large language models and generative artificial intelligence.",
    ],
    sectorWeights: [
      { sector: "Data Center Compute & Networking", percentage: 87.2, color: "#059669" },
      { sector: "Gaming & AI PC", percentage: 8.5, color: "#2563EB" },
      { sector: "Professional Visualization", percentage: 2.5, color: "#7C3AED" },
      { sector: "Automotive & Robotics", percentage: 1.8, color: "#EA580C" },
    ],
    topHoldings: [
      { name: "Data Center Accelerators (Hopper/Blackwell)", ticker: "DC-AI", weight: 78.4, price: 128.50, changePct: 3.20 },
      { name: "InfiniBand Quantum Networking", ticker: "NET-IB", weight: 12.6, price: 128.50, changePct: 2.10 },
      { name: "GeForce RTX Gaming GPUs", ticker: "PC-GPU", weight: 6.2, price: 128.50, changePct: 0.80 },
      { name: "Omniverse Enterprise Software", ticker: "SW-CUDA", weight: 2.8, price: 128.50, changePct: 4.50 },
    ],
    methodologyDetails: [
      { label: "CEO & Founder", value: "Jensen Huang" },
      { label: "Headquarters", value: "Santa Clara, California, USA" },
      { label: "Primary Index Inclusion", value: "S&P 500, Nasdaq 100, Dow Jones Industrial Average" },
      { label: "Fiscal Year End", value: "January" },
    ],
    timeSeries: {
      "1D": [
        { time: "09:30", price: 125.10 },
        { time: "10:15", price: 126.30 },
        { time: "11:00", price: 125.80 },
        { time: "12:00", price: 126.90 },
        { time: "13:20", price: 127.40 },
        { time: "14:30", price: 128.00 },
        { time: "15:15", price: 128.80 },
        { time: "16:00", price: 128.50 },
      ],
      "1M": [
        { time: "Aug 19", price: 118.20 },
        { time: "Aug 26", price: 121.50 },
        { time: "Sep 02", price: 120.10 },
        { time: "Sep 09", price: 124.30 },
        { time: "Sep 18", price: 128.50 },
      ],
      "6M": [
        { time: "Mar 26", price: 92.40 },
        { time: "May 26", price: 104.80 },
        { time: "Jul 26", price: 119.50 },
        { time: "Sep 26", price: 128.50 },
      ],
      "YTD": [
        { time: "Jan 02", price: 49.50 },
        { time: "Apr 01", price: 88.20 },
        { time: "Jul 01", price: 122.40 },
        { time: "Sep 18", price: 128.50 },
      ],
      "1Y": [
        { time: "Oct 25", price: 42.10 },
        { time: "Feb 26", price: 68.30 },
        { time: "Jun 26", price: 115.00 },
        { time: "Sep 26", price: 128.50 },
      ],
      "5Y": [
        { time: "2021", price: 14.50 },
        { time: "2022", price: 18.20 },
        { time: "2023", price: 48.00 },
        { time: "2024", price: 95.50 },
        { time: "2025", price: 120.00 },
        { time: "2026", price: 128.50 },
      ],
    },
    newsArticles: [
      {
        id: "nvda-1",
        category: "Technology",
        title: "AI-Fueled Profit Growth Set to Flow Through NVIDIA Supply Chain",
        timestamp: "updated 4h ago",
        source: "Bloomberg Tech",
        summary: "Foundry capacity expansions at TSMC indicate sustained orders for custom silicon packaging.",
      },
      {
        id: "nvda-2",
        category: "Markets",
        title: "Hyperscalers Reaffirm Record CapEx Plans Centered on Blackwell GPUs",
        timestamp: "updated 11h ago",
        source: "Bloomberg Enterprise",
        summary: "Cloud providers project combined datacenter capital expenditure exceeding $180 billion.",
      },
      {
        id: "nvda-3",
        category: "Personal-finance",
        title: "Wall Street Lifts Target Prices Ahead of Next-Gen Cluster Shipments",
        timestamp: "Sep 18, 2026",
        source: "Bloomberg Markets",
        summary: "Analysts model gross margin stabilization near 75% as enterprise sovereign contracts ramp.",
      },
    ],
  },
  BTC: {
    symbol: "BTC",
    tickerCode: "BTC:CRYPTO",
    name: "BITCOIN / USD",
    assetType: "Crypto",
    category: "Crypto",
    exchange: "COINBASE",
    currency: "USD",
    marketStatus: "Market open",
    price: 65420.00,
    changeDollar: 1560.00,
    changePct: 2.45,
    timestamp: "As of 5:29 PM EDT 09/18/26.",
    prevClose: 63860.00,
    open: 63910.00,
    dayLow: 63650.00,
    dayHigh: 65920.00,
    yearLow: 26800.00,
    yearHigh: 73750.00,
    yearReturnPct: 98.40,
    ytdReturnPct: 54.10,
    peRatio: "N/A",
    priceToBookRatio: "N/A",
    priceToSalesRatio: "N/A",
    thirtyDayAvgVolume: "$28,450,000,000",
    eps: "N/A",
    lastDividendReported: "N/A",
    marketCap: "$1.28T",
    aboutTitle: "About BITCOIN / USD",
    aboutText: [
      "Bitcoin is a decentralized digital cryptocurrency that can be transferred on the peer-to-peer bitcoin network without intermediate financial institutions.",
      "Transactions are verified by network nodes through cryptography and recorded in a public distributed ledger called a blockchain, secured via Proof-of-Work mining.",
      "With a strictly programmatic supply cap of 21 million coins, Bitcoin functions as institutional digital gold and an uncorrelated macro store-of-value asset.",
    ],
    sectorWeights: [
      { sector: "Circulating Supply", percentage: 94.1, color: "#EAB308" },
      { sector: "Remaining Mineable", percentage: 5.9, color: "#64748B" },
    ],
    methodologyDetails: [
      { label: "Consensus Mechanism", value: "Proof of Work (SHA-256)" },
      { label: "Max Supply", value: "21,000,000 BTC" },
      { label: "Genesis Block Date", value: "January 3, 2009" },
      { label: "Block Halving Interval", value: "Every 210,000 Blocks (~4 Years)" },
    ],
    timeSeries: {
      "1D": [
        { time: "00:00", price: 63860.00 },
        { time: "04:00", price: 63720.00 },
        { time: "08:00", price: 64150.00 },
        { time: "12:00", price: 64800.00 },
        { time: "16:00", price: 65420.00 },
      ],
      "1M": [
        { time: "Aug 19", price: 59200.00 },
        { time: "Aug 29", price: 61400.00 },
        { time: "Sep 08", price: 63100.00 },
        { time: "Sep 18", price: 65420.00 },
      ],
      "6M": [
        { time: "Mar 26", price: 62000.00 },
        { time: "May 26", price: 58500.00 },
        { time: "Jul 26", price: 64200.00 },
        { time: "Sep 26", price: 65420.00 },
      ],
      "YTD": [
        { time: "Jan 02", price: 42200.00 },
        { time: "Mar 15", price: 73000.00 },
        { time: "Jun 01", price: 67500.00 },
        { time: "Sep 18", price: 65420.00 },
      ],
      "1Y": [
        { time: "Oct 25", price: 34500.00 },
        { time: "Jan 26", price: 42000.00 },
        { time: "May 26", price: 62000.00 },
        { time: "Sep 26", price: 65420.00 },
      ],
      "5Y": [
        { time: "2021", price: 29000.00 },
        { time: "2022", price: 16500.00 },
        { time: "2023", price: 42000.00 },
        { time: "2024", price: 68000.00 },
        { time: "2025", price: 62000.00 },
        { time: "2026", price: 65420.00 },
      ],
    },
    newsArticles: [
      {
        id: "btc-1",
        category: "Crypto",
        title: "Bitcoin Surges Past $65,000 as Spot ETF Inflows Accelerate",
        timestamp: "updated 2h ago",
        source: "Bloomberg Crypto",
        summary: "Institutional allocation products record fifth straight week of net positive capital inflows.",
      },
      {
        id: "btc-2",
        category: "Markets",
        title: "Macro Liquidity Conditions Support Digital Asset Accumulation Phase",
        timestamp: "updated 7h ago",
        source: "Bloomberg Wealth",
        summary: "Central bank balance sheet expansion projections provide tailwind for sovereign reserves.",
      },
    ],
  },
  GLD: {
    symbol: "GLD",
    tickerCode: "XAU:CMX",
    name: "GOLD COMEX CONTINUOUS",
    assetType: "Commodity",
    category: "Commodities",
    exchange: "COMEX",
    currency: "USD/t oz.",
    marketStatus: "Market open",
    price: 4424.90,
    changeDollar: 25.10,
    changePct: 0.57,
    timestamp: "As of 5:29 PM EDT 09/18/26.",
    prevClose: 4399.80,
    open: 4402.00,
    dayLow: 4395.20,
    dayHigh: 4431.50,
    yearLow: 2050.00,
    yearHigh: 4450.00,
    yearReturnPct: 38.60,
    ytdReturnPct: 28.40,
    peRatio: "N/A",
    priceToBookRatio: "N/A",
    priceToSalesRatio: "N/A",
    thirtyDayAvgVolume: "192,400 contracts",
    eps: "N/A",
    lastDividendReported: "N/A",
    marketCap: "$16.8T (Global Est.)",
    aboutTitle: "About GOLD COMEX CONTINUOUS",
    aboutText: [
      "Gold Comex futures are the primary benchmark contract for trading physical gold bullion in global derivative markets.",
      "The contract trades on the Commodity Exchange (COMEX), a division of the New York Mercantile Exchange (NYMEX) and CME Group.",
      "Central bank gold reserve diversification and sovereign monetary hedging have propelled gold prices to consecutive historical highs.",
    ],
    sectorWeights: [
      { sector: "Jewelry Fabrication", percentage: 46.5, color: "#EAB308" },
      { sector: "Central Bank & Sovereign Reserves", percentage: 24.2, color: "#D97706" },
      { sector: "Investment Bars & Coins", percentage: 21.8, color: "#EA580C" },
      { sector: "Industrial & Technology", percentage: 7.5, color: "#64748B" },
    ],
    methodologyDetails: [
      { label: "Contract Size", value: "100 Troy Ounces" },
      { label: "Minimum Price Fluctuation", value: "$0.10 per troy ounce ($10.00 per contract)" },
      { label: "Deliverable Grade", value: "Refined gold not less than 0.995 fineness" },
      { label: "Trading Venue", value: "CME Globex / COMEX Floor" },
    ],
    timeSeries: {
      "1D": [
        { time: "09:30", price: 4402.00 },
        { time: "11:00", price: 4410.50 },
        { time: "13:00", price: 4418.20 },
        { time: "15:00", price: 4425.00 },
        { time: "16:20", price: 4424.90 },
      ],
      "1M": [
        { time: "Aug 19", price: 4280.00 },
        { time: "Aug 29", price: 4325.00 },
        { time: "Sep 08", price: 4380.00 },
        { time: "Sep 18", price: 4424.90 },
      ],
      "6M": [
        { time: "Mar 26", price: 3820.00 },
        { time: "May 26", price: 4050.00 },
        { time: "Jul 26", price: 4240.00 },
        { time: "Sep 26", price: 4424.90 },
      ],
      "YTD": [
        { time: "Jan 02", price: 3450.00 },
        { time: "Apr 01", price: 3900.00 },
        { time: "Jun 01", price: 4180.00 },
        { time: "Sep 18", price: 4424.90 },
      ],
      "1Y": [
        { time: "Oct 25", price: 3200.00 },
        { time: "Jan 26", price: 3450.00 },
        { time: "May 26", price: 4050.00 },
        { time: "Sep 26", price: 4424.90 },
      ],
      "5Y": [
        { time: "2021", price: 1800.00 },
        { time: "2022", price: 1825.00 },
        { time: "2023", price: 2060.00 },
        { time: "2024", price: 2650.00 },
        { time: "2025", price: 3500.00 },
        { time: "2026", price: 4424.90 },
      ],
    },
    newsArticles: [
      {
        id: "gld-1",
        category: "Markets",
        title: "Central Banks Expand Bullion Reserves for 18th Straight Month",
        timestamp: "updated 3h ago",
        source: "Bloomberg Commodities",
        summary: "Sovereign reserves continue reallocation from fiat debt to physical precious metal reserves.",
      },
      {
        id: "gld-2",
        category: "Personal-finance",
        title: "Gold Tops $4,400 on Geopolitical Hedging and Inflation Insurance",
        timestamp: "Sep 18, 2026",
        source: "Bloomberg Wealth",
        summary: "Physical demand in Asian and Middle Eastern retail hubs breaks quarterly volume records.",
      },
    ],
  },
  NDX: {
    symbol: "NDX",
    tickerCode: "CCMP:IND",
    name: "NASDAQ COMPOSITE",
    assetType: "Index",
    category: "Indices",
    exchange: "NASDAQ",
    currency: "USD",
    marketStatus: "Market closed",
    price: 26522.54,
    changeDollar: 102.80,
    changePct: 0.39,
    timestamp: "As of 5:29 PM EDT 09/18/26.",
    prevClose: 26419.74,
    open: 26450.10,
    dayLow: 26380.40,
    dayHigh: 26540.20,
    yearLow: 18100.00,
    yearHigh: 26700.00,
    yearReturnPct: 28.50,
    ytdReturnPct: 18.20,
    peRatio: 33.40,
    priceToBookRatio: 7.20,
    priceToSalesRatio: 4.80,
    thirtyDayAvgVolume: "5,120,400,000",
    eps: 794.10,
    lastDividendReported: 0.02,
    marketCap: "$29.4T",
    aboutTitle: "About NASDAQ COMPOSITE",
    aboutText: [
      "The Nasdaq Composite is a broad market index of more than 3,000 common equities listed on the Nasdaq stock market.",
      "Heavily weighted towards technology and software innovators, it reflects modern economic disruption and digital productivity.",
    ],
    timeSeries: {
      "1D": [
        { time: "09:30", price: 26450.10 },
        { time: "11:30", price: 26420.00 },
        { time: "13:30", price: 26490.50 },
        { time: "15:30", price: 26535.00 },
        { time: "16:20", price: 26522.54 },
      ],
      "1M": [
        { time: "Aug 19", price: 25400.00 },
        { time: "Sep 01", price: 25900.00 },
        { time: "Sep 18", price: 26522.54 },
      ],
      "6M": [
        { time: "Mar 26", price: 22800.00 },
        { time: "Jun 26", price: 24900.00 },
        { time: "Sep 26", price: 26522.54 },
      ],
      "YTD": [
        { time: "Jan 02", price: 22400.00 },
        { time: "May 01", price: 24100.00 },
        { time: "Sep 18", price: 26522.54 },
      ],
      "1Y": [
        { time: "Oct 25", price: 20600.00 },
        { time: "Apr 26", price: 23200.00 },
        { time: "Sep 26", price: 26522.54 },
      ],
      "5Y": [
        { time: "2021", price: 15600.00 },
        { time: "2022", price: 10500.00 },
        { time: "2023", price: 15000.00 },
        { time: "2024", price: 19800.00 },
        { time: "2025", price: 23500.00 },
        { time: "2026", price: 26522.54 },
      ],
    },
    newsArticles: [
      {
        id: "ndx-1",
        category: "Technology",
        title: "Semiconductor Equipment Makers See Multi-Year Backlog Surge",
        timestamp: "updated 6h ago",
        source: "Bloomberg Technology",
        summary: "Leading lithography providers report full capacity through late 2027.",
      },
    ],
  },
  DJI: {
    symbol: "DJI",
    tickerCode: "INDU:IND",
    name: "DOW JONES INDUSTRIAL AVERAGE",
    assetType: "Index",
    category: "Indices",
    exchange: "DJI",
    currency: "USD",
    marketStatus: "Market closed",
    price: 51682.64,
    changeDollar: -93.20,
    changePct: -0.18,
    timestamp: "As of 5:29 PM EDT 09/18/26.",
    prevClose: 51775.84,
    open: 51750.20,
    dayLow: 51580.40,
    dayHigh: 51810.30,
    yearLow: 38200.00,
    yearHigh: 52100.00,
    yearReturnPct: 14.80,
    ytdReturnPct: 10.20,
    peRatio: 21.80,
    priceToBookRatio: 4.80,
    priceToSalesRatio: 2.70,
    thirtyDayAvgVolume: "380,400,000",
    eps: 2370.40,
    lastDividendReported: 0.03,
    marketCap: "$14.2T",
    aboutTitle: "About DOW JONES INDUSTRIAL AVERAGE",
    aboutText: [
      "The Dow Jones Industrial Average is a price-weighted index tracking 30 blue-chip American corporate leaders.",
      "As one of the world's oldest and most cited market barometers, it represents industrial stability and corporate longevity.",
    ],
    timeSeries: {
      "1D": [
        { time: "09:30", price: 51750.20 },
        { time: "11:30", price: 51640.00 },
        { time: "13:30", price: 51590.20 },
        { time: "15:30", price: 51710.00 },
        { time: "16:20", price: 51682.64 },
      ],
      "1M": [
        { time: "Aug 19", price: 51200.00 },
        { time: "Sep 01", price: 51500.00 },
        { time: "Sep 18", price: 51682.64 },
      ],
      "6M": [
        { time: "Mar 26", price: 48200.00 },
        { time: "Jun 26", price: 50100.00 },
        { time: "Sep 26", price: 51682.64 },
      ],
      "YTD": [
        { time: "Jan 02", price: 46900.00 },
        { time: "May 01", price: 49400.00 },
        { time: "Sep 18", price: 51682.64 },
      ],
      "1Y": [
        { time: "Oct 25", price: 45000.00 },
        { time: "Apr 26", price: 48500.00 },
        { time: "Sep 26", price: 51682.64 },
      ],
      "5Y": [
        { time: "2021", price: 36000.00 },
        { time: "2022", price: 33000.00 },
        { time: "2023", price: 37500.00 },
        { time: "2024", price: 43000.00 },
        { time: "2025", price: 48500.00 },
        { time: "2026", price: 51682.64 },
      ],
    },
    newsArticles: [
      {
        id: "dji-1",
        category: "Markets",
        title: "Industrial Conglomerates Steady as Supply Chains Stabilize",
        timestamp: "updated 8h ago",
        source: "Bloomberg Markets",
        summary: "Aerospace and heavy manufacturing backlogs offset consumer retail slowdown.",
      },
    ],
  },
  FTSE: {
    symbol: "FTSE",
    tickerCode: "UKX:IND",
    name: "FTSE 100 INDEX",
    assetType: "Index",
    category: "Indices",
    exchange: "LSE",
    currency: "GBP",
    marketStatus: "Market closed",
    price: 10659.13,
    changeDollar: -156.40,
    changePct: -1.45,
    timestamp: "As of 5:29 PM EDT 09/18/26.",
    prevClose: 10815.53,
    open: 10790.00,
    dayLow: 10640.20,
    dayHigh: 10810.00,
    yearLow: 8900.00,
    yearHigh: 10950.00,
    yearReturnPct: 8.20,
    ytdReturnPct: 5.40,
    peRatio: 15.20,
    priceToBookRatio: 2.10,
    priceToSalesRatio: 1.40,
    thirtyDayAvgVolume: "940,000,000",
    eps: 701.20,
    lastDividendReported: 0.05,
    marketCap: "£2.4T",
    aboutTitle: "About FTSE 100 INDEX",
    aboutText: [
      "The FTSE 100 Index represents the 100 most highly capitalized blue-chip companies listed on the London Stock Exchange.",
      "Renowned for high dividend yield distributions and multinational commodity and financial sector exposure.",
    ],
    timeSeries: {
      "1D": [
        { time: "08:00", price: 10790.00 },
        { time: "11:00", price: 10740.50 },
        { time: "14:00", price: 10690.00 },
        { time: "16:30", price: 10659.13 },
      ],
      "1M": [
        { time: "Aug 19", price: 10500.00 },
        { time: "Sep 01", price: 10750.00 },
        { time: "Sep 18", price: 10659.13 },
      ],
      "6M": [
        { time: "Mar 26", price: 9850.00 },
        { time: "Jun 26", price: 10400.00 },
        { time: "Sep 26", price: 10659.13 },
      ],
      "YTD": [
        { time: "Jan 02", price: 10100.00 },
        { time: "Jun 01", price: 10550.00 },
        { time: "Sep 18", price: 10659.13 },
      ],
      "1Y": [
        { time: "Oct 25", price: 9800.00 },
        { time: "Apr 26", price: 10250.00 },
        { time: "Sep 26", price: 10659.13 },
      ],
      "5Y": [
        { time: "2021", price: 7300.00 },
        { time: "2022", price: 7450.00 },
        { time: "2023", price: 7700.00 },
        { time: "2024", price: 8900.00 },
        { time: "2025", price: 9900.00 },
        { time: "2026", price: 10659.13 },
      ],
    },
    newsArticles: [
      {
        id: "ftse-1",
        category: "Markets",
        title: "Bank of England Holds Rates as Sterling Weakens Slightly",
        timestamp: "updated 10h ago",
        source: "Bloomberg Europe",
        summary: "Monetary policy committee projects gradual easing as core inflation moderates.",
      },
    ],
  },
  CL: {
    symbol: "CL",
    tickerCode: "CL1:COM",
    name: "CRUDE OIL (WTI)",
    assetType: "Commodity",
    category: "Commodities",
    exchange: "NYMEX",
    currency: "USD/bbl.",
    marketStatus: "Market open",
    price: 100.30,
    changeDollar: -1.61,
    changePct: -1.58,
    timestamp: "As of 5:29 PM EDT 09/18/26.",
    prevClose: 101.91,
    open: 101.80,
    dayLow: 99.85,
    dayHigh: 102.40,
    yearLow: 68.20,
    yearHigh: 104.50,
    yearReturnPct: 24.10,
    ytdReturnPct: 19.30,
    peRatio: "N/A",
    priceToBookRatio: "N/A",
    priceToSalesRatio: "N/A",
    thirtyDayAvgVolume: "340,000 contracts",
    eps: "N/A",
    lastDividendReported: "N/A",
    marketCap: "N/A",
    aboutTitle: "About CRUDE OIL (WTI)",
    aboutText: [
      "Light Sweet Crude Oil (WTI) is the world's most actively traded energy benchmark contract.",
      "Delivered in Cushing, Oklahoma, it serves as the price discovery standard for petroleum products, transportation fuels, and petrochemical feedstocks.",
    ],
    timeSeries: {
      "1D": [
        { time: "09:30", price: 101.80 },
        { time: "11:30", price: 101.20 },
        { time: "13:30", price: 100.60 },
        { time: "15:30", price: 100.10 },
        { time: "16:20", price: 100.30 },
      ],
      "1M": [
        { time: "Aug 19", price: 94.50 },
        { time: "Sep 01", price: 98.20 },
        { time: "Sep 18", price: 100.30 },
      ],
      "6M": [
        { time: "Mar 26", price: 82.00 },
        { time: "Jun 26", price: 91.50 },
        { time: "Sep 26", price: 100.30 },
      ],
      "YTD": [
        { time: "Jan 02", price: 74.00 },
        { time: "May 01", price: 86.50 },
        { time: "Sep 18", price: 100.30 },
      ],
      "1Y": [
        { time: "Oct 25", price: 80.50 },
        { time: "Apr 26", price: 85.00 },
        { time: "Sep 26", price: 100.30 },
      ],
      "5Y": [
        { time: "2021", price: 75.00 },
        { time: "2022", price: 95.00 },
        { time: "2023", price: 78.00 },
        { time: "2024", price: 82.00 },
        { time: "2025", price: 88.00 },
        { time: "2026", price: 100.30 },
      ],
    },
    newsArticles: [
      {
        id: "cl-1",
        category: "Energy",
        title: "Crude Slips Back Toward $100 as US Inventories Post Surprise Build",
        timestamp: "updated 5h ago",
        source: "Bloomberg Energy",
        summary: "Refinery utilization rates dip ahead of scheduled seasonal turnaround maintenance.",
      },
    ],
  },
  CO1: {
    symbol: "CO1",
    tickerCode: "CO1:COM",
    name: "Generic 1st 'CO' Future",
    assetType: "Future",
    category: "Futures",
    exchange: "ICE",
    currency: "USD/bbl.",
    marketStatus: "Market open",
    price: 103.87,
    changeDollar: -0.95,
    changePct: -0.91,
    timestamp: "As of 5:29 PM EDT 09/18/26.",
    prevClose: 104.82,
    open: 104.70,
    dayLow: 103.40,
    dayHigh: 105.10,
    yearLow: 72.00,
    yearHigh: 108.50,
    yearReturnPct: 21.40,
    ytdReturnPct: 16.80,
    thirtyDayAvgVolume: "285,000 contracts",
    aboutTitle: "About Generic 1st 'CO' Future",
    aboutText: [
      "The Brent Crude future contract traded on ICE Futures Europe is a leading international price benchmark for sea-borne crude oils.",
    ],
    timeSeries: {
      "1D": [
        { time: "09:30", price: 104.70 },
        { time: "12:00", price: 104.10 },
        { time: "14:30", price: 103.90 },
        { time: "16:20", price: 103.87 },
      ],
      "1M": [{ time: "Aug 19", price: 98.00 }, { time: "Sep 18", price: 103.87 }],
      "6M": [{ time: "Mar 26", price: 86.00 }, { time: "Sep 26", price: 103.87 }],
      "YTD": [{ time: "Jan 02", price: 79.00 }, { time: "Sep 18", price: 103.87 }],
      "1Y": [{ time: "Oct 25", price: 85.00 }, { time: "Sep 26", price: 103.87 }],
      "5Y": [{ time: "2021", price: 78.00 }, { time: "2026", price: 103.87 }],
    },
    newsArticles: [
      {
        id: "co1-1",
        category: "Energy",
        title: "OPEC+ Members Reaffirm Quota Compliance Through Year End",
        timestamp: "updated 9h ago",
        source: "Bloomberg Energy",
        summary: "Voluntary supply reductions maintain physical barrel balance in Atlantic basin.",
      },
    ],
  },
};

export function getSecurity(symbol: string): SecurityData {
  const clean = symbol.toUpperCase().trim();
  if (SECURITIES_DATABASE[clean]) {
    return SECURITIES_DATABASE[clean];
  }
  return SECURITIES_DATABASE["SPX"];
}
