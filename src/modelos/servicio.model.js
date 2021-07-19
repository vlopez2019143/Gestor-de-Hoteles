'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ServicioSchema = Schema({
    nombre: String,
    precio: Number,
    hotelNombre: { type: Schema.Types.String, ref: 'hoteles' },
});

module.exports = mongoose.model('servicios', ServicioSchema);