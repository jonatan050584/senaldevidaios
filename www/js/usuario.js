var Usuario = function(){
    this.grupo = null
    this.invitaciones = null;
    this.admin = false;
    this.flag=false;

    this.iniciar = function(data){
        consolelog("data----");
        consolelog(data);
        $("#marker").show();
        
        var info = data.info;

        this.id = info.id;
        this.nombres = info.nombres;
        this.apellidos = info.apellidos;
        this.email = info.email;
        this.telefono = info.telefono;
        this.llave = info.llave;
        this.fbid = info.fbid;
        this.pic = info.pic;
        this.marker = 'img/markeruser.png';

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


        /*if(production){
            geopermisos = window.plugins.permissions;
            geopermisos.hasPermission(checkGeoPermisos, null, geopermisos.ACCESS_FINE_LOCATION);
        }*/

        flaglogin=true;


        

        if(production) socket = io.connect('http://picnic.pe:8883');
        else socket = io.connect('http://picnic.pe:8883');

        socket.on("connect", function() {


            consolelog("usuario conectado al servidor");

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
                })

                
            }

            usuario.flag=true;

            
            
            socket.emit('check in',{id:usuario.id});

            /*var opciones = {
                maximumAge: 15000,
                enableHighAccuracy:true,

            };
            navigator.geolocation.watchPosition(function(position){
                
                socket.emit('enviarposicion',{
                    id:usuario.id,
                    lat:position.coords.latitude,
                    lon:position.coords.longitude,
                    from:'foreground'
                });

            },function(e){
                consolelog('error watchposition: '+e);
            },opciones);*/


            
        });

        socket.on("directo",function(data){
            consolelog("socket");
            consolelog(data);
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
            }
            
        })

        /*socket.on("posicion",function(data){
            consolelog(data);
            ubicacion.onPosiciones(data);
        });
        socket.on("mensaje",function(data){
            consolelog(data);
        });

        
        socket.on("estadoterremoto",function(valor){
            terremoto=valor;
            if(valor){
                new Alerta("Terremoto de 7.6<br>Epicentro: Cañete<br>¡Ubica a tus contactos ahora!");
                $("#internagrupo .btn.ubicacion").show();
                $("#internagrupo").css("padding-top",85);
            }
        });

        socket.on("hayterremoto",function(){
            terremoto=true;
            new Alerta("Terremoto de 7.6 - Epicentro Cañete<br>¡Ubica a tus contactos ahora!");
            $("#internagrupo .btn.ubicacion").show();
             $("#internagrupo").css("padding-top",85);
        });



        socket.on("acaboterremoto",function(){
            terremoto=false;
            consolelog("acabo");
            $("#internagrupo .btn.ubicacion").hide();
            $("#internagrupo").css("padding-top",50);
            if(seccion=="ubicacion"){
                getContent({page:"grupos"},false);
            }
        });

        socket.on("enviarinvitacion",function(invitado){
            if(usuario.id == invitado){
                header.cargarInvitaciones();
            }
        });

        socket.on('aceptarinvitacion',function(data){
            if(data.usuario==usuario.id){
                grupos.listar();    
            }
            if(seccion=="internagrupo" && internagrupo.id == data.grupo){
                internagrupo.listarcontactos(data.grupo);
            }
        });
        socket.on("mensaje",function(data){
            
        });
        */


        
        
        internagrupo = new Internagrupo();
        ubicacion = new Ubicacion();
        contactos = new Contactos();
        invitaciones = new Invitaciones();
        sobre = new Sobre();
        instrucciones = new Instrucciones();
        menu =  new Menu(this.fbid);
        config = new Config();
        clave = new Clave();
        
        
        
        this.crearMarker();

    
        
       

        invitaciones.llenarLista();
        internagrupo.llenarListaMiembros();
        internagrupo.llenarListaPendientes();
       
        getContent({page:"instrucciones"},false);

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
/*function checkGeoPermisos(status) {
  if(!status.hasPermission) {
    var errorCallback = function() {
      
      new Alerta("Debes permitirnos acceder a tu ubicación para poder usar la aplicación");
    }
 
    geopermisos.requestPermission(function(status) {
      if( !status.hasPermission ){
        errorCallback();
      }else{
        consolelog("permiso aceptado");

       // new Alerta("Gracias");
      }
    }, errorCallback, geopermisos.ACCESS_FINE_LOCATION);
  }else{

    //new Alerta("Gracias");
    consolelog("permiso aceptado");
  }
}*/