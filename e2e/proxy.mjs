import http from 'node:http';
import net from 'node:net';

export function startProxy({ port, user, pass }) {
  const log = [];
  const expected = user ? 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64') : null;
  const authed = (req) => !expected || req.headers['proxy-authorization'] === expected;

  const server = http.createServer((req, res) => {
    if (!authed(req)) {
      log.push({ type: '407', url: req.url, sent: req.headers['proxy-authorization'] ?? null });
      res.writeHead(407, { 'Proxy-Authenticate': 'Basic realm="fp-test"' });
      return res.end();
    }
    log.push({ type: 'http', url: req.url });
    const u = new URL(req.url);
    const headers = { ...req.headers };
    delete headers['proxy-authorization'];
    delete headers['proxy-connection'];
    const up = http.request(
      {
        host: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        method: req.method,
        headers,
      },
      (r) => {
        res.writeHead(r.statusCode, r.headers);
        r.pipe(res);
      }
    );
    up.on('error', () => {
      res.writeHead(502);
      res.end();
    });
    req.pipe(up);
  });

  server.on('connect', (req, sock, head) => {
    if (!authed(req)) {
      log.push({
        type: '407-connect',
        url: req.url,
        sent: req.headers['proxy-authorization'] ?? null,
      });
      sock.end(
        'HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="fp-test"\r\nContent-Length: 0\r\n\r\n'
      );
      return;
    }
    log.push({ type: 'connect', url: req.url });
    const [h, p] = req.url.split(':');
    const up = net.connect(Number(p) || 443, h, () => {
      sock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head?.length) up.write(head);
      up.pipe(sock);
      sock.pipe(up);
    });
    up.on('error', () => sock.destroy());
    sock.on('error', () => up.destroy());
  });

  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, log })));
}
