mmdbreader = require('./../lib/mmdbreader_override').mmdbreader;

// IpGeo
(function (mtr) {
    // Set start point
    if (!BasMTR.IpGeo) {
        BasMTR.IpGeo = {};
    }
    var _this = function () {
        return BasMTR.IpGeo;
    }();

    _this.databaseStates = {
        NotLoaded : 'not-loaded',
        Loading   : 'loading',
        Loaded    : 'loaded',
        LoadFailed: 'failed'
    };

    /**
     * Load IP database (asynchronously)
     * @param  {String} databaseUrl location of the IP database
     */
    _this.load = function (databaseUrl) {
        var geocoderSettings = mtr.settings && mtr.settings.IpGeo;
        var url              = databaseUrl || (geocoderSettings && geocoderSettings.databaseUrl) || _this.defaultDatabaseUrl;
        var self             = this;

        if (_this.databaseState !== _this.databaseStates.NotLoaded) {
            return;
        }

        _this.databaseState = _this.databaseStates.Loading;

        mmdbreader.open(url, function (err, data) {
            if (!err) {
                _this.databaseState = _this.databaseStates.Loaded;
                _this.database      = data;
            } else {
                _this.databaseState = _this.databaseStates.LoadFailed;
            }
        });
    };

    /**
     * Geocode an IP
     * @param  {String}   ip       IP address to geocode
     * @param  {Boolean}  verbose  If set to true, return a full version of the result, else simplify the structure
     * @param  {Function} callback Optional callback. If nothing is specified,
     *                             the function is run synchronously
     * @return {Object}            Returns geocoding result if no callback is provided
     */
    _this.geocode = function (ip, verbose, callback) {

        if (_this.databaseState === _this.databaseStates.Loaded) {
            return callback ? _this.database.getGeoData(ip, function (err, result) {
                callback.call(_this, err, _this.formatResponse(result));
            }) : _this.formatResponse(_this.database.getGeoDataSync(ip), verbose);
        } else {
            var e;

            switch (_this.databaseState) {
                case _this.databaseStates.NotLoaded:
                case _this.databaseStates.Loading:
                    e = new Error('Database is not ready yet [ip-geo]');
                    _this.load();
                    if (callback) {
                        callback.call(_this, e);
                    } else {
                        throw e;
                    }
                    break;
                case _this.databaseStates.LoadFailed:
                    e = new Error('Failed to load database [ip-geo]');
                    if (callback) {
                        callback.call(_this, e);
                    } else {
                        throw e;
                    }
                    break;
            }
        }
    };

    _this.formatResponse = function (r, verbose) {
        return verbose ? r : (r ? {
            city     : {
                name: r.city && r.city.names && r.city.names.en
            },
            continent: {
                name: r.continent && r.continent.names && r.continent.names.en,
                code: r.continent && r.continent.code
            },
            country  : {
                name: r.country && r.country.names && r.country.names.en,
                code: r.country && r.country.iso_code
            },
            location : r.location
        } : r);
    };

    // Init only one once
    _this.init = function () {
        _this.defaultDatabaseUrl = 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz';
        _this.databaseState      = _this.databaseStates.NotLoaded;
        _this.database           = null;

        // Methods
        mtr.methods({
            'BasMTR:IpGeo:geocode': function (ip, verbose) {
                this.unblock();
                if (!ip) {
                    ip = this.connection.clientAddress;
                }
                try {
                    return mtr.wrapAsync(_this.geocode)(ip, verbose);
                }
                catch (err) {
                    return err.message;
                }
            }
        });
    };

    // Meteor startup
    mtr.startup(function () {
        // Load Geo IP data
        _this.load();
    });

    // Init
    if (!_this.is_init) {
        _this.init();
        _this.is_init = true;
    }

}(Meteor));
