import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.join(projectRoot, 'dist');
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.avif', 'image/avif'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'],
  ['.otf', 'font/otf'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.pdf', 'application/pdf'],
  ['.mp4', 'video/mp4'],
  ['.webm', 'video/webm']
]);

function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function reply(request, response, status, message) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(message),
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(request.method === 'HEAD' ? undefined : message);
}

export function createStaticServer({ root = defaultRoot } = {}) {
  const absoluteRoot = path.resolve(root);
  return createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD');
      reply(request, response, 405, 'Método não permitido. Use GET ou HEAD.\n');
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent((request.url ?? '/').split(/[?#]/, 1)[0]);
    } catch {
      reply(request, response, 400, 'Endereço inválido.\n');
      return;
    }

    const segments = pathname.split('/');
    if (!pathname.startsWith('/') || pathname.includes('\\') || pathname.includes('\0') || pathname.includes(':') || segments.some(segment => segment === '..' || segment.startsWith('.'))) {
      reply(request, response, 403, 'Acesso não permitido.\n');
      return;
    }

    let filename = path.resolve(absoluteRoot, `.${pathname}`);
    if (!isInside(absoluteRoot, filename)) {
      reply(request, response, 403, 'Acesso não permitido.\n');
      return;
    }

    try {
      let info = await stat(filename);
      if (info.isDirectory()) {
        filename = path.join(filename, 'index.html');
        info = await stat(filename);
      }
      if (!info.isFile()) {
        reply(request, response, 404, 'Arquivo não encontrado. Volte para / ou explore /catalogo.html.\n');
        return;
      }

      const [resolvedRoot, resolvedFile] = await Promise.all([realpath(absoluteRoot), realpath(filename)]);
      if (!isInside(resolvedRoot, resolvedFile)) {
        reply(request, response, 403, 'Acesso não permitido.\n');
        return;
      }

      const etag = `W/"${info.size.toString(16)}-${Math.trunc(info.mtimeMs).toString(16)}"`;
      const headers = {
        'Content-Type': contentTypes.get(path.extname(filename).toLowerCase()) ?? 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'ETag': etag,
        'Last-Modified': info.mtime.toUTCString(),
        'X-Content-Type-Options': 'nosniff'
      };
      if (request.headers['if-none-match'] === etag) {
        response.writeHead(304, headers);
        response.end();
        return;
      }

      response.writeHead(200, { ...headers, 'Content-Length': info.size });
      if (request.method === 'HEAD') {
        response.end();
        return;
      }
      const stream = createReadStream(resolvedFile);
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
        reply(request, response, 404, 'Página ou arquivo não encontrado. Volte para / ou explore /catalogo.html.\n');
      } else if (error.code === 'EACCES' || error.code === 'EPERM') {
        reply(request, response, 403, 'Acesso não permitido.\n');
      } else {
        reply(request, response, 500, 'Não foi possível abrir este arquivo. Tente novamente.\n');
      }
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('PORT deve ser um número inteiro entre 1 e 65535.');
    process.exitCode = 1;
  } else {
    const server = createStaticServer();
    server.on('error', error => {
      console.error(`Não foi possível iniciar o servidor: ${error.message}`);
      process.exitCode = 1;
    });
    server.listen(port, '127.0.0.1', () => {
      console.log(`ICE GEN V2: http://127.0.0.1:${port}`);
      console.log('Prévia local da ICE GEN. Pressione Ctrl+C para encerrar.');
    });
  }
}
