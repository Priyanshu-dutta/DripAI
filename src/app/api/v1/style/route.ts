import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '../../../../utils/logger';
import { PromptSanitizer } from '../../../../utils/sanitizer';
import { GeminiService } from '../../../../services/gemini';
import { BaseError, ValidationError } from '../../../../utils/errors';

/**
 * POST /api/v1/style
 * Ingestion endpoint for the Style Blueprint extraction service.
 * Parses raw natural language user prompt and extracts structured preferences.
 */
export async function POST(request: NextRequest) {
  // Generate a unique request ID for trace logging and debugging
  const requestId = crypto.randomUUID();
  Logger.info('Received new style blueprint extraction request.', requestId);

  try {
    // 1. Parse JSON body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      throw new ValidationError('Invalid request body. Expected raw JSON.', requestId);
    }

    // 2. Validate and sanitize prompt
    const rawPrompt = body?.prompt;
    const sanitizedPrompt = PromptSanitizer.sanitize(rawPrompt, requestId);

    // 3. Invoke preference extraction service
    const blueprint = await GeminiService.extractPreferences(sanitizedPrompt, requestId);

    // Canonical gender normalizer
    const canonicalGender = (val: string | null | undefined): 'male' | 'female' | 'unisex' | null => {
      if (!val) return null;
      const v = val.toLowerCase().trim();
      if (v === 'men' || v === 'male' || v === 'mens' || v === 'men\'s' || v === 'man' || v === 'boy') return 'male';
      if (v === 'women' || v === 'female' || v === 'ladies' || v === 'women\'s' || v === 'woman' || v === 'girl' || v === 'lady') return 'female';
      if (v === 'unisex') return 'unisex';
      return null;
    };

    // Extract prompt-based gender keywords
    const parsePromptGender = (promptText: string): 'male' | 'female' | null => {
      const promptLower = promptText.toLowerCase();
      // Check female first to prevent substring conflicts (e.g. 'women' containing 'men')
      if (promptLower.includes('women') || promptLower.includes('woman') || promptLower.includes('female') || promptLower.includes('ladies') || promptLower.includes('girl') || promptLower.includes('lady')) {
        return 'female';
      }
      if (promptLower.includes('men') || promptLower.includes('man') || promptLower.includes('male') || promptLower.includes('boy')) {
        return 'male';
      }
      return null;
    };

    // Determine resolved gender using Step 2 Priority Rules:
    // 1. Explicit UI Selected Gender
    // 2. Gemini Extracted Gender
    // 3. Prompt Text inferred gender
    // 4. Default Fallback ('unisex')
    const uiGenderRaw = body?.filters?.gender;
    const uiGender = canonicalGender(uiGenderRaw);
    const geminiGender = canonicalGender(blueprint.gender);
    const promptGender = parsePromptGender(sanitizedPrompt);

    const resolvedGender = uiGender || geminiGender || promptGender || 'unisex';

    // Merge manual UI filters if present in request body to override/supplement AI guesses
    if (body?.filters) {
      const f = body.filters;
      if (f.occasion) blueprint.occasion = f.occasion;
      if (f.budget) blueprint.budget = f.budget;
      if (f.style) blueprint.style = f.style;
      if (f.fit) blueprint.fit = f.fit;
      if (f.season) blueprint.season = f.season;
    }

    // Set resolved gender as the single source of truth in blueprint
    blueprint.gender = resolvedGender;

    // Populate diagnostics tracking properties
    blueprint.promptText = sanitizedPrompt;
    blueprint.uiGender = uiGenderRaw || null;
    blueprint.geminiGender = geminiGender || null;

    // 4. Invoke Style Intelligence Engine
    const { ProductProviderFactory } = await import('../../../../services/intelligence/providers/ProductProviderFactory');
    const { StyleIntelligenceEngine } = await import('../../../../services/intelligence/StyleIntelligenceEngine');
    
    const productRepository = ProductProviderFactory.getProvider(blueprint);
    const recommendations = await StyleIntelligenceEngine.generateRecommendations(
      blueprint,
      productRepository,
      requestId
    );

    // 5. Return the structured blueprint and recommendations
    return NextResponse.json(
      {
        blueprint,
        recommendations,
      },
      {
        status: 200,
        headers: {
          'x-request-id': requestId,
        },
      }
    );
  } catch (error) {
    Logger.error('Request failed in style blueprint endpoint', error, requestId);

    if (error instanceof BaseError) {
      return NextResponse.json(error.toJSON(), {
        status: error.status,
        headers: {
          'x-request-id': requestId,
        },
      });
    }

    // Fallback for unhandled internal server errors
    const internalStatus = 500;
    return NextResponse.json(
      {
        error: 'InternalServerError',
        message: 'An unexpected operational error occurred.',
        requestId,
        status: internalStatus,
      },
      {
        status: internalStatus,
        headers: {
          'x-request-id': requestId,
        },
      }
    );
  }
}

/**
 * Handle HTTP methods other than POST.
 */
export async function GET(request: NextRequest) {
  return handleMethodNotAllowed();
}

export async function PUT(request: NextRequest) {
  return handleMethodNotAllowed();
}

export async function DELETE(request: NextRequest) {
  return handleMethodNotAllowed();
}

export async function PATCH(request: NextRequest) {
  return handleMethodNotAllowed();
}

function handleMethodNotAllowed() {
  return NextResponse.json(
    {
      error: 'MethodNotAllowed',
      message: 'Only POST requests are supported on this endpoint.',
    },
    {
      status: 405,
    }
  );
}
