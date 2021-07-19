'use strict'
var Evento = require("../modelos/evento.model");
var Hotel = require("../modelos/hotel.model");
var Servicio = require("../modelos/servicio.model");
var Usuario = require("../modelos/usuario.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");

function agregarHotel(req, res) {
    var hotelModel = new Hotel();
    var params = req.body;
    var idUsuario = params.administrador;
    delete params.password;
    var rolUsuario = req.user.rol;
    var final = {};
    final['rol'] = "ROL_HOTEL";
    
    if (params.nombre && params.direccion && params.administrador) {
        hotelModel.nombre = params.nombre;
        hotelModel.direccion = params.direccion;
        hotelModel.idAdmin = params.administrador;
        hotelModel.stock = 0;
        if (rolUsuario == "ROL_ADMIN") {
        Hotel.find({
            $or:[{nombre: hotelModel.nombre},
                {idAdmin: hotelModel.idAdmin}
            ]}
        ).exec((err, Encontrados) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Hoteles' });
            if (Encontrados && Encontrados.length >= 1) {
                return res.status(500).send({ mensaje: 'El nombre del Hotel ya existe, o el usuario ya es administrador de otro hotel' });
            } else {
                hotelModel.save((err, Guardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar Hotel' });
                    if (Guardado) {
                        res.status(200).send({ Guardado })
                    }else {
                        res.status(404).send({ mensaje: 'No se ha podido registrar el hotel' })
                    }
                })

                Usuario.findOneAndUpdate({username: idUsuario}, final, { new: true }, (err, usuarioActualizado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se a podido encontrar al Usuario' });
                })

            }
        })
        }else{
            return res.status(500).send({ mensaje: 'Un cliente no puede agregar un hotel' });
        }
    }
}

function editarHotel(req, res) {
    var params = req.body;
    var nombreHo = params.nombreEdit;
    if (req.user.rol != "ROL_ADMIN") {
         return res.status(500).send({ mensaje: 'No se puede editar un Administrador' });
    }else{
        Hotel.find(
            { nombre: params.nombre }
        ).exec((err, Encontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Hotels' });
            if (Encontrada && Encontrada.length >= 1) {
                return res.status(500).send({ mensaje: 'El Hotel ya existe, o el usuario agregado ya administra otro Hotel' });
            }
            Hotel.findOneAndUpdate(nombreHo, params, { new: true }, (err, Actualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!Actualizado) return res.status(500).send({ mensaje: 'No se a podido editar al Hotel' });
            return res.status(200).send({ Actualizado })
            })
        })  


        

    }
}

function agregarEvento(req, res){
    var rolUsuario = req.user.rol;
    var EventoModel = new Evento();
    var params = req.body;
    if (rolUsuario == "ROL_ADMIN") {
        if (params.tipo && params.descripcion && params.nombreHotel) {
            EventoModel.tipo = params.tipo;
            EventoModel.descripcion = params.descripcion;
            EventoModel.nombreHotel = params.nombreHotel;
            Evento.find(
                { tipo: EventoModel.tipo, nombreHotel: EventoModel.nombreHotel}
            ).exec((err, ServiEncontrados) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion de evento' });
                if (ServiEncontrados && ServiEncontrados.length >= 1) {
                    return res.status(500).send({ mensaje: 'Ya hay un evento parecido' });
                } else {
                    EventoModel.save((err, eventoGuardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar evento' });
                    if (eventoGuardado) {
                        res.status(200).send({ eventoGuardado })
                    } else {
                        res.status(404).send({ mensaje: 'No se ha podido registrar el evento' })
                    }
                })
                }
            })

            

        }
    }else{
        return res.status(500).send({ mensaje: 'Un cliente no puede agregar un evento' });
    }
}

function agregarServicios(req, res){
    var rolUsuario = req.user.rol;
    var ServicioModel = new Servicio();
    var params = req.body;
    if (rolUsuario == "ROL_ADMIN") {
        if (params.nombre && params.precio && params.hotelNombre ) {
            ServicioModel.nombre = params.nombre;
            ServicioModel.precio = params.precio;
            ServicioModel.hotelNombre = params.hotelNombre;
            Servicio.find(
                { nombre: ServicioModel.nombre, hotelNombre: ServicioModel.hotelNombre}
            ).exec((err, ServiEncontrados) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion de servicios' });
                if (ServiEncontrados && ServiEncontrados.length >= 1) {
                    return res.status(500).send({ mensaje: 'Ya hay un servicio parecido' });
                } else {
                    ServicioModel.save((err, servivcioGuardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar Servicio' });
                    if (servivcioGuardado) {
                        res.status(200).send({ servivcioGuardado })
                    } else {
                        res.status(404).send({ mensaje: 'No se ha podido registrar el Servicio' })
                    }
                    })
                }
            })
        }
    }else{
        return res.status(500).send({ mensaje: 'Un cliente no puede agregar un Servicio' });
    }
}

function buscarEventosporHotel(req, res) {

    var params = req.body;
    Evento.find({nombreHotel: params.nombre}).exec(
    (err, Eventoss) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!Eventoss) return res.status(500).send({mensaje: "No Existe un Hotel con ese nombre"})
            return res.status(200).send({ Eventoss });
        }
    })
    
}

function buscarServiciosporHotel(req, res) {

    var params = req.body;

    Servicio.find({hotelNombre: params.nombre}).exec(
    (err, Servicioss) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!Servicioss) return res.status(500).send({mensaje: "No Existe un Hotel con ese nombre"})
            return res.status(200).send({ Servicioss });
        }
    })
    
}

function eliminarHotel(req,res){
    var params= req.body;
    var nombre =params.nombre;
    var final2 = {};
    final2['rol'] = "ROL_CLIENTE";
    if(req.user.rol === "ROL_ADMIN"){
        Hotel.findOne({nombre: params.nombre}).exec(
        
            (err, Hoteless) => {
                if(err){res.status(500).send("Error en la peticion");
                }else{
                    if (!Hoteless) return res.status(500).send({mensaje: "No Existe un Hotel con ese nombre"})
                }
               Usuario.findOneAndUpdate({username:Hoteless.idAdmin}, final2, { new: true }, (err, usuarioActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se a podido editar al Usuario' });
        }) 
        })
        
        Hotel.findOneAndDelete({nombre: nombre},(err, hotelEliminado)=>{
        if(err) return res.status(500).send({mensaje:"Error en la peticion"});
        if(!hotelEliminado) return res.status(500).send({mensaje:"No se ha podido Eliminar el Hotel"});
        
        return res.status(200).send({mensaje: "Se ha eliminado el Hotel"});
        })
    }else{
        return res.status(500).send({mensaje: "Un cleinte no puede eliminar un hotel"});
    }

}

function eliminarEvento(req,res){
    var params= req.body;
    var nombre =params.nombre;
    if(req.user.rol === "ROL_ADMIN"){
        Evento.findOneAndDelete({tipo:nombre},(err, Eliminado)=>{
        if(err) return res.status(500).send({mensaje:"Error en la peticion"});
        if(!Eliminado) return res.status(500).send({mensaje:"No se ha podido Eliminar el Evento"});
        return res.status(200).send({mensaje: "Se ha eliminado el Evento"});
        })
    }else{
        return res.status(500).send({mensaje: "Un cleinte no puede eliminar un Evento"});
    }

}

function eliminarServicio(req,res){
    var params= req.body;
    var nombre =params.nombre;
    if(req.user.rol === "ROL_ADMIN"){
        Servicio.findOneAndDelete({nombre: nombre},(err, Eliminado)=>{
        if(err) return res.status(500).send({mensaje:"Error en la peticion"});
        if(!Eliminado) return res.status(500).send({mensaje:"No se ha podido Eliminar el Evento"});
        return res.status(200).send({mensaje: "Se ha eliminado el Evento"});
        })
    }else{
        return res.status(500).send({mensaje: "Un cleinte no puede eliminar un Evento"});
    }

}

function obtenerHoteles(req,res) {
    
    Hotel.find({}).exec((err, Hoteless) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!Hoteless) return res.status(500).send({mensaje: "No Existe un Hotel con ese nombre"})
            return res.status(200).send({ Hoteless });
        }
    })

}

module.exports = {
    agregarHotel,
    agregarEvento,
    agregarServicios,
    eliminarHotel,
    buscarEventosporHotel,
    eliminarEvento,
    eliminarServicio,
    buscarServiciosporHotel,
    obtenerHoteles,
    editarHotel
}