var Config = function(){
	this.dom = $("#config");
	this.error = false;
	
	var validarLleno = function(campo){

		var input = $("#config input[name="+campo+"]");
		input.removeClass("required");
		if(input.val()==""){
			input.addClass("required");
			registro.error = true;
		}
		return input.val();
	}

	var validarEmail = function(email) {
		var ret = true;
	    var expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	    if (!expr.test(email)) ret = false;
	    return ret;
	}

	var validarSiNumero = function(numero){
		var ret = true;
	    if (!/^([0-9])*$/.test(numero)) ret = false;
	    return ret;
	}

	new Boton($("#config .bt.guardar"),function(){
		config.error = false;

		var nom = validarLleno("nombres");
		var ape = validarLleno("apellidos");
		var tel = validarLleno("telefono");
		var em = validarLleno("email");
		var cla = validarLleno("clave");
		var recla = validarLleno("reclave");

		if(!config.error){
			

			if(!validarEmail(em)){
				msg = "Debe ingresar una dirección de email válida";
				config.error = true;
				campo="email";
			}

			if(!validarSiNumero(tel) || tel.substr(0,1)!="9" || tel.length!=9){
				msg = "Deben ingresar un número de celular válido";
				config.error = true;
				campo="telefono";
			}

			if(config.error){
				new Alerta(msg);
				$("#config input[name="+campo+"]").addClass("required");
			}else{

				

				new Request("usuario/actualizarinfo",{
					nombres:nom,
					apellidos:ape,
					email:em,
					telefono:tel,
					llave:usuario.llave
				},function(res){
					
					if(res.error){
						new Alerta(res.msg);
					}else{

						new Alerta("Los datos se actualizaron con éxito");

						if(usuario.grupo!=null){
							new Request("grupo/listarmiembros",{
			                    llave:usuario.grupo.llave
			                },function(lista){
			                    usuario.setMiembros(lista);
			                })
							usuario.nombres = nom;
							usuario.apellidos = ape;
							usuario.telefono = tel;
							usuario.email = em;
						}
						
					}

				},{
					espera:""
				})

			}
		
		}
	})
	
	this.mostrar = function(){
		header.mostrar("back");
		$("#config input[name=nombres]").val(usuario.nombres);
		$("#config input[name=apellidos]").val(usuario.apellidos);
		$("#config input[name=telefono]").val(usuario.telefono);
		$("#config input[name=email]").val(usuario.email);

		Config.prototype.mostrar.call(this);
	}
}
Config.prototype = new Seccion();