'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FacturaSchema = Schema({
    nombreUsuario: { type: Schema.Types.String, ref: 'usuarios' },
    habitacionNombre: { type: Schema.Types.String, ref: 'habitaciones' },
    editable: String,
    ServiciosFactura: [{
        nombreServicio: { type: Schema.Types.String, ref: 'servicios' },
    }],
    total: Number
});

module.exports = mongoose.model('facturas', FacturaSchema);