# Geocode IP addresses for Meteor (v1.4.3+)

[![Donate to this project using Paypal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=9EARMSN5WMDDY)

## Install

```
meteor npm install bas-meteor-ip-geo
```

## Use

(Server)

```js
import { IpGeo } from 'bas-meteor-ip-geo';

// you can do it synchronously 
let geoData = IpGeo.geocode('74.125.224.72');

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

## Backers

### Maintainers

These amazing people are maintaining this project:

- [Basgrani](http://basgrani.com) - [view contributions](https://github.com/Basgrani-Org/bas-meteor-ip-geo/commits?author=Basgrani)

### Sponsors

No sponsors yet! Will you be the first?

[![Donate to this project using Paypal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=9EARMSN5WMDDY)

### Contributors

These amazing people have contributed code to this project:

- [Basgrani](http://basgrani.com) - [view contributions](https://github.com/Basgrani-Org/bas-meteor-ip-geo/commits?author=Basgrani)

### Contribute

If you wish you can contribute to the development of this project:

- Contribute with your code

- [Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=9EARMSN5WMDDY)

## License

- View the [LICENSE](https://github.com/Basgrani-Org/bas-meteor-ip-geo/blob/master/LICENSE.md)

## Contact

- dev@basgrani.com
