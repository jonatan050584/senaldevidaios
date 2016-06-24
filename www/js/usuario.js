var Usuario = function(){
    this.grupo = null
    this.invitaciones = null;
    this.admin = false;
    this.flag=false;

    this.iniciar = function(data){
        console.log("data----");
        console.log(data);
        //$("#marker").show();
        
        var info = data.info;

        this.id = info.id;
        this.nombres = info.nombres;
        this.apellidos = info.apellidos;
        this.email = info.email;
        this.telefono = info.telefono;
        this.llave = info.llave;
        this.fbid = info.fbid;
        this.pic = info.pic;
        //this.marker = 'img/markeruser.png';
        this.marker = info.marker;

        this.grupo = data.grupo;
        this.invitaciones = data.invitaciones;
        this.miembros = data.miembros;
        this.notificaciones = data.notificaciones;

        header.mostrarNotificaciones();


        window.localStorage.setItem("usuario",JSON.stringify(info));
        window.localStorage.setItem("notificaciones",JSON.stringify(data.notificaciones));
        window.localStorage.setItem("grupo",JSON.stringify(data.grupo));
        window.localStorage.setItem("invitaciones",JSON.stringify(data.invitaciones));
        window.localStorage.setItem("miembros",JSON.stringify(data.miembros));
        
       
        //ver si es administrador de grupo
        if(data.grupo!=null && data.miembros!=null){
            $.each(data.miembros,function(k,v){
                if(v.id == usuario.id && v.admin==1){
                    usuario.admin=true;
                }
            })
        }


        if(production && so=="android"){
            geopermisos = window.plugins.permissions;
            geopermisos.hasPermission(checkGeoPermisos, null, geopermisos.ACCESS_FINE_LOCATION);
        }

        flaglogin=true;


        

        //if(production) socket = io.connect('http://picnic.pe:8884');
        if(production) socket = io.connect('http://192.168.0.11:8884');
        else socket = io.connect('http://localhost:8883');

        socket.on("connect", function() {


            console.log("usuario conectado al servidor");

            if(usuario.flag==true){
                $(".alerta").hide();
                new Request("grupo/listarpendientes",{
                    llave:usuario.grupo.llave
                },function(lista){
                    usuario.setInvitaciones(lista);
                })
                new Request("usuario/buscarinvitaciones",{
                    llave:usuario.llave
                },function(res){
                    if(res.length>0){
                        usuario.setNotificaciones(res);
                    }else{
                        usuario.setNotificaciones(null);
                    }
                    
                },{
                    espera:null
                })

                new Request("grupo/listarmiembros",{
                    llave:usuario.grupo.llave
                },function(lista){
                    usuario.setMiembros(lista);

                    
                });



                
            }

            usuario.flag=true;

            
            
            socket.emit('check in',{id:usuario.id});

            if(usuario.grupo!=null){
                socket.emit("join",usuario.grupo.llave);
            }

            
            geoposicion = new Geoposicion();
            geoposicion.iniciar();




            
        });

        socket.on("directo",function(data){
            console.log("socket");
            console.log(data);
            switch(data.ac){
                case "nuevoinvitado":
                    
                    new Request("grupo/listarpendientes",{
                        llave:usuario.grupo.llave
                    },function(lista){
                        usuario.setInvitaciones(lista);
                    })

                    break;
                case "invitacion":
                    
                    new Request("usuario/buscarinvitaciones",{
                        llave:usuario.llave
                    },function(res){
                        if(res.length>0){
                            usuario.setNotificaciones(res);
                        }else{
                            usuario.setNotificaciones(null);
                        }
                        
                    },{
                        espera:null
                    })

                    
                    break;
                case "invitacionrechazada":
                    new Request("grupo/listarpendientes",{
                        llave:usuario.grupo.llave
                    },function(lista){
                        usuario.setInvitaciones(lista);
                    })
                    break;

                case "invitacionaceptada":
                    
                    new Request("grupo/listarpendientes",{
                        llave:usuario.grupo.llave
                    },function(lista){
                        usuario.setInvitaciones(lista);
                    });

                    new Request("grupo/listarmiembros",{
                        llave:usuario.grupo.llave
                    },function(lista){
                        usuario.setMiembros(lista);
                    })

                    break;
                case "invitacioneliminada":
                    new Request("grupo/listarpendientes",{
                        llave:usuario.grupo.llave
                    },function(lista){
                        usuario.setInvitaciones(lista);
                    });
                    break;
                case "notificacioneliminada":
                    new Request("usuario/buscarinvitaciones",{
                        llave:usuario.llave
                    },function(res){
                        if(res.length>0){
                            usuario.setNotificaciones(res);
                        }else{
                            usuario.setNotificaciones(null);
                        }
                        
                    },{
                        espera:null
                    })
                    break;
                case "miembroeliminado":
                    new Request("grupo/listarmiembros",{
                        llave:usuario.grupo.llave
                    },function(lista){
                        usuario.setMiembros(lista);
                    })
                    break;
                case "membresiaeliminada":

                    socket.emit("leave",usuario.grupo.llave);

                    $(".alerta").hide();
                    usuario.setGrupo(null);
                    usuario.setMiembros(null);
                    usuario.setInvitaciones(null);
                    new Alerta("Has sido retirado del Grupo de Seguridad por el administrador");
                    
                    getContent({page:"internagrupo"},true);


                    break;
                case "abandonagrupo":
                    
                    new Request("grupo/listarmiembros",{
                        llave:usuario.grupo.llave
                    },function(lista){

                        usuario.setMiembros(lista);
                    })

                    new Request("grupo/listarpendientes",{
                        llave:usuario.grupo.llave
                    },function(lista){
                        usuario.setInvitaciones(lista);
                    });


                    break;
                case "zonasegura":

                    new Request("grupo/info",{
                        llave:usuario.llave
                    },function(res){
                        usuario.setGrupo(res.grupo);
                        try{
                            ubicacion.zonaMarker.setMap(null);;
                        }catch(e){}
                        ubicacion.setZona();
                    });
                    break;
                case "posicion":
                    console.log(">> Posicion recibida");
                    //console.log(data.id);
                    //console.log(data.posicion);
                    //console.log(enc.desencriptar(data.posicion,usuario.grupo.llave));

                    if(usuario.miembros!=null){
                        $.each(usuario.miembros,function(k,v){
                            if(v.id == data.id){
                                console.log(v.nombres+" ha enviado su posicion: "+enc.desencriptar(data.posicion,usuario.grupo.llave));
                                v.posicion = data.posicion;
                                v.timestamp = data.timestamp;

                                if(terremoto==true && seccion == "ubicacion"){
                                    ubicacion.actualizarPosicion(data.id,v.posicion,v.timestamp);
                                }

                            }



                            
                        })
                        
                    }

                    break;
            }
            
        })

        

        
        socket.on("estadoterremoto",function(valor,mensaje){
            terremoto=valor;
            if(valor){
                $(".alerta").hide();
                new Alerta(mensaje);
                //$("#internagrupo .btn.ubicacion").show();
                //$("#internagrupo").css("padding-top",85);
            }
        });

        socket.on("hayterremoto",function(mensaje){
            terremoto=true;
            new Alerta(mensaje);
            console.log(">> TERREMOTO")
            //$("#internagrupo .btn.ubicacion").show();
             //$("#internagrupo").css("padding-top",85);
             ubicacion.onTerremoto();
        });



        socket.on("acaboterremoto",function(mensaje){
            terremoto=false;
            $(".alerta").hide();
            new Alerta(mensaje);
            console.log("<< ACABO TERREMOTO");
            ubicacion.offTerremoto();
        });

        


        
        
        internagrupo = new Internagrupo();
        ubicacion = new Ubicacion();
        contactos = new Contactos();
        invitaciones = new Invitaciones();
        sobre = new Sobre();
        instrucciones = new Instrucciones();
        menu =  new Menu(this.fbid);
        config = new Config();
        clave = new Clave();
        
        
        
        //this.crearMarker();

    
        
       

        invitaciones.llenarLista();
        internagrupo.llenarListaMiembros();
        internagrupo.llenarListaPendientes();
       
        getContent({page:"instrucciones"},false);




        if(production){
            var push = PushNotification.init({
                android: {
                    senderID: "171369010058"
                },
                ios: {
                    alert: "true",
                    badge: "true",
                    sound: "true"
                }
            });

            push.on('registration', function(data) {
                console.log(">> PUSH ID")
                console.log(data);
                // data.registrationId
                usuario.registrationId = data.registrationId;

                new Request("usuario/setpush",{
                    "llave":usuario.llave,
                    "registrationId":usuario.registrationId
                });

            });

            push.on('notification', function(data) {
                console.log(data);
                // data.message,
                // data.title,
                // data.count,
                // data.sound,
                // data.image,
                // data.additionalData
            });

            push.on('error', function(e) {
                console.log(e);
                // e.message
            });
        
        
        }

    }

    this.crearMarker = function(){
        if(this.pic!=null){

            $("#marker .pic").css("background-image",'url("'+this.pic+'")');

            html2canvas($("#marker .area"), {
              onrendered: function(canvas) {
                usuario.marker = canvas.toDataURL();
                $("#marker").fadeOut();
              }
            });
        }else{
            $("#marker").fadeOut();
        }
    }

   

    this.setGrupo = function(info){
         
    

        this.grupo = info;
        window.localStorage.setItem("grupo",JSON.stringify(info));

    }
    this.setMiembros = function(lista){
        this.miembros = lista;
        window.localStorage.setItem("miembros",JSON.stringify(lista));
        internagrupo.llenarListaMiembros();
    }
    this.setInvitaciones = function(lista){
        this.invitaciones = lista;
        window.localStorage.setItem("invitaciones",JSON.stringify(lista));

        internagrupo.llenarListaPendientes();

    }

    this.setZonaSegura = function(id,lat,lng){
        this.grupo.zonasegura_id = id;
        this.grupo.latitud = lat;
        this.grupo.longitud = lng;
    }

    this.setNotificaciones = function(lista){
        this.notificaciones = lista;
       

        if(lista!=null)  window.localStorage.setItem("notificaciones",JSON.stringify(lista));
        else window.localStorage.setItem("notificaciones",null);
        header.mostrarNotificaciones();
        invitaciones.llenarLista();
    }

    this.cerrarSesion = function(){
       
        window.localStorage.removeItem("usuario");
        window.localStorage.removeItem("grupo");
        window.localStorage.removeItem("invitaciones");
        location.reload();
    }
    
}
function checkGeoPermisos(status) {
  if(!status.hasPermission) {
    var errorCallback = function() {
      
      new Alerta("Debes permitirnos acceder a tu ubicación para poder usar la aplicación");
    }
 
    geopermisos.requestPermission(function(status) {
      if( !status.hasPermission ){
        errorCallback();
      }else{
        console.log("permiso aceptado");

       // new Alerta("Gracias");
      }
    }, errorCallback, geopermisos.ACCESS_FINE_LOCATION);
  }else{

    //new Alerta("Gracias");
    console.log("permiso aceptado");
  }
}