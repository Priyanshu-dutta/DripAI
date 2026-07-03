import { OutfitRecommendation } from '@/types/stylist';

export const MOCK_OUTFITS: OutfitRecommendation[] = [
  {
    id: 'outfit-1',
    outfitName: 'Midnight Elegance',
    styleExplanation: 'A sophisticated, monochromatic ensemble tailored for evening settings. Combining sleek, oversized layers with clean metal accessories to maintain an effortless, high-fashion drape.',
    colorPalette: ['#000000', '#1A1A1A', '#515154', '#f5f5f7'],
    totalCost: 4890,
    items: {
      top: {
        id: 'p1',
        title: 'Zara Oversized Drop Shoulder Tee',
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
        title: 'Myntra Silver Minimalist Chain',
        price: 220,
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
    outfitName: 'Urban Noir',
    styleExplanation: 'A premium street-ready outfit balancing utility structures with relaxed fits. Perfect for dynamic city exploration or relaxed weekend gatherings.',
    colorPalette: ['#0B0B0C', '#2E3033', '#86868b', '#E2E8F0'],
    totalCost: 4930,
    items: {
      top: {
        id: 'p5',
        title: 'H&M Heavyweight Streetwear Hoodie',
        price: 1990,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://hm.com',
        brand: 'H&M',
        providerName: 'H&M',
        matchScore: 95
      },
      bottom: {
        id: 'p6',
        title: 'Zara Cargo Utility Trousers',
        price: 1790,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://zara.com',
        brand: 'Zara',
        providerName: 'Zara',
        matchScore: 91
      },
      shoes: {
        id: 'p7',
        title: 'AJIO High-Top Vintage Sneakers',
        price: 800,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://ajio.com',
        brand: 'AJIO',
        providerName: 'AJIO',
        matchScore: 88
      },
      accessories: {
        id: 'p8',
        title: 'Myntra Urban Knit Beanie',
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
    outfitName: 'Street Royalty',
    styleExplanation: 'A bold, modern fit featuring street drape elements. Designed to command attention while ensuring absolute movement and comfort.',
    colorPalette: ['#111111', '#3F3F46', '#71717A', '#FFFFFF'],
    totalCost: 4180,
    items: {
      top: {
        id: 'p9',
        title: 'Zara Graphic Oversized Fit Tee',
        price: 1590,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://zara.com',
        brand: 'Zara',
        providerName: 'Zara',
        matchScore: 93
      },
      bottom: {
        id: 'p10',
        title: 'H&M Raw-Cut Denim Shorts',
        price: 1490,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://hm.com',
        brand: 'H&M',
        providerName: 'H&M',
        matchScore: 87
      },
      shoes: {
        id: 'p11',
        title: 'Nike Retro Chunky Slides',
        price: 790,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://nike.com',
        brand: 'Nike',
        providerName: 'Nike',
        matchScore: 92
      },
      accessories: {
        id: 'p12',
        title: 'Myntra Heavy Link Wrist Chain',
        price: 310,
        currency: '₹',
        imageUrl: '',
        shoppingUrl: 'https://myntra.com',
        brand: 'Myntra',
        providerName: 'Myntra',
        matchScore: 85
      }
    }
  }
];
