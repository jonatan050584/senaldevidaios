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
var geoposicion;

var geopermisos;
var enc = new Enc();

var appkey = "miclave";

var socket;

var flaglogin=false;

var w; //ancho de pantalla
var h; //alto de pantalla

var terremoto = false;

var version = "1.0.6";
var so = "ios";

var backtimer;
var sendtimer;

var tempos;

if(production){

    pathapi = "http://picnic.pe/clientes/lifesignal/api4/";
    //pathapi = "http://192.168.0.11/lifesignal/api2/";
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
               // console.log("offline");
                online=false;   
               
                
            }, false);
            document.addEventListener("online",function(){
                //console.log("online");
                online=true;
                
            })
        }else{
            online=true;
            $(document).ready(this.onDeviceReady);
        }
    },
    
    onDeviceResume: function(){
        console.log("resume");
       
        //alert("resume");
        //alert(1);
        if(usuario!=undefined && usuario.grupo!=undefined && usuario.grupo!=null){
            //backgroundGeoLocation.stop();
            //clearInterval(backtimer);
        }
        //comprobarVersion();

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



        
    },
    onDevicePause:function(){


        
        
    },

    onDeviceReady: function() {
        w = $(window).innerWidth();
        h = $(window).innerHeight();

        

        new Boton($("#contacto .cerrar"),function(){
            $("#contacto").hide();
        });

        
        comprobarVersion();
        
        console.log("device ready");

        
        header = new Header();
        header.setButton("back",function(){
            history.back();
        })

        
        if(window.localStorage.getItem("usuario")==null){
            window.localStorage.clear();
            console.log("no sesion");
           
            
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
            console.log("sesion activa");
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
            platform:"android"
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
            //console.log(res);
           // es.fin();
            callback(res);
             $("#espera").hide();
        },
        error: function(x, t, m) {
            
           // console.log(x);
            //console.log(t);
            //console.log(m);

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
            console.log(e);
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



