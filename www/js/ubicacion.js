var mapa;
var existemapa = false;
var Ubicacion = function(){

	this.dom = $("#ubicacion");
	this.titulo = "Ubicación";
	this.contactos = null;
	this.markers = new Array();
	this.mids = new Array();
	this.zona = null;
	this.myMarker = null;
	this.zonaMarker = null;

	this.miembros_markers = {};

	new Boton($("#ubicacion .footer .boton.zona"),function(){
		if(usuario.grupo.zonasegura_id==null){
			if(usuario.admin==true){
				new Alerta("Aún no defines el punto de encuentro seguro para tu grupo","Establecer",function(){

					header.mostrar("blank,cancelar","Selecciona una zona segura");
					new Boton($("#header .btn.cancelar"),function(){
						$.each(ubicacion.markers,function(k,v){
							v.setMap(null);
						});

						ubicacion.markers = new Array();
						
						$("#ubicacion .footer").show();
						header.mostrar("menu");

						google.maps.event.clearListeners(mapa, 'idle');
					});
					$("#ubicacion .footer").hide();

					
					mapa.setZoom(16); 

					ubicacion.fetchData();
					google.maps.event.addListener(mapa, 'idle', ubicacion.fetchData);

					
				});
			}else{
				new Alerta("El punto de encuentro seguro para tu grupo aún no ha sido definido");				
			}
			
		}else{
			var bounds = new google.maps.LatLngBounds();
		    bounds.extend(ubicacion.myMarker.getPosition());
		    bounds.extend(ubicacion.zonaMarker.getPosition());
		    mapa.fitBounds(bounds);
		}
	})
	new Boton($("#ubicacion .footer .boton.grupo"),function(){
		getContent({page:"internagrupo"},true);
	})

	this.mostrar = function(){
		
		header.mostrar("menu");
		$("#ubicacion .footer").show();
		
		try{
			google.maps.event.clearListeners(mapa, 'idle');
		}catch(e){
			console.log(e);
		}
		
		


		this.iniciarMapa();

		Ubicacion.prototype.mostrar.call(this);
	}

	



	this.fetchData = function(){

		

		if(mapa.getZoom()>=16){

			


			var bounds = mapa.getBounds();

			var sw = bounds.getSouthWest();
            var ne = bounds.getNorthEast();

			var query = 'SELECT Id, Location from 14CvUJcWarekr8I4V6p_ot2OnRKhH9j-mkbUpKPcK '+
						'where ST_INTERSECTS(Location, RECTANGLE(LATLNG'+sw+', LATLNG'+ne+'))';
			var encodedQuery = encodeURIComponent(query);

			// Construct the URL
			var url = ['https://www.googleapis.com/fusiontables/v1/query'];
				url.push('?sql=' + encodedQuery);
				url.push('&key=AIzaSyDYtz56ICf_rXN1pTXXutzGVkyDOa5Zo0U');
				url.push('&callback=?');
			$.ajax({
				url: url.join(''),
				dataType: 'jsonp',
				success: ubicacion.onDataFetched
			});
		}
	}

	this.onDataFetched = function(data){

		
		$.each(ubicacion.markers,function(k,v){
			v.setMap(null);
		});

		ubicacion.markers = new Array();
		

		var rows = data['rows'];
        var iconUrl;
        var content;
        var coordinate;

        // Copy each row of data from the response into variables.
        // Each column is present in the order listed in the query.
        // Starting from 0.
        // EDIT this if you've changed the columns, above.

        
        
		for (var i in rows) {
			var id = rows[i][0];
			var latlng = rows[i][1].split(",");

			coordinate = new google.maps.LatLng(latlng[0],latlng[1]);

			ubicacion.createMarker(id,coordinate);

			
		}

		
		



	}
	this.createMarker = function(id,coor){
		
		

		var marker = new google.maps.Marker({
			map: mapa,
			position: coor,
			icon: ubicacion.iconzona
		});
		google.maps.event.addListener(marker, 'click', function(event) {
			ubicacion.verZona(id,coor);
		});
		this.markers.push(marker);
		
		
		
		
	}

	
	this.verZona = function(id,coor){

	

		new Alerta('<img src="img/escudo.jpg" width="49" height="auto"><br><br><strong>Latitud:</strong> '+coor.lat()+'<br><strong>Longitud:</strong> '+coor.lng(),"Seleccionar",function(){
    		new Request("grupo/establecerzonasegura",{
    			llave:usuario.llave,
    			zona:id
    		},function(res){
    			if(res.res=="ok"){
    				usuario.setGrupo(res.grupo);
    				$.each(ubicacion.markers,function(k,v){
						v.setMap(null);
					});

					ubicacion.markers = new Array();

					google.maps.event.clearListeners(mapa, 'idle');
					ubicacion.setZona();
    				$("#ubicacion .footer").show();
					header.mostrar("menu");

					$.each(usuario.miembros,function(k,v){
						if(v.id!=usuario.id){
							socket.emit("directo",{ac:"zonasegura",id:v.id});
						}
					})

    			}else{
    				new Alerta("Ocurrió algún tipo de error");
    			}
    		},{
    			espera:""
    		})		
    	});
	}

	this.setZona = function(){


		if(usuario.grupo!=null && usuario.grupo.zonasegura_id!=null){
			var pos = new google.maps.LatLng(usuario.grupo.latitud,usuario.grupo.longitud);

			this.zonaMarker = new google.maps.Marker({
				map: mapa,
				position: pos,
				icon: ubicacion.iconzona
			});
			google.maps.event.addListener(this.zonaMarker, 'click', function(event) {
				//ubicacion.verZona(id,coor);
				var boton = "OK";

				if(usuario.admin==true){
					boton="Cambiar";
				}
				new Alerta('<img src="img/escudo.jpg" width="49" height="auto"><br><br><strong>Latitud:</strong> '+usuario.grupo.latitud+'<br><strong>Longitud:</strong> '+usuario.grupo.latitud,boton,function(){
					if(usuario.admin==true){
						ubicacion.zonaMarker.setMap(null);


						header.mostrar("blank,cancelar","Selecciona una zona segura");
						new Boton($("#header .btn.cancelar"),function(){
							$.each(ubicacion.markers,function(k,v){
								v.setMap(null);
							});

							ubicacion.markers = new Array();
							
							$("#ubicacion .footer").show();
							header.mostrar("menu");

							google.maps.event.clearListeners(mapa, 'idle');

							ubicacion.zonaMarker.setMap(mapa);

						});
						$("#ubicacion .footer").hide();

						
						mapa.setZoom(16); 

						ubicacion.fetchData();
						google.maps.event.addListener(mapa, 'idle', ubicacion.fetchData);


					}else{
						$("#alerta").hide();
					}
					

				});
			});
		}
	}

	this.iniciarMapa = function(){
		if(!existemapa){
			existemapa=true;


			navigator.geolocation.getCurrentPosition(function(pos){
				
				ubicacion.cargarMapa(pos.coords.latitude,pos.coords.longitude);
			
			}, function(pos){
				new Alerta("Necesitamos acceder a tu ubicación actual para mostrar el mapa");
			});

			
		}else{
			if(ubicacion.markers.length>0){
				$.each(ubicacion.markers,function(k,v){
					v.setMap(null);
				});

				ubicacion.markers = new Array();
			}
			
			try{
				ubicacion.zonaMarker.setMap(null);
			}catch(e){ 

			}

			this.setZona();
		}

		/*var idsMiembros = new Array();
		$.each(internagrupo.miembros,function(key,val){
			idsMiembros.push(val.id);
		})
		setTimeout(function(){
			socket.emit("pedirultimasposiciones",idsMiembros);	
		},2000);
		*/


		//navigator.geolocation.getCurrentPosition(this.onMyPosition, this.onError);
		//-12.071854, -77.115097

		
	}


	this.cargarMapa = function(lat,lng){
	
		var styles = [
	      {
	        featureType:"poi.business",
	        elementType:"labels",
	        stylers:[
	          {
	            visibility:"off"
	          }
	        ]
	      }
	    ];

	    var mapOptions = {
	      center: new google.maps.LatLng(lat,lng),
	      zoom: 16,
	      //mapTypeId: 'OSM',
	      streetViewControl:false,
	      mapTypeControl:false,
	      zoomControl: false,
	      styles: styles
	    };


	    mapa = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	    mapa.mapTypes.set("OSM", new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
            },
            tileSize: new google.maps.Size(256, 256),
            name: "OpenStreetMap",
            maxZoom: 18
        }));

	    ubicacion.iconzona = {
			url:'img/zona.png',
			scaledSize:new google.maps.Size(30, 39),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(15,20)
		};

		var markerico = usuario.marker;
		if(markerico==null) markerico = "img/markeruser.png";

	    var icono = {
	    	url:markerico,
	    	scaledSize: new google.maps.Size(45, 60)
	    }

	    ubicacion.myMarker = new google.maps.Marker({
	      clickable:true,
	     	
	      icon: icono,
	      shadow:null,
	      zIndex:999,
	      map:mapa,
	      position:{lat:lat,lng:lng}
	    });


	    this.setZona();

	    this.verMiembros();


		//var db = window.sqlitePlugin.openDatabase({name: "limamapa.sqlite"});
		//mapa = L.map('map-canvas').setView([-12.050987, -77.112587], 12);   ------
	
		//this works, but is online:
		/*
		L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 18
		}).addTo(map);
		*/
		
		//TODO build something to fall back to web if not found.
		
		/*L.tileLayer('MapQuest/{z}/{x}/{y}.jpg', {   ------
			maxZoom: 16,
			minZoom: 12
		}).addTo(mapa);*/
	}

	/*socket.on("mostrarposiciones",function(data){
		
		ubicacion.onPosiciones(data);

		
	})*/
	this.verMiembros = function(){
		var enmapa;
		if(terremoto) enmapa = mapa;
		else enmapa = null;

		$.each(usuario.miembros,function(k,v){
			console.log(v);
			if(v.posicion!=undefined && usuario.grupo!=null && v.id != usuario.id){
				var pos = String(enc.desencriptar(v.posicion,usuario.grupo.llave)).split(",");
				
				var markerico = v.marker;
				if(markerico==null) markerico = "img/markeruser.png";

			    var icono = {
			    	url:markerico,
			    	scaledSize: new google.maps.Size(45, 60)
			    }

				
			    ubicacion.miembros_markers[v.id] = new google.maps.Marker({
                  clickable:true,
                  zIndex:999,
                  map:enmapa,
                  icon:icono,
                  position:{lat:parseFloat(pos[0]),lng:parseFloat(pos[1])}
                });

			}
			

		})

	}
	this.actualizarPosicion = function(id,posicion,timestamp){
		
		var enmapa;

		if(terremoto) enmapa = mapa;
		else enmapa = null;

		var posicion = String(enc.desencriptar(posicion,usuario.grupo.llave)).split(",");
		var latlng = new google.maps.LatLng(parseFloat(posicion[0]),parseFloat(posicion[1]));
		if(ubicacion.miembros_markers[id]!=undefined){
			ubicacion.miembros_markers[id].setPosition(latlng);
		}else{
			if(usuario.miembros!=undefined && usuario.miembros!=null){
				$.each(usuario.miembros,function(k,v){
					if(v.id == id){

						var markerico = v.marker;
						if(markerico==null) markerico = "img/markeruser.png";

					    var icono = {
					    	url:markerico,
					    	scaledSize: new google.maps.Size(45, 60)
					    }

						
					    ubicacion.miembros_markers[v.id] = new google.maps.Marker({
		                  clickable:true,
		                  zIndex:999,
		                  map:mapa,
		                  icon:icono,
		                  position:latlng
		                });

					}
				})
			}
			
			
		}


	}
	this.onTerremoto = function(){
		$.each(ubicacion.miembros_markers,function(k,v){
			v.setMap(mapa);
		});
	}
	this.offTerremoto = function(){
		$.each(ubicacion.miembros_markers,function(k,v){
			v.setMap(null);
		});
	}


	this.onError = function(error){
		console.log('code: '    + error.code    + '\n' +  'message: ' + error.message + '\n');
	}
	

	this.onPosicionesssssss = function(data){
		
		console.log(data);
		console.log(internagrupo.miembros);
		$.each(internagrupo.miembros,function(key,val){
			if(data[parseInt(val.id)]!=null){
				if(ubicacion.markers[parseInt(val.id)]==undefined){
					//crear marker
					var img = escape(val.pic);

					/*var icono = {
				    	url:'http://picnic.pe/clientes/lifesignal/api/imagen.php?path='+img,
				    	scaledSize: new google.maps.Size(40, 40)
				    }

				    var marker = new google.maps.Marker({
				      clickable:true,
				     	
				      icon: icono,
				      shadow:null,
				      zIndex:999,
				      map:mapa,
				      position:{lat:data[parseInt(val.id)].lat,lng:data[parseInt(val.id)].lon}
				    });*/
					var lat = data[parseInt(val.id)].lat;
					var lng = data[parseInt(val.id)].lon;


					var myIcon = L.icon({
					    iconUrl: 'http://picnic.pe/clientes/lifesignal/api/imagen.php?path='+img,
					    //iconRetinaUrl: 'my-icon@2x.png',
					    iconSize: [40, 40],
					    //iconAnchor: [20, 20],
					    //popupAnchor: [-3, -76],
					    //shadowUrl: 'my-icon-shadow.png',
					    //shadowRetinaUrl: 'my-icon-shadow@2x.png',
					    //shadowSize: [68, 95],
					    //shadowAnchor: [22, 94]
					});

					var marker = L.marker([lat,lng],{
						icon:myIcon
					}).addTo(mapa);

				   
				    ubicacion.markers[parseInt(val.id)] = marker;
				}else{
					
					var m = ubicacion.markers[parseInt(val.id)];

					//var latlng = new google.maps.LatLng(data[parseInt(val.id)].lat,data[parseInt(val.id)].lon);
					//m.setPosition(latlng);

					m.setLatLng([data[parseInt(val.id)].lat,data[parseInt(val.id)].lon]);

				}
				
				//google.maps.event.clearInstanceListeners(ubicacion.markers[parseInt(val.id)]);

				//ubicacion.markers[parseInt(val.id)].addListener("click",function(){
				ubicacion.markers[parseInt(val.id)].on("click",function(e){


					var fecha = new Date(data[parseInt(val.id)].datetime);
					console.log(fecha.getHours());

					var ho = fecha.getHours();
					console.log(ho);
					var ampm;

					if(ho<12) ampm = "AM";
					else ampm = "PM";
					var hora=ho;
					if(ho==0) hora="12";
					if(ho>12) hora=String(ho-12);
					console.log(hora);
					hora = String("0"+String(hora)).substr(-2);

					var minutos = fecha.getMinutes();
					var dia = String("0"+String(fecha.getDate())).substr(-2);
					var mes = String("0"+String(fecha.getMonth()+1)).substr(-2);
					var anio = fecha.getFullYear();

					

					var formatdate = hora+":"+minutos+ampm+" "+dia+"/"+mes+"/"+anio;

					var html = '<img src="'+val.pic+'" width="100" height="100" style="margin:auto;display:block;margin-bottom:20px">'+
								val.nombres+" "+val.apellidos+
								'<br><span style="font-size:11px">Última posición a las <br>'+formatdate+'</span>';
				    new Alerta(html,"Llamar",function(){

				    	window.open("tel:"+val.telefono, '_system');
				    	$("#alerta").show();
				    });
				})

				
			}
		})
	}

	

}
Ubicacion.prototype = new Seccion();