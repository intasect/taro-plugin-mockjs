import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

import { createBabelRegister, getModuleDefaultExport } from '@tarojs/helper';

import { pathToRegexp } from 'path-to-regexp';

const HTTP_METHODS = [
  'GET',
  'POST',
  'HEAD',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'PATCH',
];

export function loadMocks(mockDir: string) {
  let mockConfigs = {};
  if (fs.existsSync(mockDir)) {
    const mockFiles = glob.sync('**/*.[tj]s', {
      cwd: mockDir,
    });
    if (mockFiles.length) {
      const absMockFiles = mockFiles.map((file) => path.join(mockDir, file));
      createBabelRegister({
        only: absMockFiles,
      });
      absMockFiles.forEach((absFile) => {
        let mockConfig = {};
        try {
          delete require.cache[absFile];
          mockConfig = getModuleDefaultExport(require(absFile));
        } catch (err) {
          throw err;
        }
        mockConfigs = Object.assign({}, mockConfigs, mockConfig);
      });
    }
  }
  return Object.keys(mockConfigs).map((key) => {
    const result = mockConfigs[key];
    let method = 'GET';
    let apiPath;
    const keySplit = key.split(/\s+/g);
    if (keySplit.length === 2) {
      method = keySplit[0];
      apiPath = keySplit[1];
      if (!HTTP_METHODS.includes(method)) {
        throw `配置的 HTTP 方法名 ${method} 不正确，应该是 ${HTTP_METHODS.toString()} 中的一员！`;
      }
    } else if (keySplit.length === 1) {
      apiPath = keySplit[0];
    }
    const keys = [];
    const reg = pathToRegexp(apiPath, keys);
    return {
      apiPath,
      reg,
      keys,
      method,
      result,
    };
  });
}
