// main.js

// this function wraps the marker code generation in case
// we want to make checks in the data quality provided
// to the constructor
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

// these are the ironhack bcn coordinates to start 
// the map centered in a position
const myCurrentCoords = {
  lat: 41.3977381,
  lng: 2.190471916
};

// map construction invocation
// please note we have to pass the DOM element where
// you want to inject the map (document.getElementById('map'))
const theMap = new google.maps.Map(
  document.getElementById('map'),
  {
    zoom: 12,
    center: myCurrentCoords
  }
);

document.querySelector("#newPatineteButton").onclick = function (e){
  e.preventDefault()

  // here we create the payload that will be sent to the server
  // so the server can create a new patinete based on the form's data
  var payload = {
    lat: +document.querySelector("#newPatinete input[name=lat]").value,
    lng: +document.querySelector("#newPatinete input[name=lng]").value,
    state: +document.querySelector("#newPatinete input[name=state]").value,
    rented: false
  }


  // using axios, we communicate with our server, sending the payload
  // we created before. this is an ajax communication happening in the background
  axios
    .post("/newPatinete", payload)
    // here the server is responding with the new patinete info now stored in the db
    .then(newPatineteGeneratedServerResponse => {
      var newPatinete = newPatineteGeneratedServerResponse.data.newPatineteRecorded
      setMarker(newPatinete.location.coordinates[0], newPatinete.location.coordinates[1], theMap, "marcador añadido")
      //newPatineteGeneratedServerResponse.data.newPatineteRecorded._id
    })
    
}

axios
  // uncomment this if you want to see the patinetes close to you
  // .get("/patinetesNearme")
  // uncomment this if you want to see only a specified number of patinetes
  // .get("/patinetes/20")
  // this returns all the patinetes in the db
  .get("/patinetes")
  // here we have all the returned patinetes from the API (written in express)
  .then(allPatinetes => {
    // here we traverse the whole list of patinetes adding new markers to the map
    allPatinetes.data.forEach(patineteData => {
      // this code adds the markers to the map based on what the db has provided us
      var marker = new google.maps.Marker({
        position: {
          lat: patineteData.location.coordinates[1],
          lng: patineteData.location.coordinates[0]
        },
        _id: patineteData._id,
        // use this line for a custom icon
        icon: 'images/patinete-icon.png',
        map: theMap,
        title: `${patineteData.state} of quality`,
        draggable: true,
      })

      // this is an array to store all the changes for each marker
      // based on Arrieta's question
      var states = []

      // when I end my marker's dragging operation we want to update
      // this marker's position in the DB
      // this is a specific google maps API event type (not valid for the classic DOM)
      google.maps.event.addListener(marker, 'dragend', function (marker) {
        // here we create the new position JSON that we'll provide to the API
        // containing the new marker position so we can update the info
        // in the DB
        var newPosition = {
          _id: this._id,
          lat: marker.latLng.lat(),
          lng: marker.latLng.lng()
        }

        states.push(newPosition)

        console.log(states)

        // here we communicate to the DB the new marker's position
        // based on the drag and drop user's operation
        axios
          .put("/updatePatinete", newPosition)
          
      });

      // for training purposes only, when we click a marker
      // we delete it. here we communicate the marker id to the API
      // so it know which patinete has to be deleted
      google.maps.event.addListener(marker, 'click', function (marker) {
        console.log(marker.latLng.lat())
        console.log(marker.latLng.lng())

        // this is the API communication, note that the .delete method
        // here indicates our intention to remove a patinete
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


