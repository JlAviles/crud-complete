// main.js

function setMarker(lat, lng, theMap, title) {
  new google.maps.Marker({
    position: {
      lat: lat,
      lng: lng
    },
    map: theMap,
    title: title
  });
}

const myCurrentCoords = {
  lat: 41.3977381,
  lng: 2.190471916
};

const theMap = new google.maps.Map(
  document.getElementById('map'),
  {
    zoom: 12,
    center: myCurrentCoords
  }
);

document.querySelector("#newPatineteButton").onclick = function (e){
  e.preventDefault()

  var payload = {
    lat: +document.querySelector("#newPatinete input[name=lat]").value,
    lng: +document.querySelector("#newPatinete input[name=lng]").value,
    state: +document.querySelector("#newPatinete input[name=state]").value,
    rented: false
  }

  axios
    .post("/newPatinete", payload)
}

class Patinete {
  constructor(lng, lat, desc) {
    if (lng < -180 || lng > 180) throw new RangeError("longitude is not valid")
    if (lat < -90 || lat > 90) throw new RangeError("latitude is not valid")

    this.lng = lng
    this.lat = lat
    this.desc = desc
  }
}

axios
  .get("/patinetes")
  .then(allPatinetes => {
    allPatinetes.data.forEach(patineteData => {
      var marker = new google.maps.Marker({
        position: {
          lat: patineteData.location.coordinates[1],
          lng: patineteData.location.coordinates[0]
        },
        _id: patineteData._id,
        icon: 'images/patinete-icon.png',
        map: theMap,
        title: `${patineteData.state} of quality`,
        draggable: true,
      })

      var states = []

      google.maps.event.addListener(marker, 'dragend', function (marker) {
        var newPosition = {
          _id: this._id,
          lat: marker.latLng.lat(),
          lng: marker.latLng.lng()
        }

        states.push(newPosition)

        console.log(states)

        axios
          .put("/updatePatinete", newPosition)
      });

      google.maps.event.addListener(marker, 'click', function (marker) {
        console.log(marker.latLng.lat())
        console.log(marker.latLng.lng())
        axios
          .delete("/deletePatinete", {
            data: {
              _id: this._id
            }
          })
          .then(markerDeleted => this.setVisible(false))
      });
    })
  })


