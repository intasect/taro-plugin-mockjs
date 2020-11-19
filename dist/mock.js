"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockjsMiddleware = void 0;
const Mockjs = require("mockjs");
const bodyParser = require("body-parser");
const utils_1 = require("./utils");
function mockjsMiddleware(mockDir) {
    return (req, res, next) => {
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
        const mocks = utils_1.loadMocks(mockDir);
        for (const mock of mocks) {
            const { method, reg, keys } = mock;
            if (method.toUpperCase() === req.method.toUpperCase()) {
                const match = reg.exec(req.path);
                if (match) {
                    const params = {};
                    for (let i = 0; i < keys.length; i++) {
                        const keyItem = keys[i];
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
                    }
                    else if (typeof result === 'string') {
                        bodyParser.text()(req, res, () => {
                            res.send(Mockjs.mock(result));
                        });
                    }
                    else if (typeof result === 'function') {
                        result(req, res, next);
                    }
                    else {
                        next();
                    }
                }
            }
        }
        next();
    };
}
exports.mockjsMiddleware = mockjsMiddleware;
//# sourceMappingURL=mock.js.map