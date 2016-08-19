/* jshint -W020 */
BasMTR = require('bas-meteor-utils').BasMTR;
/* jshint +W020 */
exports.BasMTR = BasMTR;

var _is_init = BasMTR.ip_geo_isInit;

if(!_is_init){ require('./lib'); }

// Is Server
if(Meteor.isServer){
    if(!_is_init){ require('./server'); }
    exports.IpGeo = BasMTR.IpGeo;
}

// Is Client
if(Meteor.isClient){
    if(!_is_init){ require('./client'); }
}

BasMTR.ip_geo_isInit = true;
