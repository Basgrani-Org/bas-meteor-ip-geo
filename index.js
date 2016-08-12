/* jshint -W020 */
BasMTR = require('bas-meteor-utils').BasMTR;
/* jshint +W020 */
exports.BasMTR = BasMTR;

if(BasMTR.ip_geo_isInit){return;}

require('./lib');

// Is Server
if(Meteor.isServer){
    require('./server');
    exports.IpGeo = BasMTR.IpGeo;
}

// Is Client
if(Meteor.isClient){
    require('./client');
}

BasMTR.ip_geo_isInit = true;
