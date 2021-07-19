'use strict'
var Habitacion = require("../modelos/habitacion.model");
var Hotel = require("../modelos/hotel.model");
var Reservacion = require("../modelos/reservacion.model");

var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");

function agregarHabitacion(req, res) {
    var habitacionModel = new Habitacion();
    var params = req.body;

    if (req.user.rol == "ROL_ADMIN") {
        if (params.nombre && params.precio && params.nombreHotel) {
        habitacionModel.nombre = params.nombre;
        habitacionModel.estado = "Vacio";
        habitacionModel.precio = params.precio;
        habitacionModel.nombreHotel = params.nombreHotel;
        Habitacion.find(
            { nombre: habitacionModel.nombre,
            nombreHotel: habitacionModel.nombreHotel}
        ).exec((err, Encontrados) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Habitacion' });
            if (Encontrados && Encontrados.length >= 1) {
                return res.status(500).send({ mensaje: 'La habitacion ya fue registrada' });
            } else {

                Hotel.find({nombre : habitacionModel.nombreHotel}).exec((err, HotelExiste)=>{
                    if(err) return res.status(500).send({mensaje: "Error con el nombre hotel "})
                    if(HotelExiste.length === 0) return res.status(500).send({mensaje:"Error con el nombre hotel"})
                    habitacionModel.save((err, Guardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar Habitacion' });
                    if (Guardado) { 
                        var suma= Number(HotelExiste[0].stock) + 1
                        console.log(suma)
                        Hotel.update({nombre: habitacionModel.nombreHotel},{stock: suma}).exec(()=>{
                        if(err) return res.status(500).send({mensaje: "Error"})
                        return res.status(200).send({Guardado})
                        })
                    } else {
                        return res.status(404).send({ mensaje: 'No se ha podido registrar la Habitacion' })
                    }
                })
                })

            }
        })

    }
    }else{
        return res.status(500).send({ mensaje: 'Un cliente no puede agregar una habitacion' });
    }
    
}

function eliminarHabitacion(req, res) {
    var params= req.body;
    var nombre =params.nombre;
    if(req.user.rol === "ROL_ADMIN"){
        Habitacion.findOne({nombre: nombre}).exec((err, busqueda)=>{
            console.log(busqueda)
            if(err) return res.status(500).send({mensaje: "Error con el nombre habitacion "})
            if(!busqueda)return res.status(500).send({mensaje: "busqueda mal"})
            Hotel.find({nombre: busqueda.nombreHotel}).exec((err, HotelExiste)=>{
            if(err) return res.status(500).send({mensaje: "Error con el nombre hotel "})
            if(!HotelExiste)return res.status(500).send({mensaje: "HotelNoExiste"})
            Habitacion.findOneAndDelete({nombre:nombre},(err, Eliminado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar Habitacion' });
            if (Eliminado) { 
                var suma= Number(HotelExiste[0].stock) - 1
                console.log(suma)
                Hotel.update({nombre: busqueda.nombreHotel},{stock: suma}).exec(()=>{
                if(err) return res.status(500).send({mensaje: "Error"})
                return res.status(200).send({Eliminado})
                })
            } else {
                return res.status(404).send({ mensaje: 'No se ha podido registrar la Habitacion2' })
            }
        })
        })
        })
    }else{
        return res.status(500).send({mensaje: "Un cleinte no puede eliminar un Evento"});
    }

    
}

function habitacionPorHotel(req, res) {
    var params = req.body;
    var FechaAhora = new Date ();
    var final = {};
    var finaltres = {}; 
    final['estado'] = "Vacio";
    finaltres['estado'] = "Finalizada"
    Hotel.findOne({nombre: params.nombre}).exec((err, Hoteless) => {
        if(err){
            res.status(500).send("Error en la peticion");
        }else{
           if (!Hoteless) return res.status(500).send({mensaje: "No Existe un Hotel con ese nombre"})
           Habitacion.find({nombreHotel: Hoteless.nombre}).exec(
            (err, habitacion) => {
                if(err){res.status(500).send("Error en la peticion");
                }else{
                    if (!habitacion) return res.status(500).send({mensaje: "No Existe una habitacion con ese nombre"})
                    Reservacion.find({estado: "Activa"}, (err, reservacionAutomatico)=>{

                        for(var a=0; a < habitacion.length; a++){
                
                            for(var b=0; b < reservacionAutomatico.length; b++){

                                if(reservacionAutomatico[b].habitacionNombre === habitacion[a].nombre){
                                    var FechaFiin = new Date(reservacionAutomatico[b].FechaFin);
                                    if(FechaFiin.getTime() < FechaAhora.getTime()){

                                        Reservacion.findByIdAndUpdate(reservacionAutomatico[b]._id, finaltres , (err, act) => {
                                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                            if (!act) return res.status(500).send({ mensaje: 'No se a podido editar la reservacion' });
                                        })
                                        
                                        Habitacion.update({nombre: reservacionAutomatico[b].habitacionNombre},final,(err, actualizados)=>{
                                            if(err) return res.status(500).send( {mensaje:"Error en la peticion"});
                                            if(!actualizados) return res.status(500).send( {mensaje:"Error al actualizar"});
                                        })
    
                                    }
                                }
                
                            }
                
                        }
                
                    })
                    return res.status(200).send({ habitacion });
                }
            })
        }
    })
}

function habitacionesDisponibles(req,res) {
    var idUsuario = req.user.username
    var estadoHab = "Vacio"
    if (req.user.rol != "ROL_HOTEL") {
        return res.status(500).send({ mensaje: 'No eres un Administrador de hotel' });
    }else{
        Hotel.findOne({idAdmin: idUsuario}).exec((err, Hoteless) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!Hoteless) return res.status(500).send({mensaje: "No Existe un Hotel con ese nombre"})
            Habitacion.find({nombreHotel: Hoteless.nombre, estado: estadoHab}).exec(
                (err, habitacionesds) => {
                    if(err){res.status(500).send("Error en la peticion");
                    }else{
                        if (!habitacionesds) return res.status(500).send({mensaje: "Aun no te has hospedado en un hotel. Empieza ya!"})
                        return res.status(200).send({ habitacionesds });
                    }
            })
        }
    })
    }

    
}
 

module.exports = {
    agregarHabitacion,
    habitacionPorHotel,
    eliminarHabitacion,
    habitacionesDisponibles
}