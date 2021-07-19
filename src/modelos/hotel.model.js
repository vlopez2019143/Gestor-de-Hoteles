'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var HotelSchema = Schema({
    nombre: String,
    direccion: String,
    idAdmin: { type: Schema.Types.String, ref: 'hoteles' },
    stock: Number
});

module.exports = mongoose.model('hoteles', HotelSchema);