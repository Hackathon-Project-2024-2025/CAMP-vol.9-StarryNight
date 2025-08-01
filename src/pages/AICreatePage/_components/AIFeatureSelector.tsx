import type { AISelections, SelectOption, AIFeatureOptions } from '../../../types/ai.types';
import './AIFeatureSelector.css';

interface AIFeatureSelectorProps {
  selections: AISelections;
  onSelectionsChange: (newSelections: Partial<AISelections>) => void;
}

// 特徴選択オプション定義
const FEATURE_OPTIONS: AIFeatureOptions = {
  bodyTypes: [
    { value: 'round', label: '丸型', description: 'ふっくらした可愛らしい体型' },
    { value: 'streamlined', label: '流線型', description: 'スピード感のあるスマートな体型' },
    { value: 'flat', label: '平型', description: '横に平たい優雅な体型' },
    { value: 'elongated', label: '細長型', description: 'ウナギのような細長い体型' }
  ],
  baseColors: [
    { value: 'red', label: '赤系', description: '情熱的な赤やオレンジ' },
    { value: 'blue', label: '青系', description: '涼しげな青や水色' },
    { value: 'yellow', label: '黄系', description: '明るい黄色やゴールド' },
    { value: 'white', label: '白系', description: '上品な白やシルバー' },
    { value: 'black', label: '黒系', description: '重厚な黒やグレー' },
    { value: 'colorful', label: 'カラフル', description: '多彩な色の組み合わせ' }
  ],
  sizes: [
    { value: 'small', label: '小さめ', description: '手のひらサイズの愛らしい金魚' },
    { value: 'medium', label: '普通', description: 'バランスの良い標準サイズ' },
    { value: 'large', label: '大きめ', description: '存在感のある大型金魚' }
  ],
  personalities: [
    { value: 'calm', label: 'おとなしい', description: '穏やかで上品な印象' },
    { value: 'active', label: '活発', description: 'エネルギッシュで動的な印象' },
    { value: 'elegant', label: '優雅', description: '洗練された美しい印象' },
    { value: 'unique', label: 'ユニーク', description: '個性的で印象的な外見' }
  ],
  fins: [
    { value: 'standard', label: '標準', description: '一般的なバランスの良いヒレ' },
    { value: 'large', label: '大きい', description: '存在感のある大きなヒレ' },
    { value: 'decorative', label: '装飾的', description: '華やかで装飾的なヒレ' },
    { value: 'simple', label: 'シンプル', description: 'すっきりとした控えめなヒレ' }
  ],
  eyes: [
    { value: 'normal', label: '普通', description: '標準的なサイズと形の目' },
    { value: 'large', label: '大きい', description: 'ぱっちりした大きな目' },
    { value: 'small', label: '小さい', description: '控えめで可愛らしい小さな目' },
    { value: 'distinctive', label: '特徴的', description: '印象的で個性的な目' }
  ],
  patterns: [
    { value: 'none', label: 'なし', description: '単色の美しい体' },
    { value: 'spotted', label: 'まだら', description: '斑点模様の個性的な体' },
    { value: 'striped', label: '縞模様', description: 'ストライプ柄の印象的な体' },
    { value: 'polka', label: '水玉', description: '水玉模様の可愛らしい体' },
    { value: 'gradient', label: 'グラデーション', description: '色が徐々に変化する美しい体' }
  ],
  headAccessories: [
    { value: 'none', label: 'なし', description: 'シンプルな頭部' },
    { value: 'crown', label: '王冠', description: '華やかな王冠で高貴な印象' },
    { value: 'hat', label: '帽子', description: 'キュートな帽子でお洒落に' },
    { value: 'ribbon', label: 'リボン', description: '可愛らしいリボンで愛らしく' }
  ],
  faceAccessories: [
    { value: 'none', label: 'なし', description: 'ナチュラルな顔' },
    { value: 'glasses', label: 'メガネ', description: '知的な印象のメガネ' },
    { value: 'sunglasses', label: 'サングラス', description: 'クールなサングラス' }
  ],
  neckAccessories: [
    { value: 'none', label: 'なし', description: 'シンプルな首元' },
    { value: 'necklace', label: 'ネックレス', description: '上品なネックレス' },
    { value: 'bowtie', label: '蝶ネクタイ', description: 'フォーマルな蝶ネクタイ' }
  ]
};

// セレクトボックスコンポーネント
interface SelectFieldProps {
  label: string;
  icon: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

function SelectField({ label, icon, value, options, onChange }: SelectFieldProps) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="select-field">
      <label className="select-label">
        <span className="label-icon">{icon}</span>
        <span className="label-text">{label}</span>
      </label>
      
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="select-input"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {selectedOption?.description && (
        <p className="select-description">{selectedOption.description}</p>
      )}
    </div>
  );
}

export default function AIFeatureSelector({ selections, onSelectionsChange }: AIFeatureSelectorProps) {
  const handleChange = (key: keyof AISelections, value: string) => {
    onSelectionsChange({ [key]: value } as Partial<AISelections>);
  };

  return (
    <div className="ai-feature-selector">
      <div className="selector-header">
        <h3 className="selector-title">
          <span className="selector-icon">🎨</span>
          金魚の特徴設定
        </h3>
        <p className="selector-description">
          作りたい金魚の特徴を選択してください
        </p>
      </div>

      <div className="feature-groups">
        {/* 基本特徴グループ */}
        <div className="feature-group">
          <h4 className="group-title">
            <span className="group-icon">🐠</span>
            基本特徴
          </h4>
          <div className="group-fields">
            <SelectField
              label="体型"
              icon="🔄"
              value={selections.bodyType}
              options={FEATURE_OPTIONS.bodyTypes}
              onChange={(value) => handleChange('bodyType', value)}
            />
            
            <SelectField
              label="基本色"
              icon="🎨"
              value={selections.baseColor}
              options={FEATURE_OPTIONS.baseColors}
              onChange={(value) => handleChange('baseColor', value)}
            />
            
            <SelectField
              label="サイズ"
              icon="📏"
              value={selections.size}
              options={FEATURE_OPTIONS.sizes}
              onChange={(value) => handleChange('size', value)}
            />
            
            <SelectField
              label="性格"
              icon="💭"
              value={selections.personality}
              options={FEATURE_OPTIONS.personalities}
              onChange={(value) => handleChange('personality', value)}
            />
          </div>
        </div>

        {/* 詳細特徴グループ */}
        <div className="feature-group">
          <h4 className="group-title">
            <span className="group-icon">✨</span>
            詳細特徴
          </h4>
          <div className="group-fields">
            <SelectField
              label="ヒレ"
              icon="🌊"
              value={selections.fins}
              options={FEATURE_OPTIONS.fins}
              onChange={(value) => handleChange('fins', value)}
            />
            
            <SelectField
              label="目"
              icon="👁️"
              value={selections.eyes}
              options={FEATURE_OPTIONS.eyes}
              onChange={(value) => handleChange('eyes', value)}
            />
            
            <SelectField
              label="模様"
              icon="🎭"
              value={selections.pattern}
              options={FEATURE_OPTIONS.patterns}
              onChange={(value) => handleChange('pattern', value)}
            />
          </div>
        </div>

        {/* アクセサリーグループ */}
        <div className="feature-group">
          <h4 className="group-title">
            <span className="group-icon">👑</span>
            アクセサリー
          </h4>
          <div className="group-fields">
            <SelectField
              label="頭部"
              icon="👑"
              value={selections.headAccessory}
              options={FEATURE_OPTIONS.headAccessories}
              onChange={(value) => handleChange('headAccessory', value)}
            />
            
            <SelectField
              label="顔部"
              icon="👓"
              value={selections.faceAccessory}
              options={FEATURE_OPTIONS.faceAccessories}
              onChange={(value) => handleChange('faceAccessory', value)}
            />
            
            <SelectField
              label="首部"
              icon="📿"
              value={selections.neckAccessory}
              options={FEATURE_OPTIONS.neckAccessories}
              onChange={(value) => handleChange('neckAccessory', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}