import type { AIGenerationParams, AIFishGenerationResponse } from '../../types/aiFish.types';

// 感情・コンセプトから芸術的表現への変換マップ
const CREATIVE_CONCEPTS = {
  elegant: {
    description: 'graceful, refined, sophisticated with flowing lines and subtle beauty',
    colors: 'soft pastels, pearl whites, gentle silvers, subtle golds',
    movement: 'flowing, undulating, serene'
  },
  mystical: {
    description: 'otherworldly, magical, with ethereal qualities and mysterious aura',
    colors: 'deep purples, midnight blues, shimmering silvers, phantom whites',
    movement: 'floating, dreamy, enigmatic'
  },
  powerful: {
    description: 'strong, commanding presence with bold forms and dynamic energy',
    colors: 'deep reds, burning oranges, royal golds, striking blacks',
    movement: 'strong, decisive, commanding'
  },
  cute: {
    description: 'adorable, charming, endearing with soft rounded features',
    colors: 'warm pinks, sunny yellows, soft oranges, creamy whites',
    movement: 'playful, bouncy, cheerful'
  },
  traditional: {
    description: 'classic Japanese kingyo aesthetics with cultural authenticity',
    colors: 'traditional reds, calico patterns, classic oranges, pure whites',
    movement: 'graceful, measured, harmonious'
  },
  modern: {
    description: 'contemporary, innovative design with unique artistic flair',
    colors: 'neon accents, metallic sheens, bold contrasts, artistic gradients',
    movement: 'dynamic, angular, expressive'
  }
};

const MOOD_EXPRESSIONS = {
  calm: 'peaceful, serene, meditative with gentle flowing lines',
  dynamic: 'energetic, vibrant, full of motion and life',
  graceful: 'elegant movements, refined posture, harmonious proportions',
  playful: 'joyful, spirited, with lively and fun characteristics',
  noble: 'dignified, majestic, with regal bearing and refined features',
  mysterious: 'enigmatic, secretive, with intriguing and captivating qualities'
};

const COLOR_PALETTES = {
  warm: 'reds, oranges, yellows, warm pinks, golden tones',
  cool: 'blues, greens, purples, cool silvers, icy whites',
  vibrant: 'bright saturated colors, bold contrasts, vivid hues',
  subtle: 'muted tones, soft pastels, gentle gradients, understated elegance',
  monochrome: 'single color family with various shades and tints',
  rainbow: 'spectrum of colors blending harmoniously across the form'
};

// 創造的なプロンプト生成
export function buildCreativeFishPrompt(params: AIGenerationParams): {
  system: string;
  user: string;
} {
  const concept = CREATIVE_CONCEPTS[params.concept as keyof typeof CREATIVE_CONCEPTS] || CREATIVE_CONCEPTS.elegant;
  const mood = MOOD_EXPRESSIONS[params.mood as keyof typeof MOOD_EXPRESSIONS] || MOOD_EXPRESSIONS.calm;
  const colorPalette = COLOR_PALETTES[params.colorTone as keyof typeof COLOR_PALETTES] || COLOR_PALETTES.warm;

  const systemPrompt = `You are a master artist specializing in creating unique, beautiful Japanese goldfish (kingyo) designs. You possess deep knowledge of:

- Traditional Japanese aesthetics and kingyo culture
- Color harmony and artistic composition  
- Organic, flowing forms that capture the essence of life
- The ability to translate emotions and concepts into visual art

Your task is to create a complete goldfish design as a unified, artistic whole - NOT as separate parts or components. Think of yourself as painting a single, coherent artwork.

CRITICAL: Respond with a properly formatted JSON object containing detailed drawing instructions and artistic specifications. The design should be conceived as one integrated artwork, with all elements working together harmoniously.

Required JSON format:
{
  "name": "Poetic Japanese name for the goldfish",
  "description": "Artistic description of the goldfish's appearance and character",
  "culturalBackground": "Brief explanation of cultural or artistic inspiration",
  "drawing": {
    "bodyPath": "SVG-style path string or coordinate description for the main body shape",
    "fins": {
      "dorsal": "Description/coordinates for dorsal fin integrated with body",
      "pectoral": "Description/coordinates for pectoral fins",
      "tail": "Description/coordinates for tail fin",
      "ventral": "Description/coordinates for ventral fins (optional)",
      "anal": "Description/coordinates for anal fin (optional)"
    },
    "eyes": {
      "left": {"x": number, "y": number, "radius": number, "shape": "circle/oval/almond"},
      "right": {"x": number, "y": number, "radius": number, "shape": "circle/oval/almond"}
    },
    "mouth": {
      "x": number, "y": number, "width": number, "height": number, "shape": "line/oval/curve"
    }
  },
  "colors": {
    "body": "hex color or gradient object",
    "fins": {
      "dorsal": "hex color",
      "pectoral": "hex color", 
      "tail": "hex color",
      "ventral": "hex color",
      "anal": "hex color"
    },
    "eyes": "hex color for iris",
    "pupils": "hex color for pupils",
    "patterns": [
      {
        "type": "spots/stripes/swirls/scales/abstract",
        "color": "hex color",
        "opacity": number between 0-1,
        "positions": [{"x": number, "y": number}]
      }
    ]
  },
  "effects": {
    "shimmer": {
      "color": "hex color",
      "intensity": number between 0-1,
      "pattern": "random/scales/stripes"
    }
  }
}

Focus on creating a unified, artistic vision rather than assembling separate parts.`;

  const creativityModifier = params.creativityLevel > 0.7 ? 'highly innovative and unique' : 
                           params.creativityLevel > 0.4 ? 'creatively balanced' : 
                           'respectfully traditional';

  const scaleDescription = {
    small: 'delicate, intimate scale with fine details',
    medium: 'balanced proportions with harmonious sizing', 
    large: 'impressive, commanding presence'
  }[params.scale];

  const complexityLevel = {
    simple: 'clean, minimalist design with elegant simplicity',
    moderate: 'balanced complexity with thoughtful details',
    complex: 'intricate, richly detailed with sophisticated elements'
  }[params.complexity];

  const userPrompt = `Create a Japanese goldfish that embodies these artistic qualities:

🎨 ARTISTIC CONCEPT: ${concept.description}
🌊 EMOTIONAL MOOD: ${mood}
🎯 COLOR HARMONY: Use ${colorPalette}
📏 SCALE & PRESENCE: ${scaleDescription}
✨ ARTISTIC COMPLEXITY: ${complexityLevel}
🎭 CREATIVITY LEVEL: ${creativityModifier}

${params.customRequest ? `\n🎪 SPECIAL REQUEST: ${params.customRequest}` : ''}

IMPORTANT ARTISTIC GUIDELINES:
- Design the goldfish as a single, unified artwork
- Let the form flow naturally, like a living creature in water
- Use colors that create emotional resonance
- Consider Japanese aesthetic principles: ma (negative space), wabi-sabi (imperfect beauty), kanso (simplicity)
- The design should evoke the specified mood and concept throughout every aspect
- Create a sense of life and movement even in stillness

Think of this as creating a traditional Japanese painting where every brushstroke serves the whole composition. The goldfish should feel alive, emotionally expressive, and artistically cohesive.

Respond only with the properly formatted JSON object.`;

  return {
    system: systemPrompt,
    user: userPrompt
  };
}

// プロンプトバリデーション
export function validateCreativePrompt(params: AIGenerationParams): string[] {
  const errors: string[] = [];
  
  if (!params.concept) {
    errors.push('Concept is required');
  }
  
  if (!params.mood) {
    errors.push('Mood is required');
  }
  
  if (!params.colorTone) {
    errors.push('Color tone is required');
  }
  
  if (!['small', 'medium', 'large'].includes(params.scale)) {
    errors.push('Scale must be small, medium, or large');
  }
  
  if (!['simple', 'moderate', 'complex'].includes(params.complexity)) {
    errors.push('Complexity must be simple, moderate, or complex');
  }
  
  if (params.creativityLevel < 0.1 || params.creativityLevel > 1.0) {
    errors.push('Creativity level must be between 0.1 and 1.0');
  }
  
  return errors;
}

// AI応答のバリデーション
export function validateCreativeAIResponse(response: unknown): response is AIFishGenerationResponse['data'] {
  if (typeof response !== 'object' || response === null) {
    return false;
  }
  
  const obj = response as Record<string, unknown>;
  
  return (
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.drawing === 'object' &&
    typeof obj.colors === 'object'
  );
}

// デフォルトの創造的パラメータ
export function createDefaultCreativeParams(): AIGenerationParams {
  return {
    concept: 'elegant',
    mood: 'calm',
    colorTone: 'warm',
    scale: 'medium',
    complexity: 'moderate',
    creativityLevel: 0.6,
    customRequest: ''
  };
}