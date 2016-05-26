var Instrucciones = function(){
	this.dom = $("#instrucciones");

	var pg = 1;

	$("#instrucciones").css("height",h-1);
	$("#instrucciones .item").css("width",w);
	$("#instrucciones .mov").css("width",w*3);

	$("#instrucciones .slide").bind({
		"swipeleft":function(){
			if(pg<3){
				pg++;
				$("#instrucciones .area").animate({scrollLeft:(pg-1)*w});
				//$("#instrucciones .mov").transition({x:-1*(pg-1)*w});
				$("#instrucciones .nav .it").removeClass("ac");
				$("#instrucciones .nav .it:eq("+(pg-1)+")").addClass('ac');
				if(pg==3){
					$("#instrucciones .nav").hide();
					$("#instrucciones .bt.comenzar").fadeIn(300);
				}
			}
			//alert(2);
		},
		"swiperight":function(){
			if(pg>1){
				if(pg==3){
					$("#instrucciones .nav").fadeIn(300);
					$("#instrucciones .bt.comenzar").hide(300);
				}
				pg--;
				$("#instrucciones .area").animate({scrollLeft:(pg-1)*w});
				
				$("#instrucciones .nav .it").removeClass("ac");
				$("#instrucciones .nav .it:eq("+(pg-1)+")").addClass('ac');

			}
		}

	});

	new Boton($("#instrucciones .bt.comenzar"),function(){
		getContent({page:"internagrupo"},true);
	})

	this.mostrar = function(){

		header.mostrar();

		Instrucciones.prototype.mostrar.call(this);
	}
}
Instrucciones.prototype =  new Seccion();