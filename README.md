# Geocode IP addresses for Meteor (v1.4+)

## Install

```
npm install bas-meteor-ip-geo
```

## Use

(Server)

```js
import { IpGeo } from 'bas-meteor-ip-geo';

// you can do it synchronously 
var geoData = IpGeo.geocode('74.125.224.72');

// or asynchronously
IpGeo.geocode('74.125.224.72', false, function(error, result){
    if(!error){
        //...
    }
});
```

(Client)

```js
// Get Geocode - change sample ip for "null" for get de current client ip
Meteor.call("BasMTR:IpGeo:geocode", '74.125.224.72', false, function(err, data){
    if(err) {
        console.log(err, err.stack); // an error occurred
    } else {
        console.log(data);
    }
});
```

## Configure

Custom download url:

```js
IpGeo.defaultDatabaseUrl = 'https://sample.com/GeoLite2-City.mmdb.gz';
```

Or Meteor.settings

```json
{
    "IpGeo" : {
        "databaseUrl" : "https://sample.com/GeoLite2-City.mmdb.gz"
    }
}
```
