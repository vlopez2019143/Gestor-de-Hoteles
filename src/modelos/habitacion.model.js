'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var HabitacionSchema = Schema({
    nombre: String,
    estado: String,
    precio: Number,
    nombreHotel: { type: Schema.Types.String, ref: 'hoteles' }
});

module.exports = mongoose.model('habitaciones', HabitacionSchema);