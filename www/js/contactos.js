var Contactos = function(){
	this.dom = $("#contactos");

	this.flag=false;

	this.lista = new Array();

	var validos = new Array();

	this.invitados = new Array();

	

	this.numeros = new Array();
	
	var timebus;

	new Boton($("#contactos .invitacion .cerrar"),function(){
		$("#contactos .invitacion").hide();
	});

	
	$("#contactos .busqueda input[name=buscar]").keyup(function(e){
		clearTimeout(timebus);
		var bus = $(this).val().toLowerCase();
		timebus = setTimeout(function(){
			
			$("#contactos .lista .item").each(function(index){
				var res=false;
				
				var num= $(this).find(".tel").html();

				if(num.substr(0,bus.length)==bus){
					res=true;
				}

				if(!res){
					var nom = $(this).find(".nom").html().toLowerCase();
					var palabra = nom.split(" ");
					
					$.each(palabra,function(k,v){
						if(v.substr(0,bus.length)==bus){
							res=true;
						}
					});
				}


				


				if(res){
					$(this).show();
				}else{
					$(this).hide();
				}

			})
		},1000);

		
	})

	this.mostrar = function(){

		this.invitados = new Array();

		header.mostrar("back",'Selecciona un contacto');

		//header.setButton("done",this.done);
		if(!this.flag){
			this.flag=true;
			this.listar();

		}
		

		Contactos.prototype.mostrar.call(this);
	}
	

	this.listar = function(){
		
		$("#contactos .lista").empty();

		

		if(production){

			var options      = new ContactFindOptions();
			options.filter   = "";
			options.multiple = true;

			var es = new Espera("Listando contactos...");
			
			navigator.contacts.find(['displayName', 'name','phoneNumbers'], this.onContacts, function(e){
				//consolelog(error);
			}, options);
		}else{

			$.ajax({
				url:'contactos.json',
				dataType:'json'
			}).done(this.onContacts);

		}

			
		

	}	

	this.onContacts = function(res){
		
		consolelog(res);

		$("#espera").hide();
		

		$.each(res,function(key,val){
			var foto=null;
			

			if(val.photos!=null){
				

				foto = val.photos[0].value;
				
			}
			


			if(val.phoneNumbers!=null && (val.displayName!=null || (val.name!=null && val.name.formatted!=""))){

				$.each(val.phoneNumbers,function(k,v){
					var tel = v.value;

					tel = tel.replace(/\D/g,'')

					tel = tel.substr(-9);
					//tel = tel.replace(/ /g,""); //elimina espacios

					if(tel.substr(0,1)=="9"){
						
						if(contactos.numeros.indexOf(tel)==-1){
							contactos.numeros.push(tel);
							var nom = val.displayName;
							if(nom==null) nom = val.name.formatted;


							var it = new ItemContacto({
								nombre: nom,
								telefono: tel,
								foto:foto,
								original:v.value
							});
							$("#contactos .lista").append(it.html);

							
						}

						

						

						
						
					}

				})

			}
		});
		$("#espera").hide();
	
	}



	
	this.validarexiste = function(tel,nombre){

		//consolelog(usuario.invitaciones);
		var es = new Espera("");
		
		var yaesta = false;
		if(usuario.invitaciones!=null){
			$.each(usuario.invitaciones,function(k,v){

				if(v.telefono == tel || v.itelefono == tel){
					yaesta=true;
				}

			});
		}
		if(usuario.miembros!=null){
			$.each(usuario.miembros,function(k,v){
				if(v.telefono == tel || v.itelefono == tel){
					yaesta=true;
				}
			});
		}
		$("#contacto .pic").attr("src","img/user.png");
		

		if(!yaesta){
			new Request("usuario/validarexiste",{
				tel:tel
			},function(res){
				es.fin();
				//$("#espera").show();
				if(res.info==null){ //el contacto no tiene cuenta
					$("#contacto .nombre").html(nombre);
					$("#contacto .numero .telefono").html(tel);
					$("#contacto .siapp").hide();
					$("#contacto .noapp").show();
					$("#contacto .noapp .nom").html(nombre);
					new Boton($("#contacto .noapp .bt.invitar"),function(){
						$("#contacto").hide();
						
						new Request("grupo/invitarmiembro",{
							tel:tel,
							nom:nombre,
							admin:usuario.llave
						},function(){
							

							var inv = usuario.invitaciones;
							if(inv==null) inv=new Array();
							inv.push({
								invitado:null,
								inombres:nombre,
								id:null,
								admin:0,
								itelefono:tel,
								pic:null
							});

							usuario.setInvitaciones(inv);


							getContent({page:"internagrupo"},true);

							

							//Notificamos a los demás miembros del grupo que se ha invitado a alguien más
							$.each(usuario.miembros,function(k,v){ 
								if(v.id!=usuario.id){
									socket.emit("directo",{ac:"nuevoinvitado",id:v.id});
								}
							});
							
						},{
							espera:""
						})

						window.plugins.socialsharing.shareViaSMS('Instala Señal de Vida en tu smartphone y mantengámonos conectados en caso de Sismo. Visita https://goo.gl/PCzl2C para descargarlo',tel,function(msg){
							
						},function(msg) {
							alert('error: ' + msg);
						});
						
					});
				}else{ //el contacto si tiene cuenta
					$("#contacto .siapp").show();
					$("#contacto .noapp").hide();
					if(res.info.pic!=null){
						$("#contacto .pic").attr("src",res.info.pic);
					}
					$("#contacto .nombre").html(res.info.nombres+" "+res.info.apellidos);
					$("#contacto .numero .telefono").html(res.info.telefono);

					new Boton($("#contacto .siapp .bt.agregar"),function(){
						$("#contacto").hide();
						
						new Request("grupo/agregarmiembro",{
							admin:usuario.llave,
							miembro:res.info.id
						},function(ret){
							
							if(ret.res=="ok"){

								var inv = usuario.invitaciones;
								if(inv==null) inv=new Array();
								inv.push({
									invitado:res.info.id,
									nombres:res.info.nombres,
									apellidos:res.info.apellidos,
									id:res.info.id,
									admin:0,
									telefono:res.info.telefono,
									pic:res.info.pic
								});

								usuario.setInvitaciones(inv);

								getContent({page:"internagrupo"},true);
								
								//Notificamos a los demás miembros del grupo que se ha invitado a alguien más
								/*$.each(usuario.miembros,function(k,v){ 
									if(v.id!=usuario.id){
										socket.emit("directo",{ac:"nuevoinvitado",id:v.id});
									}
								});*/
								socket.emit("algrupo",{grupo:usuario.grupo.llave,ac:"nuevoinvitado"});



								
								//Notificamos al invitado
								socket.emit("directo",{ac:"invitacion",id:res.info.id});
							
							}else{
								new Alerta("Ocurrió algún tipo de error. Inténtalo de nuevo más tarde.");
							}
							
							
						},{
							espera:""
						})
					});

				}

				
				setTimeout(function(){
					$("#contacto").show();


				    $("#contacto").transition({opacity:0},0);
				    
				    $("#contacto").transition({opacity:1,complete:function(){
				       // $("#alerta").show();

				    }});
				   $("#espera").transition({opacity:0,complete:function(){
			      
				       $("#espera").hide();
				       $("#espera").css("opacity",1);
				       
				    }});
				},0);
			    
				
				


			},{
				espera:"Validando..."
			})
		}else{

			
				$("#espera").transition({opacity:0,complete:function(){
				      
			       $("#espera").hide();
			       $("#espera").css("opacity",1);
			       
			    }});
				new Alerta("Ese número ya pertenece a tu grupo o está pendiente de aceptación");
			
		}
	}
	



}
Contactos.prototype = new Seccion();


var ItemContacto = function(d){
	
	this.html = $(lib.ItemContacto);

	if(d.foto!=null){
		this.html.find(".pic").css("background-image",'url("'+d.foto+'")');
	}
	//this.html.addClass("plus");
	
	this.html.find('.nom').html(d.nombre);
	this.html.find('.tel').html(d.telefono);


	
	new Boton(this.html,function(e){

		
		contactos.validarexiste(d.telefono,d.nombre);
		
		
				
				
			
	        
	        
		
			//window.plugins.socialsharing.shareViaSMS('Prueba LifeSignal para tu smartphone. Visita http://picnic.pe/lifesignal/ para descargarlo',d.original,function(msg){consolelog('ok: ' + msg);},function(msg) {alert('error: ' + msg);});
		
		
	})

	

}