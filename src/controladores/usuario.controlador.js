'use strict'
var Habitacion = require("../modelos/habitacion.model");
var Hotel = require("../modelos/hotel.model");
var Reservacion = require("../modelos/reservacion.model");
var Usuario = require("../modelos/usuario.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../servicios/jwt");

function admin(req, res) {
    var usuarioModel = Usuario();   
    usuarioModel.nombre= "Administrador"
    usuarioModel.username = "Administrador"
    usuarioModel.rol="ROL_ADMIN"
    Usuario.find({ 
        nombre: "Administrador"
    }).exec((err, adminoEncontrado )=>{
        if(err) return console.log({mensaje: "Error al crear Administrador"});
        if(adminoEncontrado.length >= 1){
        return console.log("El Administrador esta preparado");
        }else{bcrypt.hash("123456", null, null, (err, passwordEncriptada)=>{
            usuarioModel.password = passwordEncriptada;
            usuarioModel.save((err, usuarioguardado)=>{
                if(err) return console.log({mensaje : "Error en la peticion"});
                if(usuarioguardado){console.log("Administrador preparado");
                }else{
                console.log({mensaje:"El administrador no esta listo"});
                }      
            })     
        })
        }
    })
}

function agregarUsuario(req, res) {
    var usuarioModel = new Usuario();
    var params = req.body;
    if (params.nombre && params.password && params.username) {
        usuarioModel.nombre = params.nombre;
        usuarioModel.username = params.username;
        usuarioModel.rol = 'ROL_CLIENTE';
        Usuario.find(
            { username: usuarioModel.username }
        ).exec((err, usuariosEncontrados) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Usuarios' });
            if (usuariosEncontrados && usuariosEncontrados.length >= 1) {
                return res.status(500).send({ mensaje: 'El username ya esta ocupado' });
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                    usuarioModel.password = passwordEncriptada;

                    usuarioModel.save((err, usuarioGuardado) => {

                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar Usuario' });

                        if (usuarioGuardado) {
                            res.status(200).send({ usuarioGuardado })
                        } else {
                            res.status(404).send({ mensaje: 'No se ha podido registrar el Usuario' })
                        }
                    })
                })
            }
        })

    }
}

function login(req, res) {
    var params = req.body; 
    Usuario.findOne({username: params.username}, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({mensaje: "Error en la petición"});
        if(usuarioEncontrado){
            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada)=>{
                if(err) return res.status(500).send({mensaje: "Error en la petición"});
                if(passVerificada){
                     if(params.getToken == "true"){
                        return res.status(200).send({token: jwt.createToken(usuarioEncontrado)});
                     }else{
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({usuarioEncontrado});
                     }
                }else{
                    return res.status(500).send({mensaje:"El Usuario no se a podido identificar"});
                }
            })


        }else{
            return res.status(500).send({mensaje:"Error al buscar el Usuario"})
        }
    })
}

function eliminarUsuario(req, res){
    var idUsuario= req.user.sub;

    if(req.user.rol === "ROL_HOTEL"){
        return res.status(500).send({mensaje: "No puede eliminar su cuenta, esta sirviendo como administrador de un Hotel"});
    }

    if(req.user.rol === "ROL_ADMIN"){
        return res.status(500).send({mensaje: "No se puede eliminar al Administrador"});
    }

    Usuario.findByIdAndDelete(idUsuario,(err, usuarioEliminado)=>{
    if(err) return res.status(500).send({mensaje:"Error en la peticion"});
    if(!usuarioEliminado) return res.status(500).send({mensaje:"No se ha podido Eliminar el usuario"});
    return res.status(200).send({mensaje: "Se ha eliminado el Usuario"});
    })

    
}

function editarUsuario(req, res) {
    var idUsuario = req.user.sub;
    var params = req.body;
    if (req.user.rol != "ROL_ADMIN") {
        Usuario.find(
            { username: params.username }
        ).exec((err, Encontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Usuario' });
            if (Encontrada && Encontrada.length >= 1) {
                return res.status(500).send({ mensaje: 'El username ya existe' });
            }
            Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!usuarioActualizado) return res.status(500).send({ mensaje: 'No se a podido editar al Usuario' });
            return res.status(200).send({ usuarioActualizado })
            })
        })   
    }else{
        return res.status(500).send({ mensaje: 'No se puede editar un Administrador' });
    }
}

function obtenerUsuarios(req, res) {
    var rolUsuario = req.user.rol;

    if (rolUsuario != "ROL_ADMIN") {
        return res.status(500).send({ mensaje: 'No eres un Administrador' });
    }else{
        Usuario.find().exec((err, usuariosEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Usuarios' });
        if (!usuariosEncontrados) return res.status(500).send({ mensaje: 'Error en la consutla de Usuarios o no tiene datos' });
        return res.status(200).send({ usuariosEncontrados });
    })
    }
}

function BuscarHotel(req, res) {
    var params = req.body;

    Hotel.findOne({nombre: params.nombre}).exec(
    (err, Hoteless) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!Hoteless) return res.status(500).send({mensaje: "No Existe un Hotel con ese nombre"})
            return res.status(200).send({ Hoteless });
        }
    })
}

function BuscarHotelNomDire(req, res) {
    var params = req.body;
    Hotel.findOne({$or:[{nombre: params.nombre},{direccion: params.nombre} ]}).exec(
    (err, Hoteless) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!Hoteless) return res.status(500).send({mensaje: "No Existe un Hotel con ese nombre"})
            return res.status(200).send({ Hoteless });
            
        }
    })
}

function agregarReservacion(req, res) {
    var ReservacionModel = new Reservacion();
    var params = req.body;
    var final = {};
    final['estado'] = "Ocupado";
    if (params.hotelNombre && params.username && params.habitacionNombre && params.FechaIni && params.FechaFin) {
            
        ReservacionModel.hotelNombre = params.hotelNombre;
        ReservacionModel.username = params.username;
        ReservacionModel.habitacionNombre = params.habitacionNombre;
        ReservacionModel.FechaIni = new Date(params.FechaIni);
        ReservacionModel.FechaFin = new Date(params.FechaFin);
        ReservacionModel.estado = "Activa";

        Habitacion.findOne({nombre: params.habitacionNombre, nombreHotel: params.hotelNombre, estado: "Vacio"},(err, HabitacionEncontrada) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if (!HabitacionEncontrada) return res.status(500).send({ mensaje: 'No se a podido encontrar la habitacion o esta ocupada' });
            if (HabitacionEncontrada.estado = "Vacio"){

                Habitacion.findOneAndUpdate({nombre: params.habitacionNombre, nombreHotel: params.hotelNombre}, final, { new: true }, (err, HabitacionActualizado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if (!HabitacionActualizado) return res.status(500).send({ mensaje: 'No se a podido encontrar la habitacion' });
                    ReservacionModel.save((err, reserGuardado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Guardar Habitacion' });
                    if (reserGuardado) {
                        res.status(200).send({ reserGuardado })
                    } else {
                        res.status(404).send({ mensaje: 'No se ha podido registrar la habitacion' })
                    }
                    })
                })                
            }else{
                return res.status(500).send({ mensaje: 'La habitacion esta ocupada'});
            }
            
        })
    }

}

function reservacionesHechas(req ,res) {
    var idUsuario = req.user.username
    if (req.user.rol != "ROL_HOTEL") {
        return res.status(500).send({ mensaje: 'No eres un Administrador de hotel' });
    }else{
        Hotel.findOne({idAdmin: idUsuario}).exec((err, Hoteless) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!Hoteless) return res.status(500).send({mensaje: "No Existe un Hotel con ese nombre"})
            Reservacion.find({hotelNombre: Hoteless.nombre}).exec(
                (err, Hostoria) => {
                    if(err){res.status(500).send("Error en la peticion");
                    }else{
                        if (!Hostoria) return res.status(500).send({mensaje: "Aun no te has hospedado en un hotel. Empieza ya!"})
                        return res.status(200).send({ Hostoria });
                    }
                })
        }
    })
    }


    
}

function usuarioHospedado(req, res) {
    var params = req.body;
    var usernameUsuario = req.user.username;

    Hotel.findOne({idAdmin: usernameUsuario}).exec((err, Hoteless) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!Hoteless) return res.status(500).send({mensaje: "No Existe un Hotel con ese nombre"})
            Reservacion.find({hotelNombre: Hoteless.nombre, username:params.usuario, estado: "Activa"}).exec(
                (err, siEsta) => {
                    if(err){res.status(500).send("Error en la peticion");
                    }else{
                        if (siEsta.length == 0) return res.status(500).send({mensaje: "El usuario no esta hospedado en el hotel"})
                        if (siEsta.length > 0) return res.status(500).send({mensaje: "El usuario si esta hospedado en el hotel"})
                    }
                })
        }
    })
    
}

function historial(req,res) {
    var idUsuario= req.user.username;
    Reservacion.find({username: idUsuario}).exec(
    (err, Hostoria) => {
        if(err){res.status(500).send("Error en la peticion");
        }else{
            if (!Hostoria || Hostoria.length == 0) return res.status(500).send({mensaje: "Aun no te has hospedado en un hotel. Empieza ya!"})
            return res.status(200).send({ Hostoria });
        }
    })
}


module.exports = {
    admin,
    agregarUsuario,
    login,
    eliminarUsuario,
    editarUsuario,
    obtenerUsuarios,
    BuscarHotel,
    BuscarHotelNomDire,
    agregarReservacion,
    historial,
    reservacionesHechas,
    usuarioHospedado
}