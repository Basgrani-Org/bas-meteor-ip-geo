require('bas-meteor-utils');

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
