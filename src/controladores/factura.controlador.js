'use strict'
var Factura = require("../modelos/factura.model");
var Hotel = require("../modelos/hotel.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");

 
function agregarFactura(req,res) {
    var facturaModel = new Factura();
    var params = req.body;
    var rolUsuario = req.user.rol;
    
    if (params.nombreUsuario && params.habitacionNombre) {
        facturaModel.nombreUsuario = params.nombreUsuario;
        facturaModel.habitacionNombre = params.habitacionNombre;
        facturaModel.editable = "Si";
        facturaModel.total = 0;
        if (rolUsuario == "ROL_HOTEL" || rolUsuario == "ROL_ADMIN") {
            facturaModel.save((err, Guardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar factura' });
                    if (Guardado) {
                        res.status(200).send({ Guardado })
                    }else {
                        res.status(404).send({ mensaje: 'No se ha podido registrar el factura' })
                    }
                })
        }else{
            return res.status(500).send({ mensaje: 'Un cliente no puede agregar una factura' });
        }
    }
}

function cancelarFactura(req, res) {
    var rolUsuario = req.user.rol;
    var params= req.body;
    if (rolUsuario == "ROL_HOTEL") {
        Factura.findOne({_id: params.idFactura}).exec(
            (err, factura) => {
                if(err){
                    console.log(err);
                }else{
                    if (factura.editable == "no"){
                    return res.status(500).send({ mensaje: "No se puede Eliminar/editar una factura terminada" });
                }else{
                    Factura.findByIdAndDelete(params.idFactura,(err, Eliminado)=>{
                    if(err) return res.status(500).send({mensaje:"Error en la peticion"});
                    if(!Eliminado) return res.status(500).send({mensaje:"No se ha podido cancelar la factura, revise que este bien el iD"});
                        return res.status(200).send({mensaje: "Se ha cancelado la factura"});
                    })
                }
                }
                
            }
        )
    }else{
        return res.status(500).send({ mensaje: 'Un cliente no puede cancelar una factura' });
    }
}

function finalzarFactura(req, res) {
    var rolUsuario = req.user.rol;
    if (rolUsuario == "ROL_HOTEL") {
        var params = req.body; 
        var finalcuatro = {};
        finalcuatro['editable'] = "no";
        Factura.findByIdAndUpdate(params.idFactura, finalcuatro, { new: true }, (err, productoActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!productoActualizado) return res.status(500).send({ mensaje: 'No se a podido editar el producto' });
            return res.status(200).send({ productoActualizado })
        })
    }else{
        return res.status(500).send({ mensaje: 'Un cliente no puede finalizar una factura' });
    }
    
}

function agregarServicioFactura(req,res){
    var params = req.body;
    var rolUsuario = req.user.rol;
    if (rolUsuario == "ROL_HOTEL") {
        Factura.findByIdAndUpdate(params.identificador, 
        { $push: { ServiciosFactura: { nombreServicio: params.nombre } } },
        {new: true}, (err, servicioFin)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de agregar servicio' });
            if(!servicioFin) return res.status(500).send({mensaje: 'Error al guardar el servicio'});
            if (servicioFin.editable == "no"){
                return res.status(500).send({ mensaje: "No se puede Eliminar/editar una factura terminada" });
            }else{
                return res.status(200).send({ servicioFin })
            }
            
        })

    }else{
        return res.status(500).send({ mensaje: 'Un cliente no puede agragar servicios a una factura' });
    }
    
}

function prueba (req, res){
    var hotelModel = new Hotel();
    var params = req.body;
    var rolUsuario = req.user.rol;
    var rol = {};
    rol['rol'] = "ROL_HOTEL";
    if (params.nombre && params.direccion && params.administrador){
        hotelModel.nombre = params.nombre;
        hotelModel.direccion = params.direccion;
        hotelModel.administrador = params.administrador;
        if(rolUsuario === "ROL_HOTEL"){
            Hotel.find({nombre: hotelModel.nombre, direccion: hotelModel.direccion}
                ).exec((err, hotelEncontrado)=>{
                    if(err) return res.status(500).send({mensaje:"No se encontró el hotel"});
                    if(hotelEncontrado && hotelEncontrado.length >= 1){
                        return res.status(500).send({mensaje: "Ya existe un hotel con estas credenciales"})
                    }
                   hotelModel.save((err, hotelGuardado)=>{
                       if(err) return res.status(404).send({mensaje:"Error al guardar el hotel"});
                       if(!hotelGuardado) return res.status(404).send({mensaje: "Error en la petición"});
                       if(hotelGuardado) res.status(200).send({ hotelGuardado })
                   })

                })
        }
    }else{return res.status(500).send({mensaje:"Error con los credenciales"})}



}

module.exports = {
    agregarFactura,
    agregarServicioFactura,
    cancelarFactura,
    finalzarFactura,
    prueba
}