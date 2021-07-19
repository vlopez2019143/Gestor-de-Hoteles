'use strict'
var express = require("express");
var hotelControlador = require("../controladores/hotel.controlador");
var md_autorizacion = require("../middlewares/authenticated");
var api = express.Router();

api.post("/agregarHotel", md_autorizacion.ensureAuth, hotelControlador.agregarHotel);
api.post("/agregarevento", md_autorizacion.ensureAuth, hotelControlador.agregarEvento);
api.post("/agregarServicios", md_autorizacion.ensureAuth, hotelControlador.agregarServicios);
api.delete('/eliminarHotel', md_autorizacion.ensureAuth, hotelControlador.eliminarHotel);
api.delete('/eliminarEvento', md_autorizacion.ensureAuth, hotelControlador.eliminarEvento);
api.delete('/eliminarServicio', md_autorizacion.ensureAuth, hotelControlador.eliminarServicio);
api.get('/buscarEventosporHotel', hotelControlador.buscarEventosporHotel);
api.put('/buscarServiciosporHotel', hotelControlador.buscarServiciosporHotel);
api.get('/obtenerHoteles', hotelControlador.obtenerHoteles);
api.put('/editarHotel', md_autorizacion.ensureAuth, hotelControlador.editarHotel);

module.exports = api;