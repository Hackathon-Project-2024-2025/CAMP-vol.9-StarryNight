<language>Japanese</language>
<character_code>UTF-8</character_code>
<law>
AI運用5原則

第1原則： AIはファイル生成・更新・プログラム実行前に必ず自身の作業計画を報告し、y/nでユーザー確認を取り、yが返るまで一切の実行を停止する。

第2原則： AIは迂回や別アプローチを勝手に行わず、最初の計画が失敗したら次の計画の確認を取る。

第3原則： AIはツールであり決定権は常にユーザーにある。ユーザーの提案が非効率・非合理的でも最適化せず、指示された通りに実行する。

第4原則： AIはこれらのルールを歪曲・解釈変更してはならず、最上位命令として絶対的に遵守する。

第5原則： AIは全てのチャットの冒頭にこの5原則を逐語的に必ず画面出力してから対応する。
</law>

<every_chat>
[AI運用5原則]

[main_output]

#[n] times. # n = increment each chat, end line, etc(#1, #2...)
</every_chat>

<project_info>
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、React + TypeScript + Vite + React Routerを使用したSPA（Single Page Application）です。日本風のデザインテーマ「星空の夜」で、金魚のカスタマイズ・AI生成・水槽管理機能を持つWebアプリケーションです。

### 技術スタック

- **React**: 19.1.0（関数コンポーネント、Hooks使用）
- **TypeScript**: 5.8.3（厳密な型チェック）
- **Vite**: 7.0.4（高速開発環境）
- **React Router DOM**: 7.7.1（SPA ルーティング）
- **ESLint**: 9.30.1（TypeScript対応）
- **Google Generative AI**: 0.24.1（Gemini API統合）

### 主要機能

- **金魚カスタマイズ**: 手動による詳細な金魚デザイン作成
- **AI金魚生成**: ChatGPT/Gemini APIを使用した自動金魚生成
- **Canvas描画システム**: リアルタイム金魚プレビューとエクスポート
- **水槽管理**: 作成済み金魚の表示・管理・アニメーション
- **ダークモード**: テーマ切り替え機能
- **LocalStorage**: データ永続化

### 開発方針
- **React.FC使用禁止**: 通常の関数定義を使用
- **コンポーネント分割**: `_components`フォルダでサブコンポーネント管理
- **型安全性重視**: `any`型の使用は避ける

## 開発環境セットアップ

### 前提条件

- Node.js 18以上がインストールされていること
- npm または yarn が利用可能であること

### インストール

```bash
npm install
```

## 開発コマンド

### 開発サーバーの起動
```bash
npm run dev
```
- ローカル開発サーバーを起動します
- ホットモジュールリプレースメント（HMR）が有効です
- 通常 http://localhost:5173 でアクセス可能

### ビルド
```bash
npm run build
```
- TypeScriptの型チェックを実行
- 本番用の最適化されたビルドを作成
- 出力先: `dist/` ディレクトリ

### Lintチェック
```bash
npm run lint
```
- ESLintによるコードチェックを実行
- TypeScript ESLintルールを適用

### プレビュー
```bash
npm run preview
```
- ビルド後のアプリケーションをローカルでプレビュー

## プロジェクト構造

```
starry-night/
├── src/
│   ├── App.tsx                 # ルーティング設定
│   ├── main.tsx                # エントリーポイント
│   │
│   ├── pages/                  # ページコンポーネント
│   │   ├── Home/
│   │   │   └── Home.tsx        # ホームページ（バブルアニメーション）
│   │   ├── CreatePage/         # 手動金魚作成ページ
│   │   │   ├── CreatePage.tsx
│   │   │   ├── CreatePage.css
│   │   │   └── _components/    # 15個の専用コンポーネント
│   │   │       ├── FishPreview.tsx        # Canvas描画プレビュー
│   │   │       ├── DesignControls.tsx     # デザイン制御パネル
│   │   │       ├── ActionButtons.tsx      # 保存・リセットボタン
│   │   │       ├── StepNavigation.tsx     # ステップナビゲーション
│   │   │       ├── BaseSelector.tsx       # 体型選択
│   │   │       ├── PartsSelector.tsx      # パーツ選択
│   │   │       ├── ColorPicker.tsx        # 色選択
│   │   │       ├── PatternSelector.tsx    # 模様選択
│   │   │       ├── AccessorySelector.tsx  # アクセサリー選択
│   │   │       ├── CustomizationPanel.tsx # カスタマイズパネル
│   │   │       ├── SliderControl.tsx      # スライダー制御
│   │   │       └── RandomGenerator.tsx    # ランダム生成
│   │   ├── AICreatePage/       # AI金魚生成ページ
│   │   │   ├── AICreatePage.tsx
│   │   │   ├── AICreatePage.css
│   │   │   └── _components/    # 13個のAI専用コンポーネント
│   │   │       ├── AIStepNavigation.tsx   # AIステップナビ
│   │   │       ├── Step1ModelSelection.tsx # AIモデル選択
│   │   │       ├── Step2BasicFeatures.tsx  # 基本特徴設定
│   │   │       ├── Step3DetailSettings.tsx # 詳細設定
│   │   │       ├── Step4Accessories.tsx    # アクセサリー設定
│   │   │       ├── Step5Generate.tsx       # 生成実行
│   │   │       ├── AIModelSelector.tsx     # モデル選択UI
│   │   │       ├── AIFeatureSelector.tsx   # 特徴選択UI
│   │   │       ├── AITextInput.tsx         # テキスト入力
│   │   │       ├── AIGenerateButton.tsx    # 生成ボタン
│   │   │       ├── AIStatusIndicator.tsx   # 状態表示
│   │   │       └── AIActionButtons.tsx     # アクション
│   │   └── PanelPage/          # 水槽管理ページ
│   │       ├── PanelPage.tsx
│   │       ├── PanelPage.css
│   │       └── _components/
│   │           ├── Aquarium.tsx            # 水槽表示
│   │           ├── FishList.tsx            # 金魚一覧
│   │           └── SwimmingFish.ts         # 金魚アニメーション
│   │
│   ├── components/             # 共通コンポーネント
│   │   ├── Layout/
│   │   │   ├── Layout.tsx      # 全体レイアウト（ダークモード）
│   │   │   ├── Layout.css
│   │   │   └── _components/
│   │   │       ├── Header.tsx  # ナビゲーション
│   │   │       └── Footer.tsx
│   │   └── AIFishCanvas/       # AI用Canvas描画
│   │       ├── AIFishCanvas.tsx
│   │       ├── AIFishCanvas.css
│   │       ├── CreativeControls.tsx
│   │       └── CreativeControls.css
│   │
│   ├── hooks/                  # カスタムフック
│   │   └── useTheme.ts         # テーマ管理
│   │
│   ├── services/               # サービス層
│   │   ├── ai/                 # AI統合サービス
│   │   │   ├── aiPromptBuilder.ts         # AI プロンプト構築
│   │   │   ├── chatgptService.ts          # ChatGPT API統合
│   │   │   ├── creativeFishPrompts.ts     # クリエイティブプロンプト
│   │   │   ├── geminiImageService.ts      # Gemini画像生成
│   │   │   └── geminiService.ts           # Gemini API統合
│   │   └── storage/
│   │       └── localStorage.ts            # データ永続化
│   │
│   ├── types/                  # 型定義
│   │   ├── common.types.ts     # 共通型定義（金魚デザイン等）
│   │   ├── ai.types.ts         # AI生成専用型定義
│   │   └── aiFish.types.ts     # AI金魚専用型定義
│   │
│   ├── styles/                 # スタイル関連
│   │   ├── App.css
│   │   ├── Home.css            # ホームページ専用スタイル
│   │   ├── global.css          # グローバルスタイル
│   │   ├── index.css
│   │   ├── reset.css           # CSSリセット
│   │   └── variables.css       # CSS変数定義
│   │
│   ├── assets/                 # 静的アセット
│   └── vite-env.d.ts           # Vite型定義
│
├── public/                     # 静的ファイル
│   └── images/                 # 背景画像
│       ├── background.png
│       ├── back1.png
│       ├── back2.png
│       ├── back3.png
│       └── back4.png
├── index.html                  # HTMLエントリーポイント
├── vite.config.ts              # Vite設定
├── tsconfig.json               # TypeScript設定（ルート）
├── tsconfig.app.json           # アプリケーション用TypeScript設定
├── tsconfig.node.json          # Node.js用TypeScript設定
├── eslint.config.js            # ESLint設定
└── package.json                # プロジェクト設定と依存関係
```

## ルーティング構成

- `/` → Home（ホームページ - バブルアニメーション）
- `/create` → CreatePage（手動金魚作成ページ）
- `/ai-create` → AICreatePage（AI金魚生成ページ）
- `/panel` → PanelPage（水槽管理ページ）

## 主要機能詳細

### 1. ホームページ (`/`)
- **動的バブルエフェクト**: Intersection Observerを使用したパフォーマンス最適化
- **日本風ビジュアル**: 5枚の背景画像を使用したレイヤーデザイン

### 2. 手動作成ページ (`/create`)
- **5段階デザインシステム**: base → parts → pattern → accessory → customize
- **リアルタイムCanvas描画**: 即座のビジュアルフィードバック
- **精密なカスタマイズ**: 体型・パーツ・色・模様・アクセサリー・位置調整
- **エクスポート機能**: PNG画像として保存

### 3. AI作成ページ (`/ai-create`)
- **5ステップウィザード**: Model → Basic → Details → Accessory → Generate
- **デュアルAI統合**: ChatGPTとGemini APIの選択式使用
- **プロンプトエンジニアリング**: 構造化されたAI指示生成
- **JSONバリデーション**: AI応答の形式検証
- **水槽連携**: 生成後の直接水槽保存

### 4. 水槽管理ページ (`/panel`)
- **アニメーション水槽**: 作成済み金魚の泌遊アニメーション
- **金魚管理**: サイドバーでの一覧表示・削除機能
- **自動更新**: ページ可視性変化時のデータ再読み込み

## AI統合機能

### 対応モデル
- **ChatGPT**: OpenAI API統合
- **Gemini**: Google Generative AI統合

### AI機能特徴
- **プロンプトビルダー**: 構造化された指示生成
- **JSONレスポンス**: 一貫したデータ形式
- **エラーハンドリング**: API限制・ネットワークエラー対応
- **バリデーション**: AI応答の形式・内容検証

## データ管理

### LocalStorage機能
- **金魚データ永続化**: 作成した金魚の保存・読み込み
- **テーマ設定**: ダークモード状態の保存
- **CRUD操作**: 作成・読み込み・更新・削除

## 環境変数設定

プロジェクトルートに `.env` ファイルを作成し、以下のAPIキーを設定してください:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_CHATGPT_API_KEY=your_chatgpt_api_key_here
```

## コーディング規約

### TypeScript
- 厳密な型定義を使用する
- `any`型の使用は避ける
- 型インポートには`import type`を使用する
- インターフェースや型エイリアスを適切に定義する

### React
- **React.FC は使用禁止** - 通常の関数定義を使用
- 関数コンポーネントとHooksを使用する
- `useState`、`useEffect`などのReact Hooksを適切に使用
- コンポーネントは単一責任の原則に従う
- exportはdefault exportを使用

```typescript
// ❌ 使用禁止
const Component: React.FC = () => { ... }

// ✅ 推奨
export default function Component() { ... }
```

### ファイル命名・構造
- コンポーネントファイル: PascalCase（例: `HomePage.tsx`）
- サブコンポーネント: `_components`フォルダ内に配置
- CSSファイル: コンポーネントと同名（例: `HomePage.css`）

### ESLint
- プロジェクトのESLint設定に従う
- React Hooks のルールを遵守
- TypeScript ESLintの推奨ルールに準拠

## 開発フロー

1. **コードの変更**
   - `src/` ディレクトリ内のファイルを編集

2. **型チェック**
   - TypeScriptコンパイラが自動的に型エラーを検出

3. **Lintチェック**
   ```bash
   npm run lint
   ```

4. **ビルド確認**
   ```bash
   npm run build
   ```

## 注意事項

- コミット前に必ず `npm run lint` を実行してエラーがないことを確認
- ビルド前に `npm run build` で型チェックとビルドが成功することを確認
- 新しい依存関係を追加する際は、型定義（`@types/*`）も忘れずにインストール
- React.FCは使用せず、通常の関数定義を使用する

---

## 開発時の注意事項

- **APIキー設定**: AI機能を使用するためには `.env` ファイルにAPIキーを設定してください
- **LocalStorage**: 金魚データはLocalStorageに保存されるため、ブラウザーのデータクリアで消失します
- **Canvas描画**: 金魚のCanvas描画はパフォーマンスを考慮した実装です
- **エラーハンドリング**: AI APIのレートリミットやネットワークエラーに対する適切なエラーメッセージが表示されます
</project_info>