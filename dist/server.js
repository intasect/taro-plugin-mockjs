"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_mockjs_1 = require("express-mockjs");
const path_1 = require("path");
const app = express_1.default();
// Using the default path /
app.use(express_mockjs_1.default(path_1.default.join(__dirname, 'mocks')));
// or custom path /api
app.use('/api', express_mockjs_1.default(path_1.default.join(__dirname, 'mocks')));
// Add your middleware here, etc.
app.listen(3000);
//# sourceMappingURL=server.js.map