'use strict'
var express = require("express");
var habitacionControlador = require("../controladores/habitacion.controlador");
var md_autorizacion = require("../middlewares/authenticated");
var api = express.Router();

api.post("/agregarHabitacion", md_autorizacion.ensureAuth, habitacionControlador.agregarHabitacion);
api.get('/habitacionPorHotel', habitacionControlador.habitacionPorHotel);
api.delete('/eliminarHabitacion', md_autorizacion.ensureAuth, habitacionControlador.eliminarHabitacion);
api.post("/habitacionesDisponibles", md_autorizacion.ensureAuth, habitacionControlador.habitacionesDisponibles);

module.exports = api;