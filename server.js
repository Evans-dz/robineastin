/* Static server for local work. No build step, no framework.
   node server.js  →  http://localhost:4214                  */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4214;
const ROOT = __dirname;
const TYPES = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.svg':'image/svg+xml', '.ico':'image/x-icon', '.webp':'image/webp',
  '.avif':'image/avif', '.woff2':'font/woff2', '.pdf':'application/pdf',
};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, url === '/' ? 'index.html' : url);

  if (!path.resolve(file).startsWith(ROOT)) { res.writeHead(403).end('No'); return; }

  fs.stat(file, (err, st) => {
    /* Only fall back to the page for route-shaped paths. A missing
       .jpg must 404, not quietly return HTML — otherwise a typo in a
       filename looks like a working image right up until it renders. */
    /* A folder serves its own index.html (privacy/, terms/), the way Vercel does. */
    if (!err && st.isDirectory() && fs.existsSync(path.join(file, 'index.html'))) {
      file = path.join(file, 'index.html');
    } else if (err || st.isDirectory()){
      if (path.extname(file)) { res.writeHead(404, {'Content-Type':'text/plain'}).end('Not found'); return; }
      /* Missing page: the site's own 404.html with a real 404 status, as on Vercel. */
      const nf = path.join(ROOT, '404.html');
      if (fs.existsSync(nf)) { res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'}).end(fs.readFileSync(nf)); return; }
      file = path.join(ROOT, 'index.html');
    }
    fs.readFile(file, (e, buf) => {
      if (e) { res.writeHead(404, {'Content-Type':'text/plain'}).end('Not found'); return; }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(buf);
    });
  });
}).listen(PORT, () => console.log(`Wilderness Escape Rentals → http://localhost:${PORT}`));
