import { ProductSearchService } from './ProductSearchService';
import {
  MyntraProvider,
  AjioProvider,
  ZaraProvider,
  HMProvider,
  AmazonProvider
} from './providers';

// Instantiate providers
const myntra = new MyntraProvider();
const ajio = new AjioProvider();
const zara = new ZaraProvider();
const hm = new HMProvider();
const amazon = new AmazonProvider();

// Instantiate unified ProductSearchService with active providers
export const searchService = new ProductSearchService([
  myntra,
  ajio,
  zara,
  hm,
  amazon
]);

export * from './ProductSearchService';
export * from './providers';
