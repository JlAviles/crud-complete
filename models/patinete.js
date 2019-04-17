const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const patineteSchema = new Schema({
  rented: Boolean,
  state: {
    type: Number,
    min: 0,
    max: 5,
    default: 5
  },
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, {
  timestamps: true
});

const Patinete = mongoose.model("Patinete", patineteSchema);
module.exports = Patinete;