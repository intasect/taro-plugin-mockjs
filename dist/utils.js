"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMocks = void 0;
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const helper_1 = require("@tarojs/helper");
const path_to_regexp_1 = require("path-to-regexp");
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
function loadMocks(mockDir) {
    let mockConfigs = {};
    if (fs.existsSync(mockDir)) {
        const mockFiles = glob.sync('**/*.[tj]s', {
            cwd: mockDir,
        });
        if (mockFiles.length) {
            const absMockFiles = mockFiles.map((file) => path.join(mockDir, file));
            helper_1.createBabelRegister({
                only: absMockFiles,
            });
            absMockFiles.forEach((absFile) => {
                let mockConfig = {};
                try {
                    delete require.cache[absFile];
                    mockConfig = helper_1.getModuleDefaultExport(require(absFile));
                }
                catch (err) {
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
        }
        else if (keySplit.length === 1) {
            apiPath = keySplit[0];
        }
        const keys = [];
        const reg = path_to_regexp_1.pathToRegexp(apiPath, keys);
        return {
            apiPath,
            reg,
            keys,
            method,
            result,
        };
    });
}
exports.loadMocks = loadMocks;
//# sourceMappingURL=utils.js.map