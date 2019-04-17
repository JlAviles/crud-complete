const express = require('express');
const router  = express.Router();
const Patinete = require("../models/patinete")

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.post('/newPatinete', (req, res, next) => {
  Patinete
    .create({
      rented: req.body.rented,
      location: {
        "type" : "Point",
        "coordinates" : [
          req.body.lng,
          req.body.lat
        ]
      }
    })
    .then(newPatineteRecorded => {
      res.status(200).json({newPatineteRecorded})
    })
});



// create hundreds of new fake patinetes
router.get('/seed', (req, res, next) => {
  for (let index = 0; index < 100; index++) {
    Patinete
    .create({
      rented: false,
      location: {
        "type" : "Point",
        "coordinates" : [
          randomFloat(2.154007, 2.354007),
          randomFloat(41.390205, 41.690205),
        ]
      }
    })
  }

  res.status(200).json({generated: true})
});

module.exports = router;
