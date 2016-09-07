const getLocation = require('./get-location')
const geolib = require('geolib')
const Q = require('q')

var SupportedCities = function () {
  let self = this
  self.locations = [
    {
      'id': 'manchester',
      'name': 'Manchester',
      'longitude': -2.24455696347558,
      'latitude': 53.4792777155671
    },
    {
      'id': 'leeds',
      'name': 'Leeds',
      'longitude': -1.54511238485298,
      'latitude': 53.7954906003838
    }
  ]

  self.default = self.locations[1]

  self.getCurrent = () => {
    var saved = document.cookie.replace(/(?:(?:^|.*;\s*)desired-location\s*\=\s*([^;]*).*$)|^.*$/, '$1')
    if (saved.length > 0) return saved
    return self.default.id
  }

  self.setCurrent = (newCity) => {
    document.cookie = 'desired-location=' + newCity
  }

  self.nearest = () => {
    let deferred = Q.defer()

    if (navigator.geolocation) {
      getLocation.location().then((position) => {
        let currLatitude = position.coords.latitude
        let currLongitude = position.coords.longitude

        for (let i = 0; i < self.locations.length; i++) {
          let distanceInMetres = geolib.getDistance(
            { latitude: currLatitude, longitude: currLongitude },
            { latitude: self.locations[i].latitude, longitude: self.locations[i].longitude }
          )
          self.locations[i].distance = distanceInMetres
        }

        let sorted = self.locations
          .sort((a, b) => {
            if (a.distance < b.distance) return -1
            if (a.distance > b.distance) return 1
            return 0
          })

        deferred.resolve(sorted[0])
      })
    } else {
      deferred.resolve(self.locations[0])
    }

    return deferred.promise
  }
}

module.exports = SupportedCities
