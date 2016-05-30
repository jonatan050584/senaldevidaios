var Internagrupo = function(){
	this.dom = $("#internagrupo");
	this.titulo = "Contactos";
	this.id = null;
	this.miembros = new Array();
	this.nombre = null;
	this.admin = false;
	/*
	new Boton($("#internagrupo .btn.ubicacion"),function(){
		getContent({page:"ubicacion"},true);
	});*/
	new Boton($("#miembro .cerrar"),function(){
		$("#miembro").hide();
	});
	new Boton($("#miembro .bt.llamar"),function(e){
		window.open("tel:"+e.data("tel"), '_system');
	});
	
	new Boton($("#internagrupo .bt.crear"),function(){
		//getContent({page:"contactos"},true);
		new Request("grupo/crear",{
			admin:usuario.llave
		},function(infogrupo){
			usuario.setGrupo(infogrupo);
			usuario.admin = true;
			var miembros = new Array();
			miembros.push({
				id:usuario.id,
				nombres:usuario.nombres,
				apellidos:usuario.apellidos,
				telefono:usuario.telefono,
				pic:usuario.pic,
				admin:1
			});
			usuario.setMiembros(miembros);

			internagrupo.mostrar();
		},{
			espera:""
		})
	})

	this.abandonar = function(){
		

		var msg;
		if(usuario.admin){
			msg = "Eres administrador de este grupo. Si lo abandonas el grupo seguirá existiendo y se nombrará un administrador al azar.";
		}else{
			msg = "¿Deseas abandonar este grupo?"
		}
		new Alerta(msg,"Abandonar",function(){
			
			new Request("grupo/abandonar",{
				llave:usuario.llave,
				admin:usuario.admin
			},function(res){

				if(usuario.miembros!=null){
					$.each(usuario.miembros,function(k,v){
						if(v.id!=usuario.id){
							socket.emit("directo",{ac:"abandonagrupo",id:v.id});
						}
						
						
					})
				};
				
				if(usuario.admin==true && usuario.invitaciones!=null){
					$.each(usuario.invitaciones,function(k,v){
						socket.emit("directo",{ac:"invitacion",id:v.id});

					})
				}
				
				usuario.setGrupo(null);
				usuario.setMiembros(null);
				usuario.admin = false;
				usuario.setInvitaciones(null);




				internagrupo.mostrar();
				

			},{
				espera:""
			})
		});

	}
	
	

	this.mostrar = function(){
		
		

		if(usuario.grupo==null){ //no tiene grupo
			header.mostrar("menu","");
			$("#internagrupo").addClass("singrupo");
		}else{ //si tiene grupo
			
			

			
			if(usuario.admin){
				header.mostrar("menu,addcontact,ubicaciones,opciones","");
			}else{
				header.mostrar("menu,ubicaciones,opciones","");
			}

			
			
			$("#internagrupo").removeClass("singrupo");
			
		}

		Internagrupo.prototype.mostrar.call(this);

	}

	

	this.llenarListaMiembros = function(){
		consolelog("llenarlistamiembros");
		consolelog(usuario.miembros);
		$("#internagrupo .lista .miembros").empty();
		
		if(usuario.miembros!=null){

			$.each(usuario.miembros,function(key,val){

				if(val.id==usuario.id && val.admin==1){
					//alert("Soy el nuevo admin");
					usuario.admin=true;
				}

				
				var it = new ItemMiembro(val);
				$("#internagrupo .lista .miembros").append(it.html);
			})	
		}
	}
	this.llenarListaPendientes = function(){
		$("#internagrupo .lista .pendientes").empty();
		if(usuario.invitaciones!=null){
			$.each(usuario.invitaciones,function(key,val){
				var it = new ItemMiembro(val,"pendiente");
				$("#internagrupo .lista .pendientes").append(it.html);
			})	
		}
	}


}
Internagrupo.prototype = new Seccion();

var ItemMiembro = function(d,estado){
	//internagrupo.miembros.push(d);
	

	var nombres = d.nombres+' '+d.apellidos;
	var telefono = d.telefono;
	if(d.invitado==null && estado=="pendiente"){
		nombres = d.inombres;
		telefono = d.itelefono;
	}
	
	this.html = $(lib.ItemMiembro);
	if(estado!=undefined) this.html.addClass(estado);
	this.html.find('.nom').html(nombres);
	

	if(d.pic!=null){
		this.html.find('.pic').css("background-image","url('"+d.pic+"')");
	}
	if(d.admin==1){
		this.html.addClass("ad");
	}


	//
	
	new Boton(this.html,function(){

		if(d.id!=usuario.id){
			if(d.pic == null) d.pic = "img/user.png";

			$("#miembro .pic").attr("src",d.pic);
			$("#miembro .nombres").html(nombres);
			$("#miembro .telefono").html(telefono);
			$("#miembro .bt.llamar").attr("data-tel","+51"+telefono);

			$("#miembro").show();
		    $("#miembro").transition({opacity:0},0);
		    $("#miembro").transition({opacity:1});

		  
		    if(usuario.admin==true){
		    	$("#miembro .eliminar").show();
		    	new Boton($("#miembro .eliminar"),function(){
		    		$("#miembro").hide();
		    		var msg = "¿Deseas eliminar a "+nombres+" de tu Grupo de Seguridad?";
		    		if(estado=="pendiente"){
		    			msg = "¿Deseas eliminar la invitación a "+nombres+"?";
		    		}
		    		new Alerta(msg,"Eliminar",function(){
		    			new Espera("");
		    			new Request("grupo/eliminarmiembro",{
		    				llave:usuario.llave,
		    				telefono:telefono
		    			},function(res){
		    				if(res.res=="ok"){

		    					if(estado!=undefined && estado=="pendiente"){
			    					new Request("grupo/listarpendientes",{
				                        llave:usuario.grupo.llave
				                    },function(lista){
				                        usuario.setInvitaciones(lista);
				                        $("#espera").hide();
				                    });

				                    $.each(usuario.miembros,function(k,v){
				                    	if(v.id!=usuario.id){
				                    		socket.emit("directo",{ac:"invitacioneliminada",id:v.id});
				                    	}
			    					});

			    					if(d.invitado!=null){
				                    	socket.emit("directo",{ac:"notificacioneliminada",id:d.invitado});
				                    }

		    					}else{
		    						new Request("grupo/listarmiembros",{
				                        llave:usuario.grupo.llave
				                    },function(lista){
				                        usuario.setMiembros(lista);
				                        $("#espera").hide();
				                    });

				                    $.each(usuario.miembros,function(k,v){
				                    	if(v.id!=usuario.id){
				                    		socket.emit("directo",{ac:"miembroeliminado",id:v.id});
				                    	}
			    					});

			    					socket.emit("directo",{ac:"membresiaeliminada",id:d.id});
				                    
		    					}

			                   

			                    

			                    


								
		    				}else{
		    					new Alerta("Ocurrió algún error. Inténtelo de nuevo más tarde");
		    				}
		    			})
		    		})

		    	});
		    }else{
		    	$("#miembro .eliminar").hide();
		    }

		    

		}
	});
	


}