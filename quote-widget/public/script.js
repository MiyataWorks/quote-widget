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
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error || response.statusText}`);
        }
        const data = await response.json();

        // 取得したデータでHTMLを書き換える
        quoteEl.textContent = data.quote || ' ';
        characterEl.textContent = data.character || ' ';
        titleEl.textContent = data.title ? `『${data.title}』` : ' ';

        // 画像URLが存在すれば、背景に設定
        if (data.imageUrl) {
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
setInterval(fetchAndDisplayQuote, 3600000);
