"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncDocumentClient = void 0;
var AsyncDocumentClient = /** @class */ (function () {
    function AsyncDocumentClient(client) {
        this.client = client;
    }
    AsyncDocumentClient.prototype.get = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.get(params, function (err, data) {
                if (err)
                    return reject(err);
                resolve(data);
            });
        });
    };
    AsyncDocumentClient.prototype.delete = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.delete(params, function (err, data) {
                if (err)
                    return reject(err);
                resolve(data);
            });
        });
    };
    AsyncDocumentClient.prototype.put = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.put(params, function (err, data) {
                if (err)
                    return reject(err);
                resolve(data);
            });
        });
    };
    AsyncDocumentClient.prototype.update = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.update(params, function (err, data) {
                if (err)
                    return reject(err);
                resolve(data);
            });
        });
    };
    AsyncDocumentClient.prototype.query = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.query(params, function (err, data) {
                if (err)
                    return reject(err);
                resolve(data);
            });
        });
    };
    AsyncDocumentClient.prototype.batchGet = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client.batchGet(params, function (err, data) {
                if (err)
                    return reject(err);
                resolve(data);
            });
        });
    };
    return AsyncDocumentClient;
}());
exports.AsyncDocumentClient = AsyncDocumentClient;
