var permissions;
var Header = function(){

	new Boton($("#header .btn.menu"),function(){
		getContent({page:"menu"},true);
	});

	this.mostrar = function(botones,titulo){
		$("#header").show();
		$("#header .btn").hide();
		if(botones!=undefined){
			var btns = botones.split(",");
			$.each(btns,function(k,v){
				$("#header .btn."+v).show();
			})
		}
		if(titulo!=undefined){
			$("#header .titulo").html(titulo);
			$("#header").addClass("nologo");
		}else{
			$("#header .titulo").html("");
			$("#header").removeClass("nologo");
		}
		

	}

	this.setButton = function(nom,callback){
		$("#header .btn."+nom).unbind();
		new Boton($("#header .btn."+nom),callback);
	}

	


	this.mostrarNotificaciones = function(){
		consolelog("notificaciones---");
		consolelog(usuario.notificaciones);
		var cant = 0;
		if(usuario.notificaciones!=null) cant = usuario.notificaciones.length;
		if(cant>0){
			$("#header .btn.menu .inv").html(cant);
			
			$("#header .btn.menu .inv").show();
		}else{
			$("#header .btn.menu .inv").hide();
		}
	}

	new Boton($("#header .logout"),function(){
		usuario.cerrarSesion();
	});

	new Boton($("#header .invitations"),function(){
		getContent({page:"invitaciones"},true);
	});
	
	new Boton($("#header .ubicaciones"),function(){
		getContent({page:"ubicacion"},true);
	});

	new Boton($("#header .listaopciones .base"),function(){
		$("#header .listaopciones").hide();
		$("#header .opciones").removeClass('ac');
	});

	$("#header .listaopciones").css("height",h-50);

	new Boton($("#header .listaopciones .item.abandonar"),function(){
		$("#header .listaopciones").hide();
		internagrupo.abandonar();
		$("#header .opciones").removeClass('ac');
	});

	new Boton($("#header .opciones"),function(e){
		e.addClass("ac");
		$("#header .listaopciones").show();
	})

	new Boton($("#header .btn.add"),function(){

		

		grupos.crear();

		

	});

	new Boton($("#header .btn.addcontact"),function(){
		var totinv=0;
		var totmie=0;
		if(usuario.invitaciones!=null) totinv = usuario.invitaciones.length;
		if(usuario.miembros!=null) totmie = usuario.miembros.length;
		
		var total = totinv + totmie;
		consolelog("total: "+total);
		consolelog(usuario.invitaciones);
		consolelog(usuario.miembros);
		if(total<10){

			//getContent({page:"contactos"},true);
			/*if(production){
				consolelog("aca");
				

				permissions = window.plugins.permissions;
				permissions.hasPermission(checkPermissionCallback, null, permissions.READ_CONTACTS);
				 
				

				consolelog("hola");


				
				//listarContactos();
				
							
			}else{
				listarContactos();
				
			}*/
			listarContactos();
		}else{
			new Alerta("El grupo solo puede tener 10 miembros como máximo");
		}
	});


	
}

function checkPermissionCallback(status) {
  if(!status.hasPermission) {
    var errorCallback = function() {
      
      new Alerta("Para poder agregar a tus contactos a tu grupo debes aceptar los permisos")
    }
 
    permissions.requestPermission(function(status) {
      if( !status.hasPermission ){
      	errorCallback();
      }else{
      	consolelog("permiso aceptado");

    	listarContactos();
      }
    }, errorCallback, permissions.READ_CONTACTS);
  }else{

  	listarContactos();
  }
}

function listarContactos(){
	consolelog("listarcontactos");
	getContent({page:"contactos"},true);
	
	
}