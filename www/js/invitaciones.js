var Invitaciones = function(){
	this.dom = $("#invitaciones");
	

	this.mostrar = function(){
		
		header.mostrar("back");

		Invitaciones.prototype.mostrar.call(this);
	}

	this.listar = function(){
		$("#invitaciones .lista").empty();

		var lista = usuario.notificaciones;
		
		$.each(lista,function(key,val){
			var it =  new ItemInvitacion(val);
			$("#invitaciones .lista").append(it.html);
		})
		
	}
	this.llenarLista = function(){
		$("#invitaciones .lista").empty();
		if(usuario.notificaciones!=null){
			$.each(usuario.notificaciones,function(key,val){
				var it =  new ItemInvitacion(val);
				$("#invitaciones .lista").append(it.html);
			})
		}else{
			$("#invitaciones .lista").html('<div class="nohay">No tienes ninguna invitación pendiente.</div>');
		}
	}
	
}

Invitaciones.prototype = new Seccion();

var ItemInvitacion = function(d){
	console.log(d);
	this.html = $(lib.ItemInvitacion);
	
	this.html.find(".usuario").html(d.nombres+" "+d.apellidos);

	if(d.pic!=null){
		this.html.find('.pic').css("background-image","url('"+d.pic+"')");
	}

	new Boton(this.html.find(".bt.aceptar"),function(e){
		var msg="¿Deseas aceptar la invitación de "+d.nombres+"?";

		if(usuario.grupo!=null){
			msg+= "<br>Dejarás de pertenecer al grupo actual.";
			if(usuario.admin==true){
				msg+="<br>(La administración del grupo pasará a alguien más)";
			}
		}
		new Alerta(msg,"Aceptar",function(){
			var antgrupo = null;
			if(usuario.grupo!=null) antgrupo = usuario.grupo.id;
			new Espera("");
			new Request("grupo/aceptarinvitacion",{
				tel:usuario.telefono,
				grupo:d.grupo_id,
				antgrupo:antgrupo,
				admin:usuario.admin
			},function(res){

				if(antgrupo!=null){
					socket.emit("leave",usuario.grupo.llave);
				}

				usuario.admin = false;

				if(usuario.miembros!=null){
					$.each(usuario.miembros,function(k,v){
						if(v.id!=usuario.id){
							socket.emit("directo",{ac:"abandonagrupo",id:v.id});	
						}
						
					})
				}
				

				new Request("usuario/buscarinvitaciones",{
	                llave:usuario.llave
	            },function(resp){
	                if(resp.length>0){
	                    usuario.setNotificaciones(resp);
	                }else{
	                    usuario.setNotificaciones(null);
	                }

	                usuario.setGrupo(res.grupo);

	                socket.emit("join",usuario.grupo.llave);

					usuario.setMiembros(res.miembros);
					usuario.setInvitaciones(res.invitaciones);
					console.log("-------miembros------");
					console.log(usuario.miembros);
					$.each(usuario.miembros,function(k,v){
						if(v.id!=usuario.id){
							socket.emit("directo",{ac:"invitacionaceptada",id:v.id});	
						}
					})
					
					$("#espera").hide();

					getContent({page:"internagrupo"},true);
	                
	            })


				

			});

		})

		

	});
	new Boton(this.html.find(".bt.rechazar"),function(e){
		new Espera("");
		new Request("grupo/rechazarinvitacion",{
			id:usuario.id,
			grupo:d.grupo_id
		},function(response){

			new Request("usuario/buscarinvitaciones",{
                llave:usuario.llave
            },function(res){
                if(res.length>0){
                    usuario.setNotificaciones(res);
                }else{
                    usuario.setNotificaciones(null);
                }
                $("#espera").hide();
            })
           

			$.each(response.miembros,function(k,v){
				socket.emit("directo",{ac:"invitacionrechazada",id:v.id});
			})
			
		});

	});
}