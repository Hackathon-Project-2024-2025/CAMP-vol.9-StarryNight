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

このプロジェクトは、React + TypeScript + Vite + React Routerを使用したSPA（Single Page Application）です。日本風のデザインテーマで、写真編集・パネル作成機能を持つWebアプリケーションを開発しています。

### 技術スタック

- **React**: 19.1.0（関数コンポーネント、Hooks使用）
- **TypeScript**: 5.8.3（厳密な型チェック）
- **Vite**: 7.0.4（高速開発環境）
- **React Router DOM**: 7.7.1（SPA ルーティング）
- **ESLint**: 9.30.1（TypeScript対応）

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
│   ├── App.css                 # アプリ全体のスタイル
│   ├── main.tsx                # エントリーポイント
│   │
│   ├── pages/                  # ページコンポーネント
│   │   ├── HomePage/
│   │   │   ├── HomePage.tsx
│   │   │   ├── HomePage.css
│   │   │   └── _components/
│   │   │       ├── HeroSection.tsx
│   │   │       ├── HeroSection.css
│   │   │       ├── MainContent.tsx
│   │   │       └── MainContent.css
│   │   ├── CreatePage/
│   │   │   ├── CreatePage.tsx
│   │   │   └── CreatePage.css
│   │   └── PanelPage/
│   │       ├── PanelPage.tsx
│   │       └── PanelPage.css
│   │
│   ├── components/             # 共通コンポーネント
│   │   └── Layout/
│   │       ├── Layout.tsx      # 全体レイアウト（ダークモード機能付き）
│   │       ├── Layout.css
│   │       └── _components/
│   │           ├── Header.tsx  # ナビゲーション
│   │           └── Footer.tsx
│   │
│   ├── hooks/                  # カスタムフック
│   │   └── useTheme.ts         # テーマ管理（将来拡張用）
│   │
│   ├── services/               # サービス層
│   │   └── storage/
│   │       └── localStorage.ts # ローカルストレージ操作
│   │
│   ├── types/                  # 型定義
│   │   └── common.types.ts     # 共通型定義
│   │
│   ├── styles/                 # スタイル関連
│   │   ├── variables.css       # CSS変数定義
│   │   └── global.css          # グローバルスタイル
│   │
│   └── vite-env.d.ts           # Vite型定義
│
├── public/                     # 静的ファイル
├── index.html                  # HTMLエントリーポイント
├── vite.config.ts              # Vite設定
├── tsconfig.json               # TypeScript設定（ルート）
├── tsconfig.app.json           # アプリケーション用TypeScript設定
├── tsconfig.node.json          # Node.js用TypeScript設定
├── eslint.config.js            # ESLint設定
└── package.json                # プロジェクト設定と依存関係
```

## ルーティング構成

- `/` → HomePage（トップページ）
- `/create` → CreatePage（作成ページ）
- `/panel` → PanelPage（パネルページ）

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

# React初心者向け開発ガイド

## Reactの基本概念

### 1. コンポーネント（Component）
Reactアプリは「コンポーネント」という小さな部品を組み合わせて作られています。

```typescript
// コンポーネントの例
export default function HelloWorld() {
  return <h1>Hello, World!</h1>;
}
```

### 2. Props（プロパティ）
コンポーネント間でデータを渡すための仕組みです。

```typescript
interface GreetingProps {
  name: string;
}

export default function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}

// 使用例: <Greeting name="太郎" />
```

### 3. State（状態）
コンポーネント内で変化するデータを管理します。

```typescript
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}
```

## このプロジェクトのファイル構造理解

### データの流れ
```
main.tsx (エントリーポイント)
    ↓
App.tsx (ルーティング設定)
    ↓
Layout.tsx (共通レイアウト)
    ↓
各ページ (HomePage, CreatePage, PanelPage)
    ↓
各ページの_componentsフォルダ内のサブコンポーネント
```

### 重要なファイルの役割

#### `src/main.tsx`
- アプリケーションの起動点
- ReactをHTMLのroot要素にマウント

#### `src/App.tsx`
- ルーティング設定
- React Routerでページ遷移を管理

#### `src/components/Layout/Layout.tsx`
- 全ページ共通のレイアウト
- Header, Footer, ダークモード機能を提供

#### `src/pages/*/` フォルダ
- 各ページのメインコンポーネント
- `_components`フォルダに関連するサブコンポーネント

#### `src/styles/`
- `variables.css`: CSS変数定義（色、サイズなど）
- `global.css`: 全体に適用されるスタイル

## 実践的な作業手順

### 新しいページを追加する

1. **ページフォルダの作成**
```bash
mkdir src/pages/NewPage
```

2. **メインコンポーネントの作成**
```typescript
// src/pages/NewPage/NewPage.tsx
import Layout from '../../components/Layout/Layout';
import './NewPage.css';

export default function NewPage() {
  return (
    <Layout>
      <div className="new-page">
        <h1>新しいページ</h1>
      </div>
    </Layout>
  );
}
```

3. **CSSファイルの作成**
```css
/* src/pages/NewPage/NewPage.css */
.new-page {
  padding: var(--spacing-xl);
}
```

4. **ルーティングに追加**
```typescript
// src/App.tsx
import NewPage from './pages/NewPage/NewPage';

// Routes内に追加
<Route path="/new" element={<NewPage />} />
```

5. **ナビゲーションに追加**
```typescript
// src/components/Layout/_components/Header.tsx
<li className="nav-item">
  <Link to="/new" className="nav-link">新ページ</Link>
</li>
```

### 新しいコンポーネントを作成する

1. **サブコンポーネントフォルダの作成**
```bash
mkdir src/pages/HomePage/_components
```

2. **コンポーネントファイルの作成**
```typescript
// src/pages/HomePage/_components/NewComponent.tsx
interface NewComponentProps {
  title: string;
  onClick?: () => void;
}

export default function NewComponent({ title, onClick }: NewComponentProps) {
  return (
    <div className="new-component" onClick={onClick}>
      <h2>{title}</h2>
    </div>
  );
}
```

3. **親コンポーネントで使用**
```typescript
// src/pages/HomePage/HomePage.tsx
import NewComponent from './_components/NewComponent';

export default function HomePage() {
  const handleClick = () => {
    console.log('クリックされました！');
  };

  return (
    <Layout>
      <NewComponent title="テスト" onClick={handleClick} />
    </Layout>
  );
}
```

### スタイリングの方法

1. **CSS変数を活用**
```css
/* CSS変数を使用 */
.my-component {
  color: var(--text-color);
  padding: var(--spacing-md);
  background-color: var(--background-color);
}
```

2. **レスポンシブ対応**
```css
.my-component {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .my-component {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## よくある問題と解決法

### Import/Exportエラー
```typescript
// ❌ 間違い
import Component from './Component'

// ✅ 正しい（拡張子を含める）
import Component from './Component.tsx'

// ❌ 間違い
export const Component = () => { ... }

// ✅ 正しい（default export使用）
export default function Component() { ... }
```

### 型エラー
```typescript
// ❌ 型が不明
function handleClick(event) { ... }

// ✅ 型を明示
function handleClick(event: React.MouseEvent<HTMLButtonElement>) { ... }

// または
import type { MouseEvent } from 'react';
function handleClick(event: MouseEvent<HTMLButtonElement>) { ... }
```

### CSS適用されない
```typescript
// ❌ CSS importを忘れている
export default function Component() { ... }

// ✅ CSSをimport
import './Component.css';
export default function Component() { ... }
```

## デバッグ方法

### 1. ブラウザの開発者ツール
- F12で開発者ツールを開く
- Consoleタブでエラーを確認
- Elementsタブでスタイルを確認

### 2. console.logでデバッグ
```typescript
export default function Component({ data }: Props) {
  console.log('データ:', data); // デバッグ用
  
  return <div>{data.title}</div>;
}
```

### 3. TypeScriptエラーの読み方
```
Property 'name' does not exist on type 'User'
→ User型に'name'プロパティが存在しません
```

## 推奨学習リソース

- [React公式ドキュメント](https://ja.react.dev/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/ja/docs/)
- [MDN Web Docs](https://developer.mozilla.org/ja/)

このガイドを参考に、段階的にReactの理解を深めていってください！
</project_info>