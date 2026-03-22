# ばんごはん.com

iPhone 向け献立管理アプリ（Next.js + Neon + Vercel 構成）

## 技術構成

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイル**: TailwindCSS
- **DB**: Neon PostgreSQL
- **ORM**: Prisma
- **デプロイ**: Vercel
- **PWA**: Service Worker + manifest.json

## ローカル環境構築

### 前提条件

- Node.js 18 以上
- npm
- Neon アカウント（PostgreSQL）

### セットアップ手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/koga-manami/bangohan.git
cd bangohan

# 2. 依存パッケージのインストール
npm install

# 3. 環境変数の設定
cp .env.local.example .env.local
# .env.local を編集して DATABASE_URL を設定

# 4. Prisma マイグレーション実行
npx prisma migrate dev --name init

# 5. 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

## Neon 設定方法

1. [Neon Console](https://console.neon.tech/) にアクセス
2. 新しいプロジェクトを作成
3. ダッシュボードから接続文字列（Connection string）をコピー
4. `.env.local` の `DATABASE_URL` にペースト

```
DATABASE_URL="postgresql://username:password@ep-xxxx.region.aws.neon.tech/bangohan?sslmode=require"
```

## Vercel デプロイ手順

1. [Vercel](https://vercel.com) にログイン
2. 「New Project」→ GitHub リポジトリを選択
3. 環境変数に `DATABASE_URL` を設定（Neon の接続文字列）
4. デプロイ実行

### ビルドコマンド（自動設定）

```
prisma generate && next build
```

### Prisma マイグレーション（初回のみ）

Vercel デプロイ後、ローカルから以下を実行：

```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

## 機能

- 今日から1ヶ月先までの献立一覧表示
- 各日の「献立」「予定」をタップ編集 → 自動保存
- 上部に材料メモ欄（編集可能・sticky固定）
- 今日の行を自動ハイライト・スクロール
- 色分け（平日=黒、土曜=青、日曜・祝日=赤）
- PWA 対応（ホーム画面追加可能）
- iPhone Safari 最適化

## DB構造

### MealPlan（献立）

| カラム | 型 | 説明 |
|--------|------|------|
| id | Int | 主キー |
| date | Date | 日付（unique） |
| menu_text | String? | 献立テキスト |
| schedule_text | String? | 予定テキスト |
| created_at | DateTime | 作成日時 |
| updated_at | DateTime | 更新日時 |

### IngredientsMemo（材料メモ）

| カラム | 型 | 説明 |
|--------|------|------|
| id | Int | 主キー |
| memo_text | String? | メモテキスト |
| created_at | DateTime | 作成日時 |
| updated_at | DateTime | 更新日時 |

## ブランチ運用

- `main` : 本番
- `develop` : 開発
- `feature/*` : 作業ブランチ (develop から作成し、PR は develop 宛に出す)
