var geoint;

var Geoposicion = function(){




    this.iniciar = function(){

        geoint = setInterval(function(){
        	console.log("--interval--")
            navigator.geolocation.getCurrentPosition(function(pos){
                var posicion = pos.coords.latitude+","+pos.coords.longitude;

                posicion = enc.encriptar(posicion,usuario.grupo.llave);

                socket.emit("algrupo",{ac:"posicion",grupo:usuario.grupo.llave,id:usuario.id,posicion:posicion,de:"front"});

            });
        },60*1000);

        

    }

}