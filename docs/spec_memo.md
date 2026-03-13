# アプリケーション仕様書：ばんごはん (Django版)

## 1. 概要
日々の献立やストック食材をシンプルに管理するためのiPhone専用アプリ。
Django標準のSQLiteを活用し、別途DBサーバーを立てることなく軽量・高速に動作させる。

## 2. 技術スタック
安定版の最新を使用すること
- **言語:** Python 3.x
- **フレームワーク:** Django 5.x
- **データベース:** **SQLite** (プロジェクト内の `db.sqlite3` ファイルを使用)
- **フロントエンド:** Django Template + Tailwind CSS
- **ターゲットデバイス:** iPhone 15 (iOS 17以降)


## 3. 画面設計・UI構成

### 3.1 ヘッダーエリア (Sticky Header)
- **背景色:** チャコールグレー (#555555)
- **タイトル:** 「ばんごはん 🍚」 (白抜き文字 / おしゃれな手書き風フォント推奨)
- **配置:** 画面最上部に固定 (`position: sticky; top: 0;`)。

### 3.2 自由入力メモエリア (Quick Note)
- **用途:** 冷蔵庫の在庫状況（例：鮭1、とりもも2.）などをメモする。
- **UI:** ヘッダー直下に配置。角丸(12pt)のホワイトボックス。
- **実装:** `ingredients`テーブルに保存する。1レコードのみ存在し、自由入力メモエリアが更新されたら既存のそのレコードのingredientsカラムにデータを入れupdated_atを更新する。

### 3.3 献立リストエリア (Main List)
- **動作:** 垂直スクロール。
- **初期表示:** 起動時、**「当日(date.today)」がリストの最上部**に来るようにView側でソート・取得。
- **カレンダー色分け:**
祝日は日本のものを使用する
  | 条件 | テキスト色 | テンプレート実装 (Template Tag) |
  | :--- | :--- | :--- |
  | 平日 | ブラック (#000000) | `default` |
  | 土曜日 | ブルー (#0000FF) | `{% if day.date|date:"w" == "6" %}` |
  | 日曜日・祝日 | レッド (#FF0000) | `{% if day.date|date:"w" == "0" %}` |

## 4. データベース設計
添付のDB設計図に基づき、Djangoの `models.py` で定義する。

テーブル名：dinner
| カラム名 | 型 | 説明 | Djangoフィールド型 |
| :--- | :--- | :--- | :--- |
| **dinner_id** | serial | id (PK) | `models.AutoField` |
| **date** | DATE | 日付 | `models.DateField` |
| **event** | varchar(50) | その日の用事 | `models.CharField(max_length=50)` |
| **kondate** | varchar(256) | 献立 | `models.CharField(max_length=256)` |
| **created_at** | TIMESTAMP | 作成日時 | `models.DateTimeField(auto_now_add=True)` |
| **updated_at** | TIMESTAMP | 更新日時 | `models.DateTimeField(auto_now=True)` |

テーブル名：ingredients
| カラム名 | 型 | 説明 | Djangoフィールド型 |
| :--- | :--- | :--- | :--- |
| **ingredients** | varchar(256)  | 残りの食材 | `models.CharField(max_length=256)` |
| **updated_at** | TIMESTAMP | 更新日時 | `models.DateTimeField(auto_now=True)` |

## 5. 機能・非機能要件
- **入力アクション:** - 各行（セル）をタップすることで編集用フォームを表示。
  - Djangoの `ModelForm` を使用し、バリデーションを簡略化。
- **オフライン:** 簡易的な動作を維持するため、SQLiteのデータをサーバーサイドでレンダリングする標準的なSSR構成とする。
- **セーフエリア:** iPhone 15のDynamic Islandおよび下部ホームバーとの干渉を防ぐため、CSSの `env(safe-area-inset-top)` 等を適用。