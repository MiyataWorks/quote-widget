// oEmbed endpoint for Notion/Embedly discovery
// Spec: https://oembed.com/

module.exports = async (req, res) => {
  const query = req.query || {};
  const requestedUrl = (query.url && String(query.url)) || 'https://quote-widget-xi.vercel.app/';
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
    provider_url: 'https://quote-widget-xi.vercel.app/',
    title: 'Notion Quote Widget',
    html,
    width: maxwidth,
    height: maxheight
  };

  res.setHeader('Content-Type', 'application/json+oembed; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.status(200).end(JSON.stringify(payload));
};
