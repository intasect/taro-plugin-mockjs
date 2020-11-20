"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const kill = require("kill-port");
const path = require("path");
const helper_1 = require("@tarojs/helper");
const mock_1 = require("./mock");
exports.default = (ctx, pluginOpts) => {
    ctx.addPluginOptsSchema((joi) => {
        return joi.object().keys({
            port: joi.number(),
            host: joi.string(),
            basePath: joi.string(),
            mockDir: joi.string(),
        });
    });
    let isFirstWatch = true;
    ctx.onBuildFinish(async ({ isWatch }) => {
        let needStart = !isWatch || isFirstWatch;
        if (needStart) {
            const { appPath } = ctx.paths;
            const port = pluginOpts.port || 9527;
            const host = pluginOpts.host || '0.0.0.0';
            const basePath = pluginOpts.basePath || '/';
            const mockDir = pluginOpts.mockDir || 'mock';
            await kill(port, 'tcp');
            const app = express();
            app.use(bodyParser.json());
            app.use(mock_1.mockjsMiddleware(path.join(appPath, mockDir)));
            app.listen(port, host, () => {
                console.log(helper_1.chalk.green(`数据 mock 服务已启动，Server 地址 http://${host}:${port}${basePath}, mock文件夹为 ${path.join(appPath, mockDir)}`));
            });
        }
        isFirstWatch = false;
    });
};
//# sourceMappingURL=index.js.map