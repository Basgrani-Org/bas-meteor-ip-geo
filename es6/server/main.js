import mmdbreader_override from './../lib/mmdbreader_override';
let mmdbreader = mmdbreader_override.mmdbreader;

const IpGeo_ = ((mtr) => {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    const VERSION = BasMTR.Utils.VERSION;

    // ------------------------------------------------------------------------
    // Vars
    // ------------------------------------------------------------------------

    let _databaseStates = {
        NotLoaded : 'not-loaded',
        Loading   : 'loading',
        Loaded    : 'loaded',
        LoadFailed: 'failed',
    };

    let _defaultDatabaseUrl = 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz';
    let _databaseState      = _databaseStates.NotLoaded;
    let _database           = null;

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    class IpGeo_ {

        constructor() {

        }

        // Getters
        // ------------------------------------------------------------------------

        static get VERSION() {
            return VERSION;
        }

        static get defaultDatabaseUrl() {
            return _defaultDatabaseUrl;
        }

        static set defaultDatabaseUrl(url) {
            _defaultDatabaseUrl = url;
        }

        // Public
        // ------------------------------------------------------------------------


        // Static
        // ------------------------------------------------------------------------

        /**
         * Load IP database (asynchronously)
         * @param  {String} databaseUrl location of the IP database
         */
        static load(databaseUrl) {
            let geocoderSettings = mtr.settings && mtr.settings.IpGeo;
            let url              = databaseUrl || (geocoderSettings && geocoderSettings.databaseUrl) || _defaultDatabaseUrl;
            let self             = this;

            if (_databaseState !== _databaseStates.NotLoaded) {
                return;
            }

            _databaseState = _databaseStates.Loading;

            mmdbreader.open(url, function (err, data) {
                if (!err) {
                    _databaseState = _databaseStates.Loaded;
                    _database      = data;
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
        static geocode(ip, verbose, callback) {

            if (_databaseState === _databaseStates.Loaded) {
                return callback ? _database.getGeoData(ip, function (err, result) {
                        callback.call(IpGeo_, err, IpGeo_._formatResponse(result));
                    }) : IpGeo_._formatResponse(_database.getGeoDataSync(ip), verbose);
            } else {
                let e;

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
        }

        // Static Private
        // ------------------------------------------------------------------------

        static _formatResponse(r, verbose) {
            return verbose ? r : (r ? {
                        city     : {
                            name: r.city && r.city.names && r.city.names.en,
                        },
                        continent: {
                            name: r.continent && r.continent.names && r.continent.names.en,
                            code: r.continent && r.continent.code,
                        },
                        country  : {
                            name: r.country && r.country.names && r.country.names.en,
                            code: r.country && r.country.iso_code,
                        },
                        location : r.location,
                    } : r);
        }
    }

    // ------------------------------------------------------------------------
    // Init
    // ------------------------------------------------------------------------

    // Methods
    mtr.methods({
        'BasMTR:IpGeo:geocode': function (ip, verbose) {
            this.unblock();
            if (!ip) {
                ip = this.connection.clientAddress;
            }
            try {
                return mtr.wrapAsync(IpGeo_.geocode)(ip, verbose);
            }
            catch (err) {
                return err.message;
            }
        },
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

})(Meteor);

BasMTR.IpGeo = IpGeo_;
export default IpGeo_;
