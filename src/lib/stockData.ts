export interface Stock {
  name: string;
  why: string;
  risks: string;
  investor: string;
}

export interface DomainData {
  title: string;
  stocks: Stock[];
  allocation: [string, string][];
}

export const stockDatabase: Record<string, DomainData> = {
  icecream: {
    title: "Ice Cream Industry",
    stocks: [
      {
        name: "Vadilal Industries",
        why: "Pure-play ice cream company with growing domestic and international presence.",
        risks: "Seasonal demand and milk price volatility.",
        investor: "Growth Investor",
      },
      {
        name: "Hatsun Agro Product",
        why: "Owner of Arun Ice Cream and strong dairy distribution network.",
        risks: "Premium valuation and dairy margin pressure.",
        investor: "Moderate Growth",
      },
      {
        name: "Kwality Wall's India",
        why: "Strong consumer brands and nationwide reach.",
        risks: "Recently listed and potentially volatile.",
        investor: "Aggressive Growth",
      },
    ],
    allocation: [
      ["Vadilal Industries", "40%"],
      ["Hatsun Agro", "35%"],
      ["Kwality Wall's", "25%"],
    ],
  },

  ai: {
    title: "Artificial Intelligence",
    stocks: [
      {
        name: "NVIDIA",
        why: "Dominates AI chips and infrastructure powering the entire AI revolution.",
        risks: "High valuation and export restrictions.",
        investor: "Growth",
      },
      {
        name: "Microsoft",
        why: "Leader in enterprise AI, Azure cloud, and deep OpenAI partnership.",
        risks: "Competition from other hyperscalers.",
        investor: "Core Holding",
      },
      {
        name: "Alphabet",
        why: "World-class AI research (DeepMind) and massive data moat.",
        risks: "Regulatory scrutiny and antitrust risk.",
        investor: "Long-Term Growth",
      },
    ],
    allocation: [
      ["NVIDIA", "40%"],
      ["Microsoft", "35%"],
      ["Alphabet", "25%"],
    ],
  },

  sports: {
    title: "Sports Industry",
    stocks: [
      {
        name: "Nike",
        why: "Global sports apparel leader with unmatched brand and distribution.",
        risks: "Consumer spending slowdown and China exposure.",
        investor: "Core Holding",
      },
      {
        name: "Adidas",
        why: "Strong global sports brand with growing lifestyle segment.",
        risks: "Competitive market and margin pressure.",
        investor: "Growth",
      },
      {
        name: "DraftKings",
        why: "Sports betting growth story in an expanding US market.",
        risks: "High volatility and regulatory risk.",
        investor: "Aggressive",
      },
    ],
    allocation: [
      ["Nike", "40%"],
      ["Adidas", "35%"],
      ["DraftKings", "25%"],
    ],
  },

  defense: {
    title: "Defense Industry",
    stocks: [
      {
        name: "HAL",
        why: "India's premier aerospace manufacturer with a strong order book.",
        risks: "Government dependency and execution delays.",
        investor: "Growth",
      },
      {
        name: "Bharat Electronics",
        why: "Strong defense electronics pipeline and indigenization push.",
        risks: "Execution delays and import competition.",
        investor: "Core Holding",
      },
      {
        name: "Data Patterns",
        why: "Emerging defense technology company with niche electronics capability.",
        risks: "Smaller company risk and limited float.",
        investor: "Aggressive",
      },
    ],
    allocation: [
      ["HAL", "40%"],
      ["BEL", "35%"],
      ["Data Patterns", "25%"],
    ],
  },

  ev: {
    title: "Electric Vehicles",
    stocks: [
      {
        name: "Tesla",
        why: "Global EV leader with software, energy, and autonomy optionality.",
        risks: "Competition, valuation, and CEO distraction.",
        investor: "Growth",
      },
      {
        name: "BYD",
        why: "Fast-growing EV giant with battery and manufacturing advantages.",
        risks: "China-specific geopolitical risks.",
        investor: "Growth",
      },
      {
        name: "Tata Motors",
        why: "Leading EV player in India with JLR recovery as a bonus.",
        risks: "Auto-cycle sensitivity and EV transition costs.",
        investor: "Balanced Growth",
      },
    ],
    allocation: [
      ["Tesla", "40%"],
      ["BYD", "35%"],
      ["Tata Motors", "25%"],
    ],
  },

  pharma: {
    title: "Pharmaceutical Industry",
    stocks: [
      {
        name: "Sun Pharma",
        why: "India's largest pharma company with strong specialty pipeline.",
        risks: "US FDA scrutiny and generic pricing pressure.",
        investor: "Core Holding",
      },
      {
        name: "Divi's Laboratories",
        why: "Global CDMO leader with high-quality API manufacturing.",
        risks: "Client concentration and regulatory risks.",
        investor: "Growth",
      },
      {
        name: "Cipla",
        why: "Strong branded generics and growing respiratory portfolio.",
        risks: "Patent cliff exposure and pricing pressure.",
        investor: "Moderate Growth",
      },
    ],
    allocation: [
      ["Sun Pharma", "40%"],
      ["Divi's Labs", "35%"],
      ["Cipla", "25%"],
    ],
  },

  fintech: {
    title: "Financial Technology",
    stocks: [
      {
        name: "Paytm",
        why: "India's fintech pioneer with payments, lending, and insurance.",
        risks: "Regulatory headwinds and profitability concerns.",
        investor: "Aggressive Growth",
      },
      {
        name: "PolicyBazaar",
        why: "Dominant insurance aggregator in a massively underpenetrated market.",
        risks: "High customer acquisition costs.",
        investor: "Growth",
      },
      {
        name: "Angel One",
        why: "India's fastest growing discount broker with strong tech platform.",
        risks: "Market-cycle dependent revenues.",
        investor: "Moderate Growth",
      },
    ],
    allocation: [
      ["Angel One", "40%"],
      ["PolicyBazaar", "35%"],
      ["Paytm", "25%"],
    ],
  },
};

export const investorTypeColors: Record<string, string> = {
  "Core Holding": "bg-blue-100 text-blue-800",
  Growth: "bg-green-100 text-green-800",
  "Growth Investor": "bg-green-100 text-green-800",
  "Moderate Growth": "bg-yellow-100 text-yellow-800",
  "Aggressive Growth": "bg-red-100 text-red-800",
  Aggressive: "bg-red-100 text-red-800",
  "Balanced Growth": "bg-purple-100 text-purple-800",
  "Long-Term Growth": "bg-indigo-100 text-indigo-800",
};
