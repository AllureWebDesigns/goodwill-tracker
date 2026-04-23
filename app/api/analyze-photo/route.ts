import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CATEGORIES = [
  'Clothing & Shoes',
  'Household Goods',
  'Furniture',
  'Electronics',
  'Books & Media',
  'Toys & Games',
  'Other',
];
const CONDITIONS = ['Excellent', 'Good', 'Fair'];

export async function POST(req: NextRequest) {
  const { image } = await req.json();

  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    const prompt = `Analyze this donation item photo for a Goodwill tax-deduction tracker.

Return ONLY a JSON object (no markdown, no commentary) with this exact shape:
{
  "description": "concise item description including brand if visible, color, type, and any notable size/detail. Max 80 chars.",
  "category": "one of: Clothing & Shoes | Household Goods | Furniture | Electronics | Books & Media | Toys & Games | Other",
  "condition": "one of: Excellent | Good | Fair",
  "suggestedValue": <number — fair market value in USD a thrift shopper would pay. For branded items use resale research; for unbranded basics use Goodwill valuation guide ranges.>,
  "valueRange": "e.g. $15-25",
  "reasoning": "one short sentence explaining the valuation — cite brand/retail if known."
}

Be accurate with brand identification. If you can't identify the item confidently, say so in the description and give a conservative value.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: image,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Claude API error:', data);
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }

    const text = data.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('\n');

    const clean = text.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Validate response
    if (!parsed.description || !parsed.category || !parsed.condition) {
      return NextResponse.json({ error: 'Invalid analysis response' }, { status: 500 });
    }

    // Ensure category and condition are valid
    const validCategory = CATEGORIES.includes(parsed.category)
      ? parsed.category
      : 'Other';
    const validCondition = CONDITIONS.includes(parsed.condition)
      ? parsed.condition
      : 'Good';

    return NextResponse.json({
      description: parsed.description,
      category: validCategory,
      condition: validCondition,
      suggestedValue: Math.round(parsed.suggestedValue * 100) / 100,
      valueRange: parsed.valueRange,
      reasoning: parsed.reasoning,
    });
  } catch (error) {
    console.error('Photo analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze photo' }, { status: 500 });
  }
}
