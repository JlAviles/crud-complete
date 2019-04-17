const express = require('express');
const router = express.Router();
const Patinete = require("../models/patinete")

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.put('/updatePatinete', (req, res, next) => {
  Patinete
    .findByIdAndUpdate(
      req.body._id,
      {
        "location.coordinates.0": req.body.lng,
        "location.coordinates.1": req.body.lat
      })
    .then(updatedPatinete => res.status(200).json({ updated: true, id: req.body._id }))
});

router.delete('/deletePatinete', (req, res, next) => {
  console.log(req.body._id)
  Patinete
    .findByIdAndDelete(req.body._id)
    .then(deletedPatinete => res.status(200).json({ deleted: true, id: req.body._id }))
});

router.get("/test2", (req, res) => {
  res.json({name1: req.query.name1, name2: req.query.name2})
})

router.get("/test/:param/:param2/:param3", (req, res) => {
  console.log(req.params.param)
  console.log(req.params.param2)
  console.log(req.params.param3)

  res.json({name1: req.params.param, name2: req.params.param2, name3: req.params.param3})
})

router.get('/patinetes/:nPatinetes?', (req, res, next) => {
  Patinete
    .find({ state: { $gte: 1 } })
    .limit(+req.params.nPatinetes)
    .select({
      createdAt: false,
      updatedAt: false,
      __v: false
    })
    .then(allPatinetes => res.status(200).json(allPatinetes))
});

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

router.post('/newPatinete', (req, res, next) => {
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
