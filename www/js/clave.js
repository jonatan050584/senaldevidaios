var Clave = function(){
	this.dom = $("#clave");
	this.error = false;
	
	var validarLleno = function(campo){

		var input = $("#clave input[name="+campo+"]");
		input.removeClass("required");
		if(input.val()==""){
			input.addClass("required");
			clave.error = true;
		}
		return input.val();
	}

	

	new Boton($("#clave .bt.cambiar"),function(){
		clave.error = false;

		var ant = validarLleno("anterior");
		var cla = validarLleno("clave");
		var cla2 = validarLleno("clave2");

		

		if(!clave.error){
			if(cla.length<8){
				new Alerta("La contraseña debe tener 8 caractéres como mínimo");
				clave.error=true;
			}else{
				if(cla!=cla2){
					new Alerta("Las claves no coinciden");
					$("#clave input[name=clave]").addClass("required");
					$("#clave input[name=clave2]").addClass("required");
				}else{

					new Request("usuario/cambiarclave",{
						anterior:ant,
						nueva:cla,
						llave:usuario.llave
					},function(res){
						$("#clave input[name=anterior]").val("");
						$("#clave input[name=clave]").val("");
						$("#clave input[name=clave2]").val("");
						if(res.res=="ok"){
							new Alerta("La contraseña se cambió exitosamente","OK",function(){
								history.back();
							})
						}else{
							new Alerta(res.msg);
							
							
						
						}

					},{
						espera:""
					})

				}

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
Clave.prototype = new Seccion();