var production = true;
var pathapi;
var login;
var usuario;
var seccion = "home";
var facebook;
var ubicacion;
var grupos;
var header;
var internagrupo;
var contactos;
var invitaciones;
var registro;
var menu;
var sobre;
var instrucciones;
var bd;
var recuperar;
var config;
var clave;

var geopermisos;

var appkey = "miclave";

var socket;

var flaglogin=false;

var w; //ancho de pantalla
var h; //alto de pantalla

var terremoto = false;

var version = "1.0.1";

if(production){

    pathapi = "http://picnic.pe/clientes/lifesignal/api3/";
}else{
  
    pathapi = "http://localhost/lifesignal/api2/";
   
}

var home;
var usuario;
var initTime=1000;

var online =false;

var flaginit=false;


var permisodered;

var app = {
    
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        if(production){
            document.addEventListener('deviceready', this.onDeviceReady, false);
            document.addEventListener("resume", this.onDeviceResume);
            document.addEventListener("pause",this.onDevicePause);
            document.addEventListener("offline", function(){
               // consolelog("offline");
                online=false;   
               
                
            }, false);
            document.addEventListener("online",function(){
                //consolelog("online");
                online=true;
                
            })
        }else{
            online=true;
            $(document).ready(this.onDeviceReady);
        }
    },
    
    onDeviceResume: function(){
        consolelog("resume");
       
        //alert("resume");
        //alert(1);
        //backgroundGeoLocation.stop()
        
        //comprobarVersion();
        
    },
    onDevicePause:function(){


        /*
        var callbackFn = function(location) {
            consolelog('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);

            socket.emit('enviarposicion',{
                id:usuario.id,
                lat:location.latitude,
                lon:location.longitude,
                from:'background'
            });
            backgroundGeoLocation.finish();


        };

        var failureFn = function(error) {
            consolelog('BackgroundGeoLocation error');
        };

        // BackgroundGeoLocation is highly configurable. See platform specific configuration options
        backgroundGeoLocation.configure(callbackFn, failureFn, {
            desiredAccuracy: 10,
            stationaryRadius: 20,
            distanceFilter: 30,
            debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
            stopOnTerminate: false, // <-- enable this to clear background location settings when the app terminates
        });

        // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
        backgroundGeoLocation.start();
        */
    },

    onDeviceReady: function() {
        w = $(window).innerWidth();
        h = $(window).innerHeight();

        

        new Boton($("#contacto .cerrar"),function(){
            $("#contacto").hide();
        });

        
        comprobarVersion();
        /*
        var push = PushNotification.init({
            android: {
                senderID: "1029590604378"
            },
            ios: {
                alert: "true",
                badge: "true",
                sound: "true"
            }
        });

        push.on('registration', function(data) {
            // data.registrationId
            consolelog(data);
        });

        push.on('notification', function(data) {
            consolelog(data);
            // data.message,
            // data.title,
            // data.count,
            // data.sound,
            // data.image,
            // data.additionalData
        });

        push.on('error', function(e) {
            consolelog(e);
            // e.message
        });
    
        */
        consolelog("device ready");

        
        header = new Header();
        header.setButton("back",function(){
            history.back();
        })

        
        if(window.localStorage.getItem("usuario")==null){
            window.localStorage.clear();
            consolelog("no sesion");
           
            
            home = new Home();
            
            registro = new Registro();
            recuperar = new Recuperar();

            facebook = new Facebook();

            if(!production){
                setTimeout(function(){
                    facebook.init();
                    home.mostrar();
                },2000);
                initTime = 2000;
            }else{
                home.mostrar();
            }



        }else{
            consolelog("sesion activa");
            usuario = new Usuario();

            var data = {
                info: JSON.parse(window.localStorage.getItem("usuario")),
                grupo: JSON.parse(window.localStorage.getItem("grupo")),
                invitaciones: JSON.parse(window.localStorage.getItem("invitaciones")),
                notificaciones: JSON.parse(window.localStorage.getItem("notificaciones")),
                miembros: JSON.parse(window.localStorage.getItem("miembros"))
            }
            
           

            new Request("usuario/info",{
                key:data.info.llave
            },function(res){
                data = res;
                usuario.iniciar(data);    
            },{
                error:function(){
                    usuario.iniciar(data);
                }
            })

           
        }

        
        
       
        //login = new Login();
        
        
        

        
    }
};




function comprobarVersion(){
    
    $.ajax({
        url:pathapi+"sistema/version",
        dataType:"json",
        data:{
            version:version,
            platform:"ios"
        },
        type:'get',
        success:function(res){
            
            if(res["res"]=="menor"){
                new Alerta(res["msg"],res["btn"],function(){
                    window.open(res["link"],"_system");
                    $("#alerta").show();
                },res["noclose"])
            }
        }
        
    });
    
}

var Boton = function(dom,callback){
    var flagtouch=false;
    dom.unbind();
    if(production){
        dom.on({
            "touchstart":function(){
                flagtouch=true;
                $(this).addClass("over");
            },
            "touchmove":function(){

                flagtouch=false;
            },
            "touchend":function(){
                if(flagtouch){
                   

                    callback($(this));
                }
                 $(this).removeClass("over");

            }
        });
       

    }else{
        dom.bind({
            "mousedown":function(){
                $(this).addClass("over");
            },
            "mouseup":function(){
                $(this).removeClass("over");
                callback($(this));
            }
        });
    }

};






var Request = function(ac,params,callback,options){
    var msg;

    if(options!=undefined && options.espera!=undefined){

        msg = options.espera;
        new Espera(msg);
    }

    

    $.ajax({
        url:pathapi+ac,
        dataType:"json",
        data:params,
        type:'get',
        cache:false,
        timeout:20*1000,
        success:function(res){
            //consolelog(res);
           // es.fin();
            callback(res);
             $("#espera").hide();
        },
        error: function(x, t, m) {
            
           // consolelog(x);
            //consolelog(t);
            //consolelog(m);

            //es.fin();

            $("#espera").hide();

           
            if(options!=undefined){
                if(options.error!=undefined){
                    options.error();
                }else{
                     new Alerta("Estás usando la aplicación en modo offline.<br>Algunas funciones no están disponibles.");
                }
            }
        }
    });
}


window.onpopstate = function(event) {

   
    getContent(event.state,false);
   

    

};


function getContent(obj,addEntry){
    
    if(obj!=null){

        var antseccion = seccion;
        seccion=obj.page;


        try{
            window[antseccion].ocultar();    
        }catch(e){
            consolelog(e);
        }
      
        switch(seccion){

            case "internagrupo":
                try{
                    internagrupo.mostrar(obj.grupo,obj.nombre);
                }catch(e){
                    //console.log(e);
                     navigator.app.exitApp();
                }
                
                break;
            default:
            try{
                window[seccion].mostrar();
            }catch(e){
                //console.log(e);
                navigator.app.exitApp();
            }

           
        }

        



        if(addEntry == true) {
            history.pushState(obj,null); 
        }
    }else{
        
        if(flaglogin==false){
            getContent({page:"home"},false);    
        }else{
            navigator.app.exitApp();
        }
        
    }
   


    

   

    
    


}

var Seccion = function(){

    this.mostrar = function(){
        this.dom.css('display',"block");
        this.dom.transition({opacity:0},0);
        this.dom.transition({opacity:1});

        //header.setTitulo(this.titulo);

        //this.dom.show();
    }

    this.ocultar = function(){
        this.dom.hide();
    }
}


var Espera = function(msg,callback){

    $("#espera .txt").html(msg);
    $("#espera").show();
    this.fin = function(){
        $("#espera .txt").html("");
        $("#espera").hide();
    }

    this.txt = function(val){
        $("#espera .txt").html(val);
    }
}


var Alerta = function(msg,btn,callback,noclose){

    if(noclose!=undefined && noclose==true){
        $("#alerta .cerrar").hide();
    }else{
        $("#alerta .cerrar").show();
    }

    $("#alerta .txt").html(msg);

    if(btn!=undefined){
        $("#alerta .bt").html(btn);
    }else{
        $("#alerta .bt").html("OK");
    }


    //$("#cubre").show();
    //$("#alerta").show();

    
    $("#cubre").show();
    $("#cubre").transition({opacity:0},0);
    $("#cubre").transition({opacity:1,complete:function(){
        //$("#cubre").show();
    }});

    $("#alerta").show();
    $("#alerta").transition({opacity:0},0);
    

    var vh = $("#alerta").outerHeight();

    //$("#alerta").css("top",(h-vh)/2);

    $("#alerta").transition({opacity:1,complete:function(){
       // $("#alerta").show();
    }});

    $("#alerta .bt.ok").unbind();

    new Boton($("#alerta .cerrar"),function(){
        $("#alerta").hide();
        $("#cubre").hide();

    });

    $("#alerta .bt.ok").unbind();
    new Boton($("#alerta .bt.ok"),function(){
        $("#alerta").hide();
        $("#cubre").hide();
        if(callback!=undefined){
            
            callback();
        }
    });
}



function consolelog(msg){
    if(!production){
        console.log(msg);
    }
}