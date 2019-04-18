const express = require('express');
const router = express.Router();
const Patinete = require("../models/patinete")

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// used to run the page with the map and the whole app
router.get('/', (req, res, next) => {
  res.render('index');
});

// this updates the patinete position when we stop dragging it
router.put('/updatePatinete', (req, res, next) => {
  Patinete
    // here we use .findByIdAndUpdate providing the patinete id
    // and the new location
      .findByIdAndUpdate(
        //note we provide the id, so mongo knows which patinete we're talking about
      req.body._id,
        // this JSON indicates the new patinete's location 
      {
        "location.coordinates.0": req.body.lng,
        "location.coordinates.1": req.body.lat
      })
      // here we return the patinete's id to the requester indicating the operation
      // was succesful
    .then(updatedPatinete => res.status(200).json({ updated: true, id: req.body._id }))
});

// this is used to remove a patinete from the DB based on its db ID
router.delete('/deletePatinete', (req, res, next) => {
  console.log(req.body._id)
  Patinete
    .findByIdAndDelete(req.body._id)
    // after deleting the patinete, we return a confirmation message to the requester
    .then(deletedPatinete => res.status(200).json({ deleted: true, id: req.body._id }))
});

router.get("/test2", (req, res) => {
  res.json({name1: req.query.name1, name2: req.query.name2})
})

// this was a test to show you how to access multiple URL segments
router.get("/test/:param/:param2/:param3", (req, res) => {
  console.log(req.params.param)
  console.log(req.params.param2)
  console.log(req.params.param3)

  res.json({name1: req.params.param, name2: req.params.param2, name3: req.params.param3})
})

// this endpoint retrieves all the patinetes based on a limited number
// provided in the second segment of the URL (nPatinetes)
// the question mark in the nPatinetes indicated this param is optional
router.get('/patinetes/:nPatinetes?', (req, res, next) => {
  // using the mongoose model, we find all the patinetes with state
  // greater than one, limited to the number of requested patinetes
  // and then we return it
  Patinete
    .find({ state: { $gte: 1 } })
    .limit(+req.params.nPatinetes)
    .select({
      createdAt: false,
      updatedAt: false,
      __v: false
    })
    // here we return the JSON to whoever is requesting it 
    // can be a phone, a desktop, postman....
    .then(allPatinetes => res.status(200).json(allPatinetes))
});


// this endpoint returns patinetes near me
// based on geolocation queries supported by mongodb
// this requires knowing max and min distance, and where you are
// where you are>>> coordinates: [ 2.190471916, 41.3977381 ] 
router.get('/patinetesNearme', (req, res, next) => {
  Patinete
    .find({
      location:
        { $near :
           {
             $geometry: { type: "Point",  coordinates: [ 2.190471916, 41.3977381 ] },
             $minDistance: 100,
             $maxDistance: 4000
           }
        }
    })
    .limit(+req.params.nPatinetes)
    .select({
      createdAt: false,
      updatedAt: false,
      __v: false
    })
    .then(allPatinetes => res.status(200).json(allPatinetes))
});

// this creates a new patinete based on the form's provided info
// coming from the front end
/*
  these are the involved lines to generate the form's info in the FE

  var payload = {
    lat: +document.querySelector("#newPatinete input[name=lat]").value,
    lng: +document.querySelector("#newPatinete input[name=lng]").value,
    state: +document.querySelector("#newPatinete input[name=state]").value,
    rented: false
  }
*/
router.post('/newPatinete', (req, res, next) => {
  // for example, req.body.state would be the sent json state property
  Patinete
    .create({
      state: req.body.state,
      rented: req.body.rented,
      location: {
        "type": "Point",
        "coordinates": [
          req.body.lat,
          req.body.lng
        ]
      }
    })
    // we return the newly created patinete to whoever requested creating it
    .then(newPatineteRecorded => {
      res.status(200).json({ newPatineteRecorded })
    })
});



// create hundreds of new fake patinetes
router.get('/seed', (req, res, next) => {
  for (let index = 0; index < 100; index++) {
    Patinete
      .create({
        rented: false,
        location: {
          "type": "Point",
          "coordinates": [
            randomFloat(2.154007, 2.354007),
            randomFloat(41.390205, 41.690205),
          ]
        }
      })
  }

  res.status(200).json({ generated: true })
});

module.exports = router;
