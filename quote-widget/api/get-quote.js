const { Client } = require('@notionhq/client');

// Vercelの環境変数からAPIキーとデータベースIDを読み込む
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

// APIリクエストに応じて実行されるメインの関数
module.exports = async (req, res) => {
    // どのドメインからでもアクセスできるようにCORSヘッダーを設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'no-store');

    // デバッグ用: /api/get-quote?debug=1 で環境変数の有無だけ確認できる
    const debugRequested = req?.query && (req.query.debug === '1' || req.query.debug === 'true');
    if (debugRequested) {
        return res.status(200).json({
            ok: true,
            env: {
                NOTION_API_KEY: Boolean(process.env.NOTION_API_KEY),
                NOTION_DATABASE_ID: Boolean(databaseId),
            },
        });
    }

    if (!databaseId || !process.env.NOTION_API_KEY) {
        return res.status(500).json({ error: 'Environment variables NOTION_API_KEY and NOTION_DATABASE_ID must be set.' });
    }

    try {
        // 全件取得のためのページネーション処理
        const allResults = [];
        let hasMore = true;
        let startCursor = undefined;

        while (hasMore) {
            const response = await notion.databases.query({
                database_id: databaseId,
                start_cursor: startCursor,
                page_size: 100, // 一度に取得する最大件数
            });

            allResults.push(...response.results);
            hasMore = response.has_more;
            startCursor = response.next_cursor;
        }

        if (allResults.length === 0) {
            return res.status(404).json({ error: 'No quotes found in the database.' });
        }

        // 取得した "全て" のデータの中からランダムに1つ選ぶ
        const randomEntry = allResults[Math.floor(Math.random() * allResults.length)];

        // 画像プロパティからURLを抽出
        const imageProperty = randomEntry.properties['画像'];
        const imageUrl = imageProperty?.files?.[0]?.file?.url || imageProperty?.files?.[0]?.external?.url || null;

        // 返却するデータを整形
        const quoteData = {
            quote: randomEntry.properties['名言']?.title[0]?.plain_text || '',
            character: randomEntry.properties['キャラクター']?.rich_text[0]?.plain_text || '',
            title: randomEntry.properties['作品名']?.rich_text[0]?.plain_text || '',
            imageUrl: imageUrl,
        };

        res.status(200).json(quoteData);

    } catch (error) {
        const detail = error?.body || { message: error?.message || String(error) };
        console.error('Error fetching from Notion API:', detail);
        res.status(500).json({
            error: 'Failed to fetch data from Notion API.',
            code: detail.code,
            message: detail.message,
        });
    }
};
