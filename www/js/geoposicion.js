var geoint;

var Geoposicion = function(){




    this.iniciar = function(){
        /*console.log(">> Inicia el timer de posición FRONT");
        this.accion();
        geoint = setInterval(geoposicion.accion,60*1000*5);*/


        if(usuario.grupo!=undefined && usuario.grupo!=null){
            var callbackFn = function(location) {
                //console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
                if(backtimer!=null) clearInterval(backtimer);

                var posicion = location.latitude+","+location.longitude;
                console.log(">> Enviando posicion desde background: "+posicion);
                posicion = enc.encriptar(posicion,usuario.grupo.llave);



                socket.emit("algrupo",{ac:"posicion",grupo:usuario.grupo.llave,id:usuario.id,posicion:posicion,de:"back"});

                
                backgroundGeoLocation.finish();

                backtimer = setInterval(function(){
                    navigator.geolocation.getCurrentPosition(function(pos){
                            tempos = pos;
                    });
                },5000);

            };

            var failureFn = function(error) {
                console.log('BackgroundGeoLocation error');
            };



            backtimer = setInterval(function(){
                navigator.geolocation.getCurrentPosition(function(pos){
                        tempos = pos;
                });
            },5000);

            sendtimer = setInterval(function(){
                var posicion = tempos.coords.latitude+","+tempos.coords.longitude;
                console.log(">> Enviando posicion desde background timer: "+posicion);
                posicion = enc.encriptar(posicion,usuario.grupo.llave);

                socket.emit("algrupo",{ac:"posicion",grupo:usuario.grupo.llave,id:usuario.id,posicion:posicion,de:"backtimer"});
            },1000*60*5);

            // BackgroundGeoLocation is highly configurable. See platform specific configuration options
            backgroundGeoLocation.configure(callbackFn, failureFn, {
                desiredAccuracy: 10,
                stationaryRadius: 20,
                activityType: 'Other', 
                distanceFilter: 30,
                debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
                stopOnTerminate: false, // <-- enable this to clear background location settings when the app terminates
            });

            // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
            backgroundGeoLocation.start();
        }
        

        

    }

    this.accion = function(){
      
            if(usuario.grupo!=undefined && usuario.grupo!=null){
               
                navigator.geolocation.getCurrentPosition(function(pos){
                   
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