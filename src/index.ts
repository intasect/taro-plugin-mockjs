import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as kill from 'kill-port';
import * as path from 'path';

import { IPluginContext } from '@tarojs/service';
import { chalk } from '@tarojs/helper';
import { mockjsMiddleware } from './mock';

export default (
  ctx: IPluginContext,
  pluginOpts: {
    port: number;
    host: string;
    basePath: string;
    mockDir: string;
  }
) => {
  ctx.addPluginOptsSchema((joi) => {
    return joi.object().keys({
      port: joi.number(),
      host: joi.string(),
      basePath: joi.string(),
      mockDir: joi.string(),
    });
  });

  ctx.onBuildFinish(async () => {
    const { appPath } = ctx.paths;
    const port = pluginOpts.port || 9527;
    const host = pluginOpts.host || '0.0.0.0';
    const basePath = pluginOpts.basePath || '/';
    const mockDir = pluginOpts.mockDir || 'mock';
    await kill(port, 'tcp');
    const app = express();
    app.use(bodyParser.json());
    app.use(mockjsMiddleware(path.join(appPath, mockDir)));
    app.listen(port, host, () => {
      console.log(
        chalk.green(
          `数据 mock 服务已启动，Server 地址 http://${host}:${port}${basePath}, mock文件夹为 ${path.join(
            appPath,
            mockDir
          )}`
        )
      );
    });
  });
};
