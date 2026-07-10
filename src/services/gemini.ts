import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import { EnvConfig } from '../config/env';
import { StyleBlueprint } from '../types/blueprint';
import { Logger } from '../utils/logger';
import { GeminiError } from '../utils/errors';

/**
 * Service to interface with Google Gemini API for preference extraction.
 */
export class GeminiService {
  private static client: GoogleGenerativeAI | null = null;

  /**
   * Initializes and returns the GoogleGenerativeAI client.
   */
  private static getClient(requestId?: string): GoogleGenerativeAI {
    if (!this.client) {
      const apiKey = EnvConfig.getGeminiApiKey(requestId);
      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  /**
   * Enforces strict JSON Schema for the extraction endpoint.
   */
  private static getResponseSchema(): Schema {
    return {
      type: SchemaType.OBJECT,
      properties: {
        occasion: {
          type: SchemaType.STRING,
          description: 'The occasion explicitly specified by the user (e.g. "wedding", "job interview"). Return null if not specified.',
        },
        budget: {
          type: SchemaType.STRING,
          description: 'The budget target or limit explicitly specified by the user (e.g. "under 5000 INR", "around $100"). Return null if not specified.',
        },
        gender: {
          type: SchemaType.STRING,
          description: 'The target gender explicitly specified by the user (e.g. "male", "female", "unisex"). Return null if not specified.',
        },
        style: {
          type: SchemaType.STRING,
          description: 'The fashion style genre or vibe explicitly specified (e.g. "streetwear", "minimalist"). Return null if not specified.',
        },
        fit: {
          type: SchemaType.STRING,
          description: 'The clothing fit preference explicitly specified (e.g. "oversized", "slim fit"). Return null if not specified.',
        },
        color: {
          type: SchemaType.STRING,
          description: 'Preferred colors or color palettes explicitly specified (e.g. "pastel pink", "all black"). Return null if not specified.',
        },
        season: {
          type: SchemaType.STRING,
          description: 'The target season or weather condition explicitly specified (e.g. "winter", "monsoon"). Return null if not specified.',
        },
        requestedItems: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: 'List of specific clothing items or categories explicitly requested by the user (e.g. ["linen shirt", "cargo pants"]). Leave empty if none are specified.',
        },
        confidence: {
          type: SchemaType.NUMBER,
          description: 'Confidence score (0.0 to 1.0) of the extraction accuracy. Vague prompts have lower confidence.',
        },
        missingInformation: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: 'List of fields not explicitly or implicitly specified in the prompt, chosen from: ["occasion", "budget", "gender", "style", "fit", "color", "season", "requestedItems"].',
        },
      },
      required: ['requestedItems', 'confidence', 'missingInformation'],
    };
  }

  /**
   * Processes the user prompt through Gemini and extracts structured preferences.
   * Performs validation, schema enforcement, and fallback normalization.
   */
  public static async extractPreferences(prompt: string, requestId: string): Promise<StyleBlueprint> {
    const startTime = Date.now();
    Logger.info(`Starting preference extraction from Gemini for prompt: "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"`, requestId);

    try {
      const genAI = this.getClient(requestId);
      const modelName = EnvConfig.getGeminiModel();
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `You are a precise natural language preference extraction service for Drip AI.
Your sole purpose is to parse the user's fashion styling prompt and extract exactly what they requested into a structured JSON object.
CRITICAL RULES:
1. ONLY extract information that is explicitly stated or clearly implied by the user in the prompt.
2. NEVER perform styling, recommend matching items, do product selection, suggest brands, or assume pricing.
3. For any field not explicitly or implicitly mentioned, set it to null and append the field name to the "missingInformation" array.
4. "requestedItems" must only list clothing items or categories that the user explicitly mentioned. Do not add complementary items (e.g., if the user asks for a "shirt", do not suggest pants or shoes).
5. "missingInformation" can contain any of: ["occasion", "budget", "gender", "style", "fit", "color", "season", "requestedItems"]. If the prompt does not list any items, then "requestedItems" is considered missing and should be added to the array.`,
      });

      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.0, // Strict deterministic outputs
          responseMimeType: 'application/json',
          responseSchema: this.getResponseSchema(),
        },
      });

      const text = response.response.text();
      if (!text) {
        throw new GeminiError('Gemini returned an empty response.', requestId);
      }

      Logger.info(`Raw response from Gemini received in ${Date.now() - startTime}ms`, requestId);

      const parsed = JSON.parse(text);

      // Normalize missing fields to null and ensure arrays exist
      const blueprint: StyleBlueprint = {
        occasion: parsed.occasion !== undefined ? parsed.occasion : null,
        budget: parsed.budget !== undefined ? parsed.budget : null,
        gender: parsed.gender !== undefined ? parsed.gender : null,
        style: parsed.style !== undefined ? parsed.style : null,
        fit: parsed.fit !== undefined ? parsed.fit : null,
        color: parsed.color !== undefined ? parsed.color : null,
        season: parsed.season !== undefined ? parsed.season : null,
        requestedItems: Array.isArray(parsed.requestedItems) ? parsed.requestedItems : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : [],
      };

      Logger.info('Preference extraction complete and successfully normalized.', requestId);
      return blueprint;
    } catch (error) {
      Logger.error('Failed to extract preferences from Gemini', error, requestId);
      if (error instanceof GeminiError) {
        throw error;
      }
      throw new GeminiError(`Upstream Gemini execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`, requestId);
    }
  }
}
