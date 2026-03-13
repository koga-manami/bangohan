# ばんごはん

日々の献立やストック食材をシンプルに管理するための iPhone 専用アプリ。

## 技術スタック

- Python 3.x
- Django 5.2 (LTS)
- SQLite (Django 標準)
- Tailwind CSS (フロントエンド - 今後導入予定)
- holidays ライブラリ (日本の祝日判定)

## ローカル環境構築手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/koga-manami/bangohan.git
cd bangohan
```

### 2. Python 仮想環境の作成・有効化

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 4. マイグレーションの実行

```bash
python manage.py migrate
```

### 5. 管理ユーザーの作成

```bash
python manage.py createsuperuser
```

### 6. 開発サーバーの起動

```bash
python manage.py runserver
```

ブラウザで http://127.0.0.1:8000/admin/ にアクセスし、作成した管理ユーザーでログインしてください。

## プロジェクト構成

```
bangohan/
├── config/          # Django プロジェクト設定
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── dinner/          # メインアプリケーション
│   ├── admin.py     # 管理画面設定
│   ├── models.py    # DB モデル (Dinner, Ingredients)
│   ├── utils.py     # ユーティリティ (祝日判定など)
│   └── migrations/
├── docs/            # 仕様書・設計ドキュメント
├── manage.py
├── requirements.txt
└── README.md
```

## ブランチ運用

- `main` : 本番
- `dev` : 開発
- `feature/*` : 作業ブランチ (dev から作成し、PR は dev 宛に出す)
