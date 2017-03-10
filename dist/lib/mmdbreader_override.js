'use strict';

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fileLocation = '/tmp/GeoLite2-City.mmdb';

/* jshint -W100 */
var urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?‌​(?:[\w]*))?)/;
/* jshint +W100 */

var mmdbreader = require('maxmind-db-reader');
var __open = mmdbreader.open;

var isUrl = function isUrl(path) {
    return urlRegExp.exec(path);
};

var unzip = function unzip(response, filePath, callback) {
    try {
        var gunzip = _zlib2.default.createGunzip();
        var file = _fs2.default.createWriteStream(filePath);
        response.pipe(gunzip);

        gunzip.on('data', function (data) {
            file.write(data);
        }).on("end", function () {
            file.end();
            if (callback) {
                callback.call(this, null, filePath);
            }
        }).on("error", function (e) {
            if (callback) {
                callback.call(this, e);
            }
        });
    } catch (e) {
        if (callback) {
            callback.call(this, e);
        }
    }
};

var newOpen = function newOpen(database, callback) {
    if (!isUrl(database)) {
        __open.call(this, fileLocation, callback);
    } else {
        var downloader = require(/^https/ig.exec(database) ? 'https' : 'http');
        downloader.get(database, function (res) {
            unzip(res, fileLocation, function (error, result) {
                if (!error) {
                    __open.call(this, result, callback);
                } else {
                    callback.call(this, error);
                }
            });
        });
    }
};

mmdbreader.open = newOpen;

exports.mmdbreader = mmdbreader;
