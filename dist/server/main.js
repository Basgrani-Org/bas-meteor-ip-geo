'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mmdbreader_override = require('./../lib/mmdbreader_override');

var _mmdbreader_override2 = _interopRequireDefault(_mmdbreader_override);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mmdbreader = _mmdbreader_override2.default.mmdbreader;

var IpGeo_ = function (mtr) {
  // ------------------------------------------------------------------------
  // Constants
  // ------------------------------------------------------------------------

  var VERSION = BasMTR.Utils.VERSION;

  // ------------------------------------------------------------------------
  // Vars
  // ------------------------------------------------------------------------

  var _databaseStates = {
    NotLoaded: 'not-loaded',
    Loading: 'loading',
    Loaded: 'loaded',
    LoadFailed: 'failed'
  };

  var _defaultDatabaseUrl = 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz';
  var _databaseState = _databaseStates.NotLoaded;
  var _database = null;

  // ------------------------------------------------------------------------
  // Class Definition
  // ------------------------------------------------------------------------

  var IpGeo_ = function () {
    function IpGeo_() {
      _classCallCheck(this, IpGeo_);
    }

    _createClass(IpGeo_, null, [{
      key: 'load',


      // Public
      // ------------------------------------------------------------------------


      // Static
      // ------------------------------------------------------------------------

      /**
       * Load IP database (asynchronously)
       * @param  {String} databaseUrl location of the IP database
       */
      value: function load(databaseUrl) {
        var geocoderSettings = mtr.settings && mtr.settings.IpGeo;
        var url = databaseUrl || geocoderSettings && geocoderSettings.databaseUrl || _defaultDatabaseUrl;
        // const self = this;

        if (_databaseState !== _databaseStates.NotLoaded) {
          return;
        }

        _databaseState = _databaseStates.Loading;

        mmdbreader.open(url, function (err, data) {
          if (!err) {
            _databaseState = _databaseStates.Loaded;
            _database = data;
          } else {
            _databaseState = _databaseStates.LoadFailed;
          }
        });
      }

      /**
       * Geocode an IP
       * @param  {String}   ip       IP address to geocode
       * @param  {Boolean}  verbose  If set to true, return a full version of the result, else simplify the structure
       * @param  {Function} callback Optional callback. If nothing is specified,
       *                             the function is run synchronously
       * @return {Object}            Returns geocoding result if no callback is provided
       */

    }, {
      key: 'geocode',
      value: function geocode(ip, verbose, callback) {
        if (_databaseState === _databaseStates.Loaded) {
          return callback ? _database.getGeoData(ip, function (err, result) {
            callback.call(IpGeo_, err, IpGeo_._formatResponse(result));
          }) : IpGeo_._formatResponse(_database.getGeoDataSync(ip), verbose);
        }
        var e = void 0;

        switch (_databaseState) {
          case _databaseStates.NotLoaded:
          case _databaseStates.Loading:
            e = new Error('Database is not ready yet [ip-geo]');
            IpGeo_.load();
            if (callback) {
              callback.call(IpGeo_, e);
            } else {
              throw e;
            }
            break;
          case _databaseStates.LoadFailed:
            e = new Error('Failed to load database [ip-geo]');
            if (callback) {
              callback.call(IpGeo_, e);
            } else {
              throw e;
            }
            break;
        }
      }

      // Static Private
      // ------------------------------------------------------------------------

    }, {
      key: '_formatResponse',
      value: function _formatResponse(r, verbose) {
        return verbose ? r : r ? {
          city: {
            name: r.city && r.city.names && r.city.names.en
          },
          continent: {
            name: r.continent && r.continent.names && r.continent.names.en,
            code: r.continent && r.continent.code
          },
          country: {
            name: r.country && r.country.names && r.country.names.en,
            code: r.country && r.country.iso_code
          },
          location: r.location
        } : r;
      }
    }, {
      key: 'VERSION',

      /* constructor() {
       } */

      // Getters
      // ------------------------------------------------------------------------

      get: function get() {
        return VERSION;
      }
    }, {
      key: 'defaultDatabaseUrl',
      get: function get() {
        return _defaultDatabaseUrl;
      },
      set: function set(url) {
        _defaultDatabaseUrl = url;
      }
    }]);

    return IpGeo_;
  }();

  // ------------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------------

  // Methods


  mtr.methods({
    'BasMTR:IpGeo:geocode': function BasMTRIpGeoGeocode(ip, verbose) {
      this.unblock();
      if (!ip) {
        ip = this.connection.clientAddress;
      }
      try {
        return mtr.wrapAsync(IpGeo_.geocode)(ip, verbose);
      } catch (err) {
        return err.message;
      }
    }
  });

  // ------------------------------------------------------------------------
  // Meteor
  // ------------------------------------------------------------------------

  // Meteor startup
  mtr.startup(function () {
    // Load Geo IP data
    IpGeo_.load();
  });

  return IpGeo_;
}(Meteor);

BasMTR.IpGeo = IpGeo_;
exports.default = IpGeo_;
