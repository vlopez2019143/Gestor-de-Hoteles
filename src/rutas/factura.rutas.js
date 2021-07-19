'use strict'
var express = require("express");
var facturaControlador = require("../controladores/factura.controlador");
var md_autorizacion = require("../middlewares/authenticated");
var api = express.Router();

api.post("/agregarFactura", md_autorizacion.ensureAuth, facturaControlador.agregarFactura);
api.post("/agregarServicioFactura", md_autorizacion.ensureAuth, facturaControlador.agregarServicioFactura);
api.put('/cancelarFactura',md_autorizacion.ensureAuth, facturaControlador.cancelarFactura);
api.put('/finalzarFactura',md_autorizacion.ensureAuth, facturaControlador.finalzarFactura);
api.post("/prueba", md_autorizacion.ensureAuth, facturaControlador.prueba);

module.exports = api;