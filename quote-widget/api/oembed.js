// oEmbed endpoint for Notion/Embedly discovery
// Spec: https://oembed.com/

module.exports = async (req, res) => {
  const query = req.query || {};

  // Vercel 環境での実オリジン（プレビュー/カスタムドメイン対応）
  const forwardedProto = (req.headers['x-forwarded-proto'] || '').split(',')[0];
  const forwardedHost = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0];
  const protocol = forwardedProto || 'https';
  const host = forwardedHost || 'quote-widget-xi.vercel.app';
  const origin = `${protocol}://${host}`;

  // consumer が url を付与しない場合は自ページのルートを埋め込み対象にする
  const requestedUrl = (query.url && String(query.url)) || `${origin}/`;
  const maxwidth = Math.min(Number(query.maxwidth) || 600, 1200);
  const maxheight = Math.min(Number(query.maxheight) || 260, 1200);

  const html = [
    '<iframe',
    ` src="${requestedUrl}"`,
    ` width="${maxwidth}"`,
    ` height="${maxheight}"`,
    ' frameborder="0"',
    ' scrolling="no"',
    ' style="border:0; border-radius:12px; width:100%; height:100%"',
    ' allowfullscreen',
    '></iframe>'
  ].join('');

  const payload = {
    version: '1.0',
    type: 'rich',
    provider_name: 'Notion Quote Widget',
    provider_url: `${origin}/`,
    title: 'Notion Quote Widget',
    html,
    width: maxwidth,
    height: maxheight
  };

  res.setHeader('Content-Type', 'application/json+oembed; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.status(200).json(payload);
};
