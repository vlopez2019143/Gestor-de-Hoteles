'use strict'

const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");

var usuario_rutas = require("./src/rutas/usuario.rutas");
var hotele_rutas = require("./src/rutas/hotel.rutas")
var habitacion_rutas = require("./src/rutas/habitacion.rutas")
var factura_rutas= require("./src/rutas/factura.rutas")

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use('/api', usuario_rutas, hotele_rutas, habitacion_rutas, factura_rutas);

module.exports = app;