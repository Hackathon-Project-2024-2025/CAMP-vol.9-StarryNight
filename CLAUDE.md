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
- **AI金魚生成**: ChatGPT/Gemini APIを使用した画像生成システム
- **i2i (Image-to-Image) 変換**: AI設定からCanvas描画した金魚をベースにしたAI変換
- **Canvas描画システム**: リアルタイム金魚プレビューとエクスポート（手動作成・i2iベース画像）
- **AI画像表示システム**: Base64画像データの表示・管理システム
- **背景透過処理**: AI生成画像の自動背景除去・透過化システム
- **水槽管理**: 作成済み金魚の表示・管理・アニメーション
- **ダークモード**: テーマ切り替え機能
- **LocalStorage**: データ永続化（透過保持圧縮対応）

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
│   ├── App.tsx                             # ルーティング設定
│   ├── main.tsx                            # エントリーポイント
│   │
│   ├── pages/                              # ページコンポーネント
│   │   ├── Home/
│   │   │   └── Home.tsx                    # ホームページ（バブルアニメーション）
│   │   ├── CreatePage/                     # 手動金魚作成ページ
│   │   │   ├── CreatePage.tsx
│   │   │   ├── CreatePage.css
│   │   │   └── _components/                # 15個の専用コンポーネント
│   │   │       ├── FishPreview.tsx         # Canvas描画プレビュー
│   │   │       ├── DesignControls.tsx      # デザイン制御パネル
│   │   │       ├── ActionButtons.tsx       # 保存・リセットボタン
│   │   │       ├── StepNavigation.tsx      # ステップナビゲーション
│   │   │       ├── BaseSelector.tsx        # 体型選択
│   │   │       ├── PartsSelector.tsx       # パーツ選択
│   │   │       ├── ColorPicker.tsx         # 色選択
│   │   │       ├── PatternSelector.tsx     # 模様選択
│   │   │       ├── AccessorySelector.tsx   # アクセサリー選択
│   │   │       ├── CustomizationPanel.tsx  # カスタマイズパネル
│   │   │       ├── SliderControl.tsx       # スライダー制御
│   │   │       └── RandomGenerator.tsx     # ランダム生成
│   │   ├── AICreatePage/                   # AI金魚生成ページ
│   │   │   ├── AICreatePage.tsx
│   │   │   ├── AICreatePage.css
│   │   │   └── _components/                # 7個のAI専用コンポーネント
│   │   │       ├── AIStepNavigation.tsx    # AIステップナビ
│   │   │       ├── Step1ModelSelection.tsx # AIモデル選択（i2i対応）
│   │   │       ├── Step2BasicFeatures.tsx  # 基本特徴設定
│   │   │       ├── Step3DetailSettings.tsx # 詳細設定
│   │   │       ├── Step4Accessories.tsx    # アクセサリー設定
│   │   │       └── Step5Generate.tsx       # 生成実行（i2i統合）
│   │   └── PanelPage/                      # 水槽管理ページ
│   │       ├── PanelPage.tsx
│   │       ├── PanelPage.css
│   │       └── _components/
│   │           ├── Aquarium.tsx            # 水槽表示
│   │           ├── FishList.tsx            # 金魚一覧
│   │           ├── SwimmingFish.ts         # 金魚アニメーション
│   │           └── SwimmingAIFish.ts       # AI金魚アニメーション
│   │
│   ├── components/                         # 共通コンポーネント
│   │   ├── Layout/
│   │   │   ├── Layout.tsx                  # 全体レイアウト（ダークモード）
│   │   │   ├── Layout.css
│   │   │   └── _components/
│   │   │       ├── Header.tsx              # ナビゲーション
│   │   │       └── Footer.tsx
│   │   ├── AIImageDisplay/                 # AI画像表示システム
│   │   │   ├── AIImageDisplay.tsx
│   │   │   └── AIImageDisplay.css
│   │   └── BaseImagePreview/               # i2iベース画像プレビュー
│   │       ├── BaseImagePreview.tsx        # Canvas描画金魚プレビュー
│   │       └── BaseImagePreview.css
│   │
│   ├── hooks/                              # カスタムフック
│   │   ├── useTheme.ts                     # テーマ管理
│   │   └── useFishCanvas.ts                # Canvas描画ロジック共通化
│   │
│   ├── services/                           # サービス層
│   │   ├── ai/                             # AI統合サービス
│   │   │   ├── aiDebugUtils.ts             # AI デバッグ・ログユーティリティ
│   │   │   ├── aiSelectionsConverter.ts    # UI選択→生成パラメータ変換
│   │   │   ├── aiToCreateConverter.ts      # AI設定→FishDesign変換（i2i用）
│   │   │   ├── chatgptService.ts           # ChatGPT DALL-E 3 API統合
│   │   │   ├── geminiService.ts            # Gemini Imagen 4 API統合
│   │   │   ├── imagePrompts.ts             # 画像生成専用プロンプト（右向き対応）
│   │   │   ├── i2iService.ts               # 統合i2i (Image-to-Image) サービス
│   │   │   ├── openaiI2IService.ts         # OpenAI DALL-E 3 i2i API統合
│   │   │   └── geminiI2IService.ts         # Gemini Imagen 4 i2i API統合
│   │   ├── image/                          # 画像処理サービス
│   │   │   └── backgroundRemovalService.ts # 背景透過処理・分析サービス
│   │   └── storage/
│   │       ├── localStorage.ts             # データ永続化
│   │       └── imageCompression.ts         # 画像圧縮（透過保持対応）
│   │
│   ├── types/                              # 型定義
│   │   ├── common.types.ts                 # 共通型定義（金魚デザイン等）
│   │   ├── ai.types.ts                     # AI生成専用型定義（i2iモード追加）
│   │   ├── aiFish.types.ts                 # AI金魚専用型定義
│   │   └── i2i.types.ts                    # i2i (Image-to-Image) 専用型定義
│   │
│   ├── styles/                             # スタイル関連
│   │   ├── App.css
│   │   ├── Home.css                        # ホームページ専用スタイル
│   │   ├── global.css                      # グローバルスタイル
│   │   ├── index.css
│   │   ├── reset.css                       # CSSリセット
│   │   └── variables.css                   # CSS変数定義
│   │
│   ├── assets/                             # 静的アセット
│   └── vite-env.d.ts                       # Vite型定義
│
├── public/                                 # 静的ファイル
│   └── images/                             # 背景画像
│       ├── background.png
│       ├── back1.png
│       ├── back2.png
│       ├── back3.png
│       └── back4.png
├── index.html                              # HTMLエントリーポイント
├── vite.config.ts                          # Vite設定
├── tsconfig.json                           # TypeScript設定（ルート）
├── tsconfig.app.json                       # アプリケーション用TypeScript設定
├── tsconfig.node.json                      # Node.js用TypeScript設定
├── eslint.config.js                        # ESLint設定
└── package.json                            # プロジェクト設定と依存関係
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
- **デュアルAI統合**: DALL-E 3 (ChatGPT) とImagen 4 (Gemini) による画像生成
- **i2i (Image-to-Image) 機能**: AI設定からCanvas描画→AI変換の高品質生成
  - **右向き保証**: 水槽アニメーション対応の右向き金魚生成
  - **透過背景確保**: 完全透過背景での高品質出力
  - **ベース画像プレビュー**: リアルタイムCanvas描画プレビュー
- **画像生成専用プロンプト**: 最適化されたプロンプトエンジニアリング（右向き指示強化）
- **背景透過処理**: AI生成画像の自動背景除去・透過化
- **Base64画像処理**: 生成画像のBase64エンコード・デコード・表示（二重プレフィックス修正済み）
- **水槽連携**: 生成後の直接水槽保存（透過保持圧縮対応）

### 4. 水槽管理ページ (`/panel`)
- **ハイブリッド水槽**: 手動作成金魚（Canvas描画）とAI生成金魚（画像表示）の統合
- **デュアルアニメーション**: SwimmingFish（手動）とSwimmingAIFish（AI）システム
- **金魚管理**: サイドバーでの一覧表示・削除機能
- **自動更新**: ページ可視性変化時のデータ再読み込み

## AI統合機能

### 対応モデル
- **DALL-E 3**: OpenAI の最新画像生成モデル（ChatGPTサービス経由）
- **Imagen 4**: Google の最新画像生成モデル（Vertex AI経由）

### AI機能特徴
- **i2i (Image-to-Image) 生成**: Canvas描画ベース画像からのAI変換システム
- **専用画像プロンプト**: 画像生成に最適化された指示システム（右向き指示強化）
- **右向き保証システム**: `MANDATORY ORIENTATION`による水槽アニメーション対応
- **透過背景システム**: 自動背景除去・透過化処理
- **Base64画像レスポンス**: 直接的な画像データ取得（二重プレフィックス修正済み）
- **リトライ機構**: API制限・ネットワークエラー自動対応
- **デバッグシステム**: 包括的なログ・デバッグユーティリティ
- **透過保持圧縮**: PNG形式による透過背景保持圧縮

## データ管理

### LocalStorage機能
- **ハイブリッド金魚データ**: 手動作成金魚（FishDesign）とAI生成金魚（AIFishImage）の統合管理
- **透過保持圧縮システム**: AI生成画像の透過背景保持・容量最適化保存
- **i2i生成履歴**: Image-to-Image生成結果の履歴管理
- **背景透過分析**: 画像の透過度分析・品質評価
- **テーマ設定**: ダークモード状態の保存
- **CRUD操作**: 作成・読み込み・更新・削除

## 環境変数設定

プロジェクトルートに `.env` ファイルを作成し、以下のAPIキーを設定してください:

```env
# ChatGPT (DALL-E 3) 用
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Gemini (Imagen 4) 用
VITE_GOOGLE_ACCESS_TOKEN=your_google_access_token_here
VITE_GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
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

- **APIキー設定**: AI画像生成機能を使用するためには `.env` ファイルに適切なAPIキーを設定してください
  - **OpenAI**: `VITE_OPENAI_API_KEY` （DALL-E 3用）
  - **Google Cloud**: `VITE_GOOGLE_ACCESS_TOKEN` + `VITE_GOOGLE_CLOUD_PROJECT_ID` （Imagen 4用）
- **ハイブリッドデータ**: 手動作成金魚（Canvas）とAI生成金魚（Base64画像）の2つのデータ形式が混在します
- **i2i生成フロー**: Gemini選択時にi2iモードが利用可能、Canvas描画→AI変換の2段階処理
- **透過背景処理**: AI生成画像は自動的に背景透過処理されPNG形式で保存されます
- **右向き保証**: 全AI生成画像は水槽アニメーション対応の右向きで生成されます
- **LocalStorage容量**: AI生成画像は透過保持圧縮されますが、大量生成時は容量制限にご注意ください
- **画像生成レート**: DALL-E 3とImagen 4はそれぞれ異なるレート制限があります
- **Base64処理**: 二重プレフィックス問題は修正済み、安全にBase64画像を処理できます

---

## 最新更新情報（2025年1月）

### プロジェクト最適化完了
- **削除されたファイル**: 21個（未使用コンポーネント・サービス）
- **バンドルサイズ**: JavaScript 366.74 kB (110.43 kB gzip)
- **ビルド時間**: 1.77秒（最適化後）
- **コードベース健全性**: TypeScript・ESLint エラーなし

### i2i (Image-to-Image) 機能実装完了 ✨
- **新機能**: Canvas描画ベース画像からのAI変換システム
- **追加コンポーネント**: BaseImagePreview（i2iプレビュー）
- **追加サービス**: i2iService, openaiI2IService, geminiI2IService, backgroundRemovalService
- **追加フック**: useFishCanvas（Canvas描画ロジック共通化）
- **透過背景保証**: 自動背景除去・PNG透過保持圧縮
- **右向き保証**: 水槽アニメーション対応の`MANDATORY ORIENTATION`指示
- **Base64修正**: 二重プレフィックス問題解決

### 現在のアクティブ構成
- **AICreatePageコンポーネント**: 7個（i2i統合済み）
- **AIサービス**: 10個（i2i関連+背景透過追加）
- **画像生成システム**: DALL-E 3 + Imagen 4 + i2i変換統合
- **型定義**: i2i.types.ts追加（包括的なi2i型システム）
</project_info>