'use strict'
var express = require("express");
var usuarioControlador = require("../controladores/usuario.controlador");
var md_autorizacion = require("../middlewares/authenticated");
var api = express.Router();

api.post("/agregarUsuario", usuarioControlador.agregarUsuario);
api.post("/login", usuarioControlador.login);
api.delete('/eliminarUsuario', md_autorizacion.ensureAuth, usuarioControlador.eliminarUsuario);
api.put('/editarUsuario', md_autorizacion.ensureAuth, usuarioControlador.editarUsuario);
api.get('/obtenerUsuarios', md_autorizacion.ensureAuth ,usuarioControlador.obtenerUsuarios);
api.get('/BuscarHotel', usuarioControlador.BuscarHotel);
api.get('/BuscarHotelNomDire', usuarioControlador.BuscarHotelNomDire);
api.post("/agregarReservacion", usuarioControlador.agregarReservacion);
api.post('/historial', md_autorizacion.ensureAuth ,usuarioControlador.historial);
api.get('/reservacionesHechas', md_autorizacion.ensureAuth ,usuarioControlador.reservacionesHechas);
api.post('/usuarioHospedado', md_autorizacion.ensureAuth ,usuarioControlador.usuarioHospedado);

module.exports = api;