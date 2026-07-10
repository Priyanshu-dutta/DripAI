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

    // 4. Invoke Style Intelligence Engine
    const { LocalProductProvider } = await import('../../../../services/intelligence/providers/LocalProductProvider');
    const { StyleIntelligenceEngine } = await import('../../../../services/intelligence/StyleIntelligenceEngine');
    
    const productRepository = new LocalProductProvider();
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
