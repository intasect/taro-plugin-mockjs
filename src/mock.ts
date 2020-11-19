import * as Mockjs from 'mockjs';
import * as bodyParser from 'body-parser';

import { Request, Response } from 'express';

import { loadMocks } from './utils';

export function mockjsMiddleware(mockDir: string) {
  return (req: Request, res: Response, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH');
    const allowedHeaders = req.headers['access-control-request-headers'];
    if (allowedHeaders) {
      res.set('Access-Control-Allow-Headers', allowedHeaders);
    }
    if (req.method === 'OPTIONS') {
      return res.send('');
    }
    const url = req.url.split('?')[0];

    if (url === '/meta') {
      const host = req.protocol + '://' + req.headers.host + req.baseUrl;
      return res.end(host);
    }
    const mocks = loadMocks(mockDir);
    for (const mock of mocks) {
      const { method, reg, keys } = mock;
      if (method.toUpperCase() === req.method.toUpperCase()) {
        const match = reg.exec(req.path);
        if (match) {
          const params = {};
          for (let i = 0; i < keys.length; i++) {
            const keyItem = keys[i] as any;
            const name = keyItem.name;
            const matchVal = decodeURIComponent(match[i + 1]);
            if (matchVal) {
              params[name] = matchVal;
            }
          }
          req.params = params;
          const { result } = mock;
          if (typeof result === 'object') {
            bodyParser.json()(req, res, () => {
              res.json(Mockjs.mock(result));
            });
          } else if (typeof result === 'string') {
            bodyParser.text()(req, res, () => {
              res.send(Mockjs.mock(result));
            });
          } else if (typeof result === 'function') {
            (result as Function)(req, res, next);
          } else {
            next();
          }
        }
      }
    }
    next();
  };
}
