var Recuperar = function(){
	this.dom = $("#recuperar");

	new Boton($("#recuperar .btn.atras"),function(){
		getContent({page:"home"},false);
	});

	new Boton($("#recuperar .bt.enviar"),function(){
		var em = $("#recuperar input[name=email]").val();

		if(validarEmail(em)){
			new Request("usuario/recuperarclave",{
				email:em
			},function(res){
				if(res.res=="ok"){
					new Alerta("Hola "+res.nombre+", se envió un email a "+em+" con las instrucciones para recuperar tu contraseña","OK",function(){
						getContent({page:"home"},false);
					});
				}else{
					new Alerta("El email ingresado no se encuentra registrado");
				}
			},{
				espera:""
			});
		}else{
			new Alerta("Debes ingresar un email válido");
		}
	})



	this.mostrar = function(){

		$("#recuperar input[name=email]").val("");

		header.mostrar("back");

		Recuperar.prototype.mostrar.call(this);
	}

	var validarEmail = function(email) {
		var ret = true;
	    var expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	    if (!expr.test(email)) ret = false;
	    return ret;
	}
}
Recuperar.prototype = new Seccion();