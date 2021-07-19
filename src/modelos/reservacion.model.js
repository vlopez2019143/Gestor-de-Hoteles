'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ReservacionSchema = Schema({
    hotelNombre: { type: Schema.Types.String, ref: 'hoteles' },
    username: { type: Schema.Types.String, ref: 'usuarios' },
    habitacionNombre: { type: Schema.Types.String, ref: 'habitaciones' },
    estado: String,
    FechaIni: String,
    FechaFin: String,
});

module.exports = mongoose.model('reservaciones', ReservacionSchema);