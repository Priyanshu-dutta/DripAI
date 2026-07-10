import { IProductRepository } from '../IProductRepository';
import { RawProviderProduct } from '../../../types/product';

/**
 * Local implementation of IProductRepository.
 * Serves as a stateless product repository using a curated dataset.
 * The schema variations in this dataset test the normalization layer.
 */
export class LocalProductProvider implements IProductRepository {
  public readonly name = 'LocalProductProvider';

  // Private static catalog of products with diverse properties to verify Normalization
  private static readonly PRODUCTS: RawProviderProduct[] = [
    // --- TOPS ---
    {
      sku: 'top-1',
      title: 'Oversized Cotton Linen Shirt',
      brand: 'Zara',
      category: 'top',
      colour: 'White', // Tests colour alias
      style: 'streetwear',
      fit: 'oversized',
      season: 'summer',
      gender: 'men',
      tags: ['wedding', 'beach', 'casual', 'party'],
      price: 3499,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      retailer: 'Zara India',
      retailerUrl: 'https://www.zara.com/in/shirt-1',
      rating: 4.5,
    },
    {
      id: 'top-2',
      name: 'Knitted Mock-Neck Sweater', // Tests name alias
      brandName: 'H&M', // Tests brandName alias
      categoryName: 'top', // Tests categoryName alias
      shade: 'Jet Black', // Tests shade alias
      styleVibe: 'minimalist', // Tests styleVibe alias
      fitType: 'regular', // Tests fitType alias
      seasonName: 'winter', // Tests seasonName alias
      genderTarget: 'unisex', // Tests genderTarget alias
      occasionTags: ['casual', 'work', 'dinner'],
      cost: 2299, // Tests cost alias
      currencyCode: 'INR', // Tests currencyCode alias
      imageUrl: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=400',
      retailerName: 'H&M Online', // Tests retailerName alias
      purchaseUrl: 'https://www2.hm.com/in/sweater-2', // Tests purchaseUrl alias
      ratingScore: 4.2, // Tests ratingScore alias
    },
    {
      sku: 'top-3',
      title: 'Relaxed Fit Graphic Tee',
      brand: 'Uniqlo',
      category: 'top',
      color: 'olive',
      style: 'streetwear',
      fit: 'relaxed',
      season: 'summer',
      gender: 'unisex',
      tags: ['casual', 'college', 'street'],
      price: 1290,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
      retailer: 'Uniqlo India',
      retailerUrl: 'https://www.uniqlo.com/in/tee-3',
      rating: 4.8,
    },
    {
      sku: 'top-4',
      title: 'Structured Tweed Blazer',
      brand: 'Mango',
      category: 'top',
      colour: 'beige',
      style: 'formal',
      fit: 'slim',
      season: 'winter',
      gender: 'women',
      tags: ['wedding', 'work', 'meeting', 'office'],
      price: 6999,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
      retailer: 'Mango India',
      retailerUrl: 'https://shop.mango.com/in/blazer-4',
      rating: 4.6,
    },
    {
      sku: 'top-5',
      title: 'Cropped Denim Jacket',
      brand: 'Levi\'s',
      category: 'top',
      color: 'blue',
      style: 'casual',
      fit: 'regular',
      season: 'winter',
      gender: 'women',
      tags: ['casual', 'travel', 'outing'],
      price: 4999,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400',
      retailer: 'Levi Store',
      retailerUrl: 'https://www.levi.in/jacket-5',
      rating: 4.3,
    },

    // --- BOTTOMS ---
    {
      sku: 'bottom-1',
      title: 'Oversized Linen Trousers',
      brand: 'Zara',
      category: 'bottom',
      colour: 'White',
      style: 'streetwear',
      fit: 'oversized',
      season: 'summer',
      gender: 'unisex',
      tags: ['wedding', 'beach', 'casual'],
      price: 3990,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
      retailer: 'Zara India',
      retailerUrl: 'https://www.zara.com/in/trousers-1',
      rating: 4.4,
    },
    {
      sku: 'bottom-2',
      title: 'Relaxed Fit Cargo Pants',
      brand: 'Uniqlo',
      category: 'bottom',
      shade: 'charcoal',
      style: 'streetwear',
      fit: 'relaxed',
      season: 'winter',
      gender: 'men',
      tags: ['casual', 'travel', 'street'],
      price: 2990,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=400',
      retailer: 'Uniqlo Store',
      retailerUrl: 'https://www.uniqlo.com/in/cargo-2',
      rating: 4.7,
    },
    {
      sku: 'bottom-3',
      title: 'Slim Fit Chino Pants',
      brand: 'H&M',
      category: 'bottom',
      color: 'khaki',
      style: 'formal',
      fit: 'slim',
      season: 'summer',
      gender: 'men',
      tags: ['work', 'office', 'wedding', 'dinner'],
      price: 1999,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=400',
      retailer: 'H&M Online',
      retailerUrl: 'https://www2.hm.com/in/chinos-3',
      rating: 4.1,
    },
    {
      sku: 'bottom-4',
      title: 'Wide Leg Trousers',
      brand: 'Mango',
      category: 'bottom',
      colour: 'ivory',
      style: 'minimalist',
      fit: 'wide',
      season: 'summer',
      gender: 'women',
      tags: ['work', 'casual', 'party'],
      price: 3590,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
      retailer: 'Mango India',
      retailerUrl: 'https://shop.mango.com/in/pants-4',
      rating: 4.5,
    },

    // --- SHOES ---
    {
      sku: 'shoes-1',
      title: 'White Retro Sneakers',
      brand: 'Adidas',
      category: 'shoes',
      color: 'white',
      style: 'streetwear',
      fit: 'regular',
      season: 'summer',
      gender: 'unisex',
      tags: ['casual', 'travel', 'college', 'street'],
      price: 5999,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      retailer: 'Ajio Store',
      retailerUrl: 'https://www.ajio.com/adidas-sneaker-1',
      rating: 4.8,
    },
    {
      sku: 'shoes-2',
      title: 'Classic Suede Chelsea Boots',
      brand: 'Clarkes',
      category: 'shoes',
      colour: 'tan',
      style: 'formal',
      fit: 'regular',
      season: 'winter',
      gender: 'men',
      tags: ['wedding', 'work', 'dinner', 'party'],
      price: 8999,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400',
      retailer: 'Myntra Store',
      retailerUrl: 'https://www.myntra.com/boots-2',
      rating: 4.6,
    },
    {
      sku: 'shoes-3',
      title: 'Minimal Leather Loafers',
      brand: 'Zara',
      category: 'shoes',
      color: 'black',
      style: 'minimalist',
      fit: 'regular',
      season: 'summer',
      gender: 'men',
      tags: ['wedding', 'party', 'dinner'],
      price: 5990,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400',
      retailer: 'Zara India',
      retailerUrl: 'https://www.zara.com/in/shoes-3',
      rating: 4.3,
    },
    {
      sku: 'shoes-4',
      title: 'Chunky Platform Loafers',
      brand: 'Mango',
      category: 'shoes',
      color: 'black',
      style: 'streetwear',
      fit: 'regular',
      season: 'winter',
      gender: 'women',
      tags: ['casual', 'dinner', 'college'],
      price: 4590,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400',
      retailer: 'Mango India',
      retailerUrl: 'https://shop.mango.com/in/shoes-4',
      rating: 4.5,
    },

    // --- ACCESSORIES ---
    {
      sku: 'acc-1',
      title: 'Acetate Square Sunglasses',
      brand: 'Ray-Ban',
      category: 'accessories',
      colour: 'black',
      style: 'minimalist',
      fit: 'regular',
      season: 'summer',
      gender: 'unisex',
      tags: ['wedding', 'beach', 'travel', 'casual'],
      price: 7490,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
      retailer: 'Ray-Ban Store',
      retailerUrl: 'https://www.ray-ban.com/in/sunglasses-1',
      rating: 4.9,
    },
    {
      sku: 'acc-2',
      title: 'Ribbed Knit Wool Beanie',
      brand: 'Carhartt',
      category: 'accessories',
      color: 'olive',
      style: 'streetwear',
      fit: 'regular',
      season: 'winter',
      gender: 'unisex',
      tags: ['casual', 'travel', 'street'],
      price: 1599,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=400',
      retailer: 'Myntra Store',
      retailerUrl: 'https://www.myntra.com/beanie-2',
      rating: 4.7,
    },
    {
      sku: 'acc-3',
      title: 'Classic Leather Watch',
      brand: 'Daniel Wellington',
      category: 'accessories',
      colour: 'beige',
      style: 'formal',
      fit: 'regular',
      season: 'all-season',
      gender: 'unisex',
      tags: ['wedding', 'work', 'dinner'],
      price: 12499,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
      retailer: 'DW India',
      retailerUrl: 'https://www.danielwellington.com/in/watch-3',
      rating: 4.4,
    },
    {
      sku: 'acc-4',
      title: 'Nylon Messenger Bag',
      brand: 'H&M',
      category: 'accessories',
      color: 'black',
      style: 'streetwear',
      fit: 'regular',
      season: 'summer',
      gender: 'unisex',
      tags: ['casual', 'college', 'travel'],
      price: 1499,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      retailer: 'H&M Online',
      retailerUrl: 'https://www2.hm.com/in/bag-4',
      rating: 4.2,
    },
  ];

  /**
   * Fetches raw products based on optional filters.
   * Runs in a completely stateless manner.
   */
  public async fetchRawProducts(filters?: {
    category?: 'top' | 'bottom' | 'shoes' | 'accessories';
    gender?: string;
  }): Promise<RawProviderProduct[]> {
    let list = LocalProductProvider.PRODUCTS;

    if (filters) {
      if (filters.category) {
        list = list.filter((p) => p.category === filters.category);
      }
      if (filters.gender) {
        const queryGender = filters.gender.toLowerCase().trim();
        list = list.filter((p) => {
          const productGender = (p.gender || p.genderTarget || 'unisex').toLowerCase().trim();
          if (productGender === 'unisex') return true;
          return productGender.includes(queryGender) || queryGender.includes(productGender);
        });
      }
    }

    return [...list];
  }
}
