var geoint;

var Geoposicion = function(){




    this.iniciar = function(){
        console.log(">> Inicia el timer de posición FRONT");
        this.accion();
        geoint = setInterval(geoposicion.accion,60*1000*5);

        

    }

    this.accion = function(){
        //console.log("usuario grupo:");
        //console.log(usuario.grupo);
            //console.log("aca 1");
            if(usuario.grupo!=undefined && usuario.grupo!=null){
                //console.log("aca 2");
                navigator.geolocation.getCurrentPosition(function(pos){
                    //console.log("accion pos: ");
                    //console.log(pos);
                    if(usuario.grupo!=undefined && usuario.grupo!=null){
                        var posicion = pos.coords.latitude+","+pos.coords.longitude;
                        console.log(">> Enviando posicion desde front: "+posicion);
                            posicion = enc.encriptar(posicion,usuario.grupo.llave);
      
                        var data = {ac:"posicion",grupo:usuario.grupo.llave,id:usuario.id,posicion:posicion,de:"front"};
                        
                       
                        socket.emit("algrupo",data);
                    }

                },function(error){
                   console.log('code: '    + error.code    + '\n' +
                                'message: ' + error.message + '\n');
                });
            }
    }

}