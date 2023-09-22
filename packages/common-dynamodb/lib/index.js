"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoClient = void 0;
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var async_document_client_1 = require("./async-document-client");
var defaultOptions = {
    apiVersion: '2012-08-10',
    endpoint: 'http://localhost:8000/',
    prefix: 'local',
    region: 'us-east-1',
};
var DynamoClient = /** @class */ (function () {
    function DynamoClient(opts) {
        this.tables = {};
        this.dbSchema = {};
        var config = __assign(__assign({}, defaultOptions), opts);
        this.dynamodb = new aws_sdk_1.default.DynamoDB({
            apiVersion: config.apiVersion,
            endpoint: config.endpoint,
            region: config.region,
        });
        var docClient = new aws_sdk_1.default.DynamoDB.DocumentClient({
            service: this.dynamodb,
            convertEmptyValues: true,
        });
        this.config = config;
        this.client = new async_document_client_1.AsyncDocumentClient(docClient);
    }
    DynamoClient.prototype.table = function (name) {
        return "".concat(this.config.prefix, "-").concat(name);
    };
    DynamoClient.prototype.loadSchema = function (schema) {
        var _this = this;
        // reset schema
        this.tables = {};
        this.dbSchema = {};
        Object.keys(schema).forEach(function (key) {
            var tableName = _this.table(key);
            _this.tables[key] = tableName;
            _this.dbSchema[tableName] = schema[key];
        });
    };
    DynamoClient.prototype.getExactly = function (params, limit, lastIndex, results, keys) {
        if (limit === void 0) { limit = 50; }
        if (lastIndex === void 0) { lastIndex = null; }
        if (results === void 0) { results = null; }
        if (keys === void 0) { keys = ['pk', 'sk', 'pData']; }
        return __awaiter(this, void 0, void 0, function () {
            var current, Items, LastEvaluatedKey, TrimmedItems, last_1, NewIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // set up for pagination
                        params.Limit = limit;
                        if (lastIndex) {
                            params.ExclusiveStartKey = lastIndex;
                        }
                        return [4 /*yield*/, this.client.query(params)];
                    case 1:
                        current = _a.sent();
                        if (results && results.Items.length) {
                            // prepend any provided results to this query
                            current.Items = __spreadArray(__spreadArray([], results.Items, true), current.Items, true);
                        }
                        Items = current.Items, LastEvaluatedKey = current.LastEvaluatedKey;
                        if (!(!LastEvaluatedKey || Items.length === limit)) return [3 /*break*/, 2];
                        // nothing more to do
                        return [2 /*return*/, current];
                    case 2:
                        if (!(Items.length > limit)) return [3 /*break*/, 3];
                        TrimmedItems = Items.slice(0, limit);
                        last_1 = TrimmedItems[limit - 1];
                        NewIndex = keys.reduce(function (prev, curr) {
                            prev[curr] = last_1[curr];
                            return prev;
                        }, {});
                        return [2 /*return*/, __assign(__assign({}, current), { Items: TrimmedItems, LastEvaluatedKey: NewIndex })];
                    case 3: return [4 /*yield*/, this.getExactly(params, limit, LastEvaluatedKey, current)];
                    case 4: 
                    // chain the calls until we get enough records
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DynamoClient.prototype.tableExists = function (table) {
        var _this = this;
        var params = { TableName: this.table(table) };
        return new Promise(function (resolve, reject) {
            _this.dynamodb.describeTable(params, function (err, data) {
                if (err || Object.keys(data).length < 1) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    DynamoClient.prototype.createTable = function (tableName) {
        var _this = this;
        var table = this.tables && this.tables[tableName];
        var schema = this.dbSchema && this.dbSchema[table];
        var TTL = null;
        // set up TTL if provided
        if (schema && schema.TimeToLiveSpecification) {
            TTL = __assign({}, schema.TimeToLiveSpecification);
            delete schema.TimeToLiveSpecification;
        }
        return new Promise(function (resolve, reject) {
            if (!schema) {
                return reject(new Error("unknown table: ".concat(tableName)));
            }
            schema.TableName = _this.table(tableName);
            _this.tableExists(tableName).then(function (exists) {
                if (exists) {
                    // table already exists, so skip
                    return resolve(true);
                }
                else {
                    _this.dynamodb.createTable(schema, function (err, data) {
                        if (err)
                            return reject(err);
                        // table is created: now check TTL
                        if (TTL) {
                            var params = {
                                TableName: schema.TableName,
                                TimeToLiveSpecification: TTL,
                            };
                            _this.dynamodb.updateTimeToLive(params, function (err) {
                                if (err)
                                    return reject(err);
                                resolve(data);
                            });
                        }
                        else {
                            resolve(data);
                        }
                    });
                }
            });
        });
    };
    DynamoClient.prototype.deleteTable = function (tableName) {
        var _this = this;
        var table = this.tables && this.tables[tableName];
        var schema = this.dbSchema && this.dbSchema[table];
        return new Promise(function (resolve, reject) {
            if (!schema)
                return reject(new Error("unknown table: ".concat(tableName)));
            _this.dynamodb.deleteTable({ TableName: tableName }, function (err, data) {
                if (err)
                    return reject(err);
                resolve(data);
            });
        });
    };
    return DynamoClient;
}());
exports.DynamoClient = DynamoClient;
