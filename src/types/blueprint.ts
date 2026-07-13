/**
 * Strict TypeScript interface representing the parsed user style blueprint.
 * This represents ONLY the explicit and implicit parameters extracted from the user's prompt.
 * It does not contain recommendation or product matching data.
 */
export interface StyleBlueprint {
  /**
   * The occasion the user is dressing for (e.g. "wedding", "job interview", "casual weekend").
   * Null if not specified in the prompt.
   */
  occasion: string | null;

  /**
   * The budget target or limit expressed by the user (e.g. "$150", "under 5000 INR").
   * Null if not specified in the prompt.
   */
  budget: string | null;

  /**
   * The target gender expressed by the user (e.g. "male", "female", "unisex").
   * Null if not specified in the prompt.
   */
  gender: string | null;

  /**
   * The specific styling genre or vibe requested (e.g. "streetwear", "minimalist", "gothic").
   * Null if not specified in the prompt.
   */
  style: string | null;

  /**
   * The clothing fit preference (e.g. "oversized", "slim-fit", "baggy").
   * Null if not specified in the prompt.
   */
  fit: string | null;

  /**
   * Preferred colors or color palettes specified by the user (e.g. "monochrome", "pastel pink", "earthy tones").
   * Null if not specified in the prompt.
   */
  color: string | null;

  /**
   * The target season or weather condition (e.g. "winter", "monsoon", "hot summer").
   * Null if not specified in the prompt.
   */
  season: string | null;

  /**
   * Specific clothing items or categories explicitly requested by the user.
   * Example: ["linen shirt", "black cargo pants", "boots"].
   * Empty array if none are specified.
   */
  requestedItems: string[];

  /**
   * The confidence level of the Gemini service in this extraction (range 0.0 - 1.0).
   */
  confidence: number;

  /**
   * Array of parameters (e.g. ["budget", "gender"]) that were not specified in the user's prompt.
   * This allows the frontend to dynamically prompt the user for clarification.
   */
  missingInformation: string[];

  /**
   * Diagnostics tracing fields for gender enforcement
   */
  promptText?: string;
  uiGender?: string | null;
  geminiGender?: string | null;
}

/**
 * Shape of the incoming request body for the style endpoint.
 */
export interface StyleRequest {
  prompt: string;
}
