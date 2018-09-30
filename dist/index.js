'use strict';

require('bas-meteor-utils');

require('./init');

require('./lib');

// Is Server


// Import Init
if (Meteor.isServer) {
  require('./server');
  exports.IpGeo = BasMTR.IpGeo;
}

// Is Client


// Import libs
if (Meteor.isClient) {
  require('./client');
}
