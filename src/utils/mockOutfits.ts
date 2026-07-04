import { OutfitRecommendation, ShoppingProduct } from '@/types/stylist';

export const MOCK_OUTFITS: OutfitRecommendation[] = [
  {
    id: 'outfit-1',
    outfitName: 'Classy All Black Oversized Fit',
    styleExplanation: 'A sophisticated, monochromatic ensemble tailored for evening settings. Combining sleek, oversized layers with clean metal accessories to maintain an effortless, high-fashion drape.',
    colorPalette: ['#000000', '#1A1A1A', '#515154'],
    totalCost: 4780,
    items: {
      top: {
        id: 'p1',
        title: 'Zara Oversized Black Shirt',
        price: 1490,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://zara.com',
        brand: 'Zara',
        providerName: 'Zara',
        matchScore: 96
      },
      bottom: {
        id: 'p2',
        title: 'H&M Relaxed-Fit Pleated Trousers',
        price: 1990,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://hm.com',
        brand: 'H&M',
        providerName: 'H&M',
        matchScore: 94
      },
      shoes: {
        id: 'p3',
        title: 'AJIO Minimalist Leather Loafers',
        price: 1190,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://ajio.com',
        brand: 'AJIO',
        providerName: 'AJIO',
        matchScore: 89
      },
      accessories: {
        id: 'p4',
        title: 'Myntra Silver Chain Necklace',
        price: 499,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://myntra.com',
        brand: 'Myntra',
        providerName: 'Myntra',
        matchScore: 92
      }
    }
  },
  {
    id: 'outfit-2',
    outfitName: 'Premium Black Street Fit',
    styleExplanation: 'A premium street-ready outfit balancing utility structures with relaxed fits. Perfect for dynamic city exploration or relaxed weekend gatherings.',
    colorPalette: ['#0B0B0C', '#2E3033', '#86868b'],
    totalCost: 4350,
    items: {
      top: {
        id: 'p5',
        title: 'H&M Relaxed Black Tee',
        price: 790,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://hm.com',
        brand: 'H&M',
        providerName: 'H&M',
        matchScore: 95
      },
      bottom: {
        id: 'p6',
        title: 'H&M Black Cargo Pants',
        price: 1690,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://hm.com',
        brand: 'H&M',
        providerName: 'H&M',
        matchScore: 91
      },
      shoes: {
        id: 'p7',
        title: 'AJIO Black Sneakers',
        price: 1890,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://ajio.com',
        brand: 'AJIO',
        providerName: 'AJIO',
        matchScore: 88
      },
      accessories: {
        id: 'p8',
        title: 'Myntra Classic Beanie',
        price: 350,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://myntra.com',
        brand: 'Myntra',
        providerName: 'Myntra',
        matchScore: 90
      }
    }
  },
  {
    id: 'outfit-3',
    outfitName: 'Minimal Black Elegance',
    styleExplanation: 'A minimal, clean fit featuring classic linen draping. Perfect for warmer evenings or formal outdoor social events.',
    colorPalette: ['#121212', '#222222', '#FFFFFF'],
    totalCost: 4920,
    items: {
      top: {
        id: 'p13',
        title: 'Zara Linen Black Shirt',
        price: 2490,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://zara.com',
        brand: 'Zara',
        providerName: 'Zara',
        matchScore: 93
      },
      bottom: {
        id: 'p6',
        title: 'H&M Black Cargo Pants',
        price: 1690,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://hm.com',
        brand: 'H&M',
        providerName: 'H&M',
        matchScore: 91
      },
      shoes: {
        id: 'p7',
        title: 'AJIO Black Sneakers',
        price: 1890,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://ajio.com',
        brand: 'AJIO',
        providerName: 'AJIO',
        matchScore: 88
      },
      accessories: {
        id: 'p4',
        title: 'Myntra Silver Chain Necklace',
        price: 499,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://myntra.com',
        brand: 'Myntra',
        providerName: 'Myntra',
        matchScore: 92
      }
    }
  },
  {
    id: 'outfit-4',
    outfitName: 'Urban All Black Vibes',
    styleExplanation: 'A modern streetwear coordinate focusing on comfort, oversized tees, and premium canvas sneaker footwear.',
    colorPalette: ['#1A1A1A', '#333333', '#888888'],
    totalCost: 4150,
    items: {
      top: {
        id: 'p14',
        title: 'Uniqlo Black Oversized Tee',
        price: 1290,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://uniqlo.com',
        brand: 'Uniqlo',
        providerName: 'UNIQLO',
        matchScore: 90
      },
      bottom: {
        id: 'p2',
        title: 'H&M Relaxed-Fit Pleated Trousers',
        price: 1990,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://hm.com',
        brand: 'H&M',
        providerName: 'H&M',
        matchScore: 94
      },
      shoes: {
        id: 'p15',
        title: 'Converse Black Sneakers',
        price: 2190,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://converse.com',
        brand: 'Converse',
        providerName: 'Converse',
        matchScore: 88
      },
      accessories: {
        id: 'p8',
        title: 'Myntra Classic Beanie',
        price: 350,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://myntra.com',
        brand: 'Myntra',
        providerName: 'Myntra',
        matchScore: 90
      }
    }
  }
];

export const MOCK_TABS: Record<string, ShoppingProduct[]> = {
  tops: [
    {
      id: 'p1',
      title: 'Zara Oversized Black Shirt',
      price: 1490,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://zara.com',
      brand: 'Zara',
      providerName: 'Zara',
      matchScore: 96
    },
    {
      id: 'p5',
      title: 'H&M Relaxed Black Tee',
      price: 790,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://hm.com',
      brand: 'H&M',
      providerName: 'H&M',
      matchScore: 95
    },
    {
      id: 'p12',
      title: 'AJIO Textured Black Shirt',
      price: 1190,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://ajio.com',
      brand: 'AJIO',
      providerName: 'AJIO',
      matchScore: 92
    },
    {
      id: 'p13',
      title: 'Zara Linen Black Shirt',
      price: 2490,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://zara.com',
      brand: 'Zara',
      providerName: 'Zara',
      matchScore: 93
    },
    {
      id: 'p14',
      title: 'Uniqlo Black Oversized Tee',
      price: 1290,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://uniqlo.com',
      brand: 'Uniqlo',
      providerName: 'UNIQLO',
      matchScore: 90
    },
    {
      id: 'p16',
      title: 'H&M Black Cuban Collar Shirt',
      price: 1290,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://hm.com',
      brand: 'H&M',
      providerName: 'H&M',
      matchScore: 89
    }
  ],
  bottoms: [
    {
      id: 'p2',
      title: 'H&M Relaxed-Fit Pleated Trousers',
      price: 1990,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://hm.com',
      brand: 'H&M',
      providerName: 'H&M',
      matchScore: 94
    },
    {
      id: 'p6',
      title: 'H&M Black Cargo Pants',
      price: 1690,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://hm.com',
      brand: 'H&M',
      providerName: 'H&M',
      matchScore: 91
    },
    {
      id: 'p17',
      title: 'Zara Loose Fit Black Denim',
      price: 2290,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://zara.com',
      brand: 'Zara',
      providerName: 'Zara',
      matchScore: 88
    }
  ],
  shoes: [
    {
      id: 'p3',
      title: 'AJIO Minimalist Leather Loafers',
      price: 1190,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://ajio.com',
      brand: 'AJIO',
      providerName: 'AJIO',
      matchScore: 89
    },
    {
      id: 'p7',
      title: 'AJIO Black Sneakers',
      price: 1890,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://ajio.com',
      brand: 'AJIO',
      providerName: 'AJIO',
      matchScore: 88
    },
    {
      id: 'p15',
      title: 'Converse Black Sneakers',
      price: 2190,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://converse.com',
      brand: 'Converse',
      providerName: 'Converse',
      matchScore: 88
    }
  ],
  accessories: [
    {
      id: 'p4',
      title: 'Myntra Silver Chain Necklace',
      price: 499,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://myntra.com',
      brand: 'Myntra',
      providerName: 'Myntra',
      matchScore: 92
    },
    {
      id: 'p8',
      title: 'Myntra Classic Beanie',
      price: 350,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://myntra.com',
      brand: 'Myntra',
      providerName: 'Myntra',
      matchScore: 90
    },
    {
      id: 'p18',
      title: 'H&M Black Watch',
      price: 1699,
      currency: '₹',
      imageUrl: '',
      shoppingUrl: 'https://hm.com',
      brand: 'H&M',
      providerName: 'H&M',
      matchScore: 85
    }
  ]
};
