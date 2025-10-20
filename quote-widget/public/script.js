// HTML要素を取得
const widgetContainer = document.getElementById('widget-container');
const quoteEl = document.getElementById('quote');
const characterEl = document.getElementById('character');
const titleEl = document.getElementById('title');

// データを取得するAPIのエンドポイント
// 外部サイトへ埋め込む際に相対パスだと404になるため、絶対URLを許容
const API_ENDPOINT = (typeof window !== 'undefined' && window.__NOTION_QUOTE_API__)
  ? window.__NOTION_QUOTE_API__
  : '/api/get-quote';

// 名言を取得して表示を更新する非同期関数
async function fetchAndDisplayQuote() {
    try {
        const response = await fetch(API_ENDPOINT);
        // サーバが404等でも本文に有効なJSONが含まれるケースに備え、先に本文を読む
        let data = null;
        try {
            data = await response.json();
        } catch (_) {
            data = null;
        }

        // ステータスがエラーでも、期待するフィールドを含むJSONであれば続行する
        const hasRenderableData = !!(data && (data.quote || data.character || data.title));
        if (!response.ok && !hasRenderableData) {
            const message = (data && data.error) ? data.error : response.statusText;
            throw new Error(`API Error: ${message}`);
        }

        // 取得したデータでHTMLを書き換える
        quoteEl.textContent = (data && data.quote) || ' ';
        characterEl.textContent = (data && data.character) || ' ';
        titleEl.textContent = (data && data.title) ? `『${data.title}』` : ' ';

        // 画像URLが存在すれば、背景に設定
        if (data && data.imageUrl) {
            widgetContainer.style.backgroundImage = `url(${data.imageUrl})`;
        } else {
            // 画像がない場合は、背景画像をなくし、CSSで設定した背景色にする
            widgetContainer.style.backgroundImage = 'none';
        }

    } catch (error) {
        console.error('Failed to fetch quote:', error);
        quoteEl.textContent = '名言の読み込みに失敗しました。';
        characterEl.textContent = '設定を確認してください。';
        titleEl.textContent = '';
    }
}

// ページが読み込まれた時にまず1回実行
fetchAndDisplayQuote();

// 1時間（= 3,600,000ミリ秒）ごとに、fetchAndDisplayQuote関数を繰り返し実行
setInterval(fetchAndDisplayQuote, 600000);
