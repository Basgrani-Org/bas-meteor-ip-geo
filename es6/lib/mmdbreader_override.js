import zlib from 'zlib';
import fs from 'fs';

const fileLocation = '/tmp/GeoLite2-City.mmdb';

/* jshint -W100 */
const urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?‌​(?:[\w]*))?)/;
/* jshint +W100 */

const mmdbreader = require('maxmind-db-reader');

const __open = mmdbreader.open;

const isUrl = function (path) {
  return urlRegExp.exec(path);
};

const unzip = function (response, filePath, callback) {
  try {
    const gunzip = zlib.createGunzip();
    const file = fs.createWriteStream(filePath);
    response.pipe(gunzip);

    gunzip.on('data', function (data) {
      file.write(data);
    }).on('end', function () {
      file.end();
      if (callback) {
        callback.call(this, null, filePath);
      }
    }).on('error', function (e) {
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

const newOpen = function (database, callback) {
  if (!isUrl(database)) {
    __open.call(this, fileLocation, callback);
  } else {
    const downloader = require(/^https/ig.exec(database) ? 'https' : 'http');
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
