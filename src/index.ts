import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as kill from 'kill-port';
import * as path from 'path';

import { IPluginContext } from '@tarojs/service';
import { chalk } from '@tarojs/helper';
import { mockjsMiddleware } from './mock';

function toBoolean(value: any): boolean {
  const falsy = /^(?:f(?:alse)?|no?|0+)$/i;
  return !falsy.test(value) && !!value;
}

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
  let isFirstWatch = true;
  ctx.onBuildFinish(async ({ isWatch }) => {
    const isMock = toBoolean(process.env.TARO_MOCK);
    if (!isMock && isFirstWatch) {
      console.log(
        chalk.yellow(
          `Tips: 数据mock服务未启动，设置 TARO_MOCK 为 true 可以开启 mock。
Example:
$ TARO_MOCK=true taro build --type weapp --watch`
        )
      );
    }

    let needStart = (!isWatch || isFirstWatch) && isMock;
    if (needStart) {
      const { appPath } = ctx.paths;
      const port = pluginOpts.port || 9527;
      const host = pluginOpts.host || '0.0.0.0';
      const basePath = pluginOpts.basePath || '/';
      const mockDir = pluginOpts.mockDir || 'mock';
      await kill(port, 'tcp');
      const app = express();
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(mockjsMiddleware(path.join(appPath, mockDir)));
      app.listen(port, host, () => {
        console.log(
          chalk.green(
            `数据mock服务已启动，Server 地址 http://${host}:${port}${basePath}, mock文件夹为 ${path.join(
              appPath,
              mockDir
            )}`
          )
        );
      });
    }
    isFirstWatch = false;
  });
};
