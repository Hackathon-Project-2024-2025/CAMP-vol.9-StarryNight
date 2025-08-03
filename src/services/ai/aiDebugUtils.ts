import type { AISelections } from '../../types/ai.types';
import type { AIGenerationParams, AIFishDesign } from '../../types/aiFish.types';

// デバッグログの設定
const DEBUG_ENABLED = import.meta.env.DEV;

// デバッグログ出力
export function debugLog(category: string, message: string, data?: unknown): void {
  if (!DEBUG_ENABLED) return;

  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}] [AI-CREATE] [${category.toUpperCase()}]`;
  
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// AI生成プロセスの詳細ログ
export function logGenerationProcess(
  step: string,
  selections: AISelections,
  params?: AIGenerationParams,
  result?: AIFishDesign,
  error?: Error
): void {
  if (!DEBUG_ENABLED) return;

  console.group(`🤖 AI Generation Process - ${step}`);
  
  switch (step) {
    case 'START':
      console.log('📝 User Selections:', selections);
      break;
      
    case 'CONVERT':
      console.log('📝 Original Selections:', selections);
      console.log('🔄 Converted Parameters:', params);
      break;
      
    case 'PROMPT':
      console.log('💭 Generation Parameters:', params);
      break;
      
    case 'SUCCESS':
      console.log('✅ Generated Design:', {
        id: result?.id,
        name: result?.name,
        generationTime: result?.generationTime,
        aiModel: result?.aiModel,
        boundingBox: result?.boundingBox
      });
      console.log('🎨 Full Design Data:', result);
      break;
      
    case 'ERROR':
      console.error('❌ Generation Failed:', error);
      break;
  }
  
  console.groupEnd();
}

// AIFishDesignの検証とデバッグ
export function validateAndDebugFishDesign(design: AIFishDesign): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 必須プロパティの検証
  if (!design.id) errors.push('Missing design ID');
  if (!design.name) errors.push('Missing design name');
  if (!design.shape) errors.push('Missing shape data');
  if (!design.coloring) errors.push('Missing coloring data');

  // 形状データの検証
  if (design.shape) {
    if (!design.shape.bodyPath || design.shape.bodyPath.length < 3) {
      errors.push('Invalid body path - needs at least 3 points');
    }
    
    if (!design.shape.leftEye || !design.shape.rightEye) {
      errors.push('Missing eye data');
    }
    
    if (!design.shape.mouth) {
      errors.push('Missing mouth data');
    }

    // ヒレデータの検証
    const fins = ['dorsalFin', 'pectoralFin', 'tailFin'];
    fins.forEach(fin => {
      const finData = design.shape[fin as keyof typeof design.shape];
      if (finData && Array.isArray(finData) && finData.length < 2) {
        warnings.push(`${fin} has insufficient points`);
      }
    });
  }

  // 色データの検証
  if (design.coloring) {
    const colorRegex = /^#[0-9a-fA-F]{6}$/;
    
    const baseColorString = typeof design.coloring.baseColor === 'string' 
      ? design.coloring.baseColor 
      : (design.coloring.baseColor as { startColor: string }).startColor;
    
    if (!colorRegex.test(baseColorString)) {
      errors.push('Invalid base color format');
    }
    
    if (!colorRegex.test(design.coloring.eyeColor)) {
      errors.push('Invalid eye color format');
    }
    
    if (!colorRegex.test(design.coloring.pupilColor)) {
      errors.push('Invalid pupil color format');
    }
  }

  // バウンディングボックスの検証
  if (design.boundingBox) {
    if (design.boundingBox.width <= 0 || design.boundingBox.height <= 0) {
      errors.push('Invalid bounding box dimensions');
    }
  } else {
    warnings.push('Missing bounding box data');
  }

  if (DEBUG_ENABLED) {
    console.group('🔍 Fish Design Validation');
    console.log('Design ID:', design.id);
    console.log('Errors:', errors);
    console.log('Warnings:', warnings);
    console.groupEnd();
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// パフォーマンス測定
export class PerformanceTracker {
  private startTimes: Map<string, number> = new Map();
  
  start(operation: string): void {
    if (!DEBUG_ENABLED) return;
    this.startTimes.set(operation, performance.now());
    debugLog('PERF', `Started: ${operation}`);
  }
  
  end(operation: string): number {
    if (!DEBUG_ENABLED) return 0;
    
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      debugLog('PERF', `Warning: No start time found for ${operation}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    debugLog('PERF', `Completed: ${operation} (${duration.toFixed(2)}ms)`);
    this.startTimes.delete(operation);
    
    return duration;
  }
}

// AI応答データの詳細分析
export function analyzeAIResponse(response: unknown): {
  summary: string;
  dataTypes: Record<string, string>;
  recommendations: string[];
} {
  if (!DEBUG_ENABLED) {
    return { summary: '', dataTypes: {}, recommendations: [] };
  }

  const recommendations: string[] = [];
  const dataTypes: Record<string, string> = {};
  
  function analyzeObject(obj: unknown, path = ''): void {
    if (obj === null) {
      dataTypes[path] = 'null';
    } else if (Array.isArray(obj)) {
      dataTypes[path] = `array[${obj.length}]`;
      if (obj.length > 0) {
        analyzeObject(obj[0], `${path}[0]`);
      }
    } else if (typeof obj === 'object') {
      dataTypes[path] = 'object';
      Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
        analyzeObject(value, path ? `${path}.${key}` : key);
      });
    } else {
      dataTypes[path] = typeof obj;
    }
  }

  analyzeObject(response);

  // 推奨事項の生成
  if (!dataTypes['name']) {
    recommendations.push('Add name property for better fish identification');
  }
  
  if (!dataTypes['drawing']) {
    recommendations.push('Include drawing object with shape data');
  }
  
  if (!dataTypes['colors']) {
    recommendations.push('Include colors object with color specifications');
  }

  const summary = `
AI Response Analysis:
- Total properties: ${Object.keys(dataTypes).length}  
- Has drawing data: ${!!dataTypes['drawing']}
- Has color data: ${!!dataTypes['colors']}
- Recommendations: ${recommendations.length}
  `.trim();

  return { summary, dataTypes, recommendations };
}

// エラー報告とリカバリー情報
export function generateErrorReport(
  error: Error,
  context: {
    selections?: AISelections;
    params?: AIGenerationParams;
    aiModel?: string;
    step?: string;
  }
): {
  errorId: string;
  report: string;
  recoverySuggestions: string[];
} {
  const errorId = `AI-ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  const recoverySuggestions: string[] = [];
  
  // エラータイプ別の提案
  if (error.message.includes('API key')) {
    recoverySuggestions.push('Check API key configuration in environment variables');
    recoverySuggestions.push('Verify API key permissions and quotas');
  }
  
  if (error.message.includes('timeout') || error.message.includes('network')) {
    recoverySuggestions.push('Check internet connection');
    recoverySuggestions.push('Try again in a few moments');
    recoverySuggestions.push('Consider using a different AI model');
  }
  
  if (error.message.includes('JSON') || error.message.includes('parse')) {
    recoverySuggestions.push('AI response format was unexpected');
    recoverySuggestions.push('Try regenerating with different settings');
    recoverySuggestions.push('Consider simplifying the generation parameters');
  }
  
  if (error.message.includes('quota') || error.message.includes('limit')) {
    recoverySuggestions.push('API usage limit reached');
    recoverySuggestions.push('Wait for quota reset or try different AI model');
  }

  const report = `
ERROR REPORT [${errorId}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time: ${new Date().toISOString()}
Step: ${context.step || 'Unknown'}
AI Model: ${context.aiModel || 'Unknown'}

Error Details:
  Type: ${error.name}
  Message: ${error.message}
  Stack: ${error.stack?.split('\n').slice(0, 3).join('\n') || 'Not available'}

Context:
  Selections: ${context.selections ? JSON.stringify(context.selections, null, 2) : 'Not provided'}
  Parameters: ${context.params ? JSON.stringify(context.params, null, 2) : 'Not provided'}

Recovery Suggestions:
${recoverySuggestions.map(s => `  • ${s}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();

  if (DEBUG_ENABLED) {
    console.error(report);
  }

  return { errorId, report, recoverySuggestions };
}

// デバッグ用のグローバル関数（開発時のみ）
if (DEBUG_ENABLED && typeof window !== 'undefined') {
  (window as unknown as { aiDebug: unknown }).aiDebug = {
    debugLog,
    logGenerationProcess,
    validateAndDebugFishDesign,
    analyzeAIResponse,
    generateErrorReport
  };
  
  console.log('🐠 AI Debug utilities available at window.aiDebug');
}