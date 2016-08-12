// Set start point
var _start_point = BasMTR;

// JWPlayer
(function (mtr) {
    _start_point.IpGeo = {};
    var _this = function(){return _start_point.IpGeo;}();

    _this.defaultDatabaseUrl = 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz';

    _this.databaseStates = {
        NotLoaded: 'not-loaded',
        Loading: 'loading',
        Loaded: 'loaded',
        LoadFailed: 'failed'
    };

    _this.databaseState = _this.databaseStates.NotLoaded;
    _this.database = null;

    /**
     * Load IP database (asynchronously)
     * @param  {String} databaseUrl location of the IP database
     */
    _this.load = function(databaseUrl) {
        var geocoderSettings = mtr.settings && mtr.settings.IpGeo;
        var url = databaseUrl || (geocoderSettings && geocoderSettings.databaseUrl) || _this.defaultDatabaseUrl;
        var self = this;

        if(_this.databaseState !== _this.databaseStates.NotLoaded){ return; }

        _this.databaseState = _this.databaseStates.Loading;

        mmdbreader.open(url, function(err,data){
            if(!err){
                _this.databaseState = _this.databaseStates.Loaded;
                _this.database = data;
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
    _this.geocode = function(ip, verbose, callback){

        if(_this.databaseState === _this.databaseStates.Loaded){
            return callback ? _this.database.getGeoData(ip, function(err, result){
                callback.call(_this, err, _this.formatResponse(result));
            }) : _this.formatResponse(_this.database.getGeoDataSync(ip), verbose);
        } else {
            var e;

            switch(_this.databaseState){
                case _this.databaseStates.NotLoaded:
                case _this.databaseStates.Loading:
                    e = new Error('Database is not ready yet');
                    _this.load();
                    if(callback){
                        callback.call(_this, e);
                    } else {
                        throw e;
                    }
                    break;
                case _this.databaseStates.LoadFailed:
                    e = new Error('Failed to load database');
                    if(callback){
                        callback.call(_this, e);
                    } else {
                        throw e;
                    }
                    break;
            }
        }
    };

    _this.formatResponse = function(r, verbose){
        return verbose ? r : (r ? {
            city : {
                name : r.city && r.city.names && r.city.names.en
            },
            continent : {
                name : r.continent && r.continent.names && r.continent.names.en,
                code : r.continent && r.continent.code
            },
            country : {
                name : r.country && r.country.names && r.country.names.en,
                code : r.country && r.country.iso_code
            },
            location : r.location
        } : r);
    };

    // Meteor Init
    _this.mtr_init = function() {
        // Load Geo IP data
        _this.load();
    };

    // Meteor startup
    mtr.startup(function () {
        // Init
        _this.mtr_init();
    });

}( Meteor ));

// Methods
Meteor.methods({
    'BasMTR:IpGeo:geocode': function (ip, verbose) {
        this.unblock();
        if (!ip){ ip = this.connection.clientAddress; }
        try {
            return Meteor.wrapAsync(BasMTR.IpGeo.geocode)(ip, verbose);
        }
        catch(err) {
            return err.message;
        }
    }
});
