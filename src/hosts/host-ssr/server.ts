/// <reference types="node" />
import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import * as express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import bootstrap from './src/main.server';
const path = require('path');
const fs = require('fs');
const os = require('os');
const winston = require('winston');

// Use a safe directory
const logPath = "C:/Workspace/eleoncore/client/angular/host-ssr/log.txt";
console.log('📝 Logging to:', logPath);

// Make sure directory exists
fs.mkdirSync(path.dirname(logPath), { recursive: true });

winston.configure({
  level: 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logPath })
  ]
});

winston.debug('🔥 IT WORKS!');
winston.debug('ON ' + logPath)



// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(
    process.cwd(),
    'dist/eleoncore/client/angular/host-ssr/browser'
  );
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? join(distFolder, 'index.original.html')
    : join(distFolder, 'index.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', distFolder);
  server.set('trust proxy', true);


  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(distFolder, {
      maxAge: '1y',
    })
  );

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    const host = req.headers['x-forwarded-host'] ?? req.get('host');


    commonEngine
      .render({
        bootstrap: bootstrap as any,
        documentFilePath: indexHtml,
        url: `${protocol}://${host}${originalUrl}`,
        publicPath: distFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => {
        winston.error(err);
        return next(err);
      });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export default bootstrap;
