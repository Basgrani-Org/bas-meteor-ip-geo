import 'bas-meteor-utils';

// Import Init
import './init';

// Import libs
import './lib';

// Is Server
if (Meteor.isServer) {
    require('./server');
    exports.IpGeo = BasMTR.IpGeo;
}

// Is Client
if (Meteor.isClient) {
    require('./client');
}
