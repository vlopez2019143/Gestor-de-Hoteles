'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EventoSchema = Schema({
    tipo: String,
    descripcion: String,
    nombreHotel:  { type: Schema.Types.String, ref: 'hoteles' },
});

module.exports = mongoose.model('eventos', EventoSchema);