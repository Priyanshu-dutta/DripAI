import { ISearchAdapter } from './ISearchAdapter';
import { SerperSearchAdapter } from './SerperSearchAdapter';
import { ValueSerpSearchAdapter } from './ValueSerpSearchAdapter';
import { SerpApiSearchAdapter } from './SerpApiSearchAdapter';
import { EnvConfig } from '../../../config/env';

/**
 * Factory class resolving search engine adapters dynamically.
 */
export class SearchAdapterFactory {
  public static getAdapter(): ISearchAdapter {
    const active = EnvConfig.getActiveSearchAdapter().toLowerCase();

    switch (active) {
      case 'valueserp':
        return new ValueSerpSearchAdapter();
      case 'serpapi':
        return new SerpApiSearchAdapter();
      case 'serper':
      default:
        return new SerperSearchAdapter();
    }
  }
}
