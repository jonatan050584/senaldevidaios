var Home = function(){

	this.dom = $("#home");
	
	new Boton($("#home a.recuperar"),function(){
		getContent({page:"recuperar"},true);
	})

	new Boton($("#home a.signup"),function(){
		getContent({page:"registro"},true);
	});



	new Boton($("#home .login .bt.signin"),function(){
		var em = $("#home .login input[name=email]").val();
		var cl = $("#home .login input[name=clave]").val();

		if(em!="" && cl!=""){
			
			new Request("usuario/login",{
				email:em,
				clave:cl
			},function(res){
				if(res.res=="ok"){
					
					usuario = new Usuario();
                    usuario.iniciar(res);
                    

				}else if(res.res == "error"){
					new Alerta("El email o clave son incorrectos");					
				}
			},{
				espera:"Validando..."
			})
		}
	});


	new Boton($("#home .login .bt.fb"),function(){
		var es = new Espera("");
		facebook.login(function(conectado){
			consolelog("login fb:"+conectado);
			if(conectado){	
				es.txt("Obteniendo información del perfil de Facebook...")
				facebook.myInfo(function(infofb){
                    consolelog(infofb);
                    
					  
                    
                    
	                    new Request("usuario/validarfb",{
	                    	fbid:infofb.id,
	                    	email:infofb.email
	                    },function(res){
	                    	$("#espera").hide();
	                    	if(res.existe){
	                    		usuario = new Usuario();
	                    		usuario.iniciar(res);
	                    	}else{
	                    		$("#home .login").hide();
	                    		$("#home .tel").show();
	                    		$("#home .tel .usuario").html(infofb.first_name+' '+infofb.last_name);
	                    		if(infofb.pic!=null) $("#home .tel .pic").css("background-image","url('"+infofb.pic+"')");
	                    		$("#home .noregistro").hide();
	                    	}
	                    })
                	
                })
			}else{
				es.fin();
			}
		})
		
		
	})

	new Boton($("#home .tel .bt.fbsignin"),function(){
		var tel = $("#home .tel input[name=telefono]").val();

		
		if(tel!=""){

			

			if (/^([0-9])*$/.test(tel) && tel.length==9 && tel.substr(0,1)=="9"){


				

				var info = facebook.info;

				new Request('usuario/registrarfb',{
					nombres:info.first_name,
					apellidos:info.last_name,
					email:info.email,
					fbid:info.id,
					pic:info.pic,
					telefono:tel
				},function(res){
					if(!res.existe){
						usuario = new Usuario();
						usuario.iniciar(res);
					}else{
						new Alerta("Este número de teléfono ya ha sido registrado anteriormente");
					}
				},{
					espera:"Validando número de teléfono..."
				})
			}else{
				new Alerta("Debe ingresar un número de celular válido");
			}
		}

		
	})

	var pt = ((h-320)-100)/2;
	$("#home .login").css("padding-top",pt);

	var cpt = h-(pt+100)-300-20;

	$("#home .cuadro").css("padding-top",cpt);


	this.mostrar = function(){
		$("#header").hide();

		Home.prototype.mostrar.call(this);
	}

}

Home.prototype = new Seccion();