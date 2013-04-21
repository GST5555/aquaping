(function(){
    namespace.funciones = {};
    
    namespace.funciones.grupoTabs=function(){
		var tabGroup= Ti.UI.createTabGroup({
			exitOnClose:true,
			fullscreen:true,
			titleControl: false,
			navBarHidden: true,
			orientationModes: [Titanium.UI.PORTRAIT]
		});
		
		var mapWindow = namespace.funciones.mapWindow();
		var graphWindow = namespace.funciones.graphWindow();
		
		namespace.Tab1 = Titanium.UI.createTab({
			window: mapWindow,
			title:'Water Sources',
		});
		namespace.Tab2 = Titanium.UI.createTab({
			window: graphWindow,
			title:'Contamination Graphs'
		});
		
		tabGroup.addTab(namespace.Tab1);
		tabGroup.addTab(namespace.Tab2);
		return tabGroup;
	
	};
	
	namespace.funciones.mapWindow = function(){
		var url = "http://data.mwater.co/apiv2/sources"
		var win = Ti.UI.createWindow({
			navBarHidden:true
		});
		
		var map = Ti.Map.createView();
		
		var client = Ti.Network.createHTTPClient({
			onload: function(e){
				var datos = JSON.parse(this.responseText);
				for(i = 0; i < datos.sources.length;i++ ){
					Ti.API.info(JSON.stringify(datos));
					var mark = Ti.Map.createAnnotation({
						longitude:datos.sources[i].longitude,
						latitude:datos.sources[i].latitude,
						title:datos.sources[i].name,
						subtitle:datos.sources[i].desc
					});
					
					var moreInfo = Ti.UI.createView({
						height:"16px",
						width:"16px",
						backgroundColor:"#808"	
					});
					
					mark.leftView = moreInfo;
					moreInfo.addEventListener('click',function(e){
						var back = Ti.UI.createButton({
							title:'back'
						});
						
						var w = Ti.UI.createWindow({
							backgroundColor:"#FFF",
							modal:true
						});
						
						back.addEventListener('click', function(e){
							w.close();
						});
						
						var contenidoMarcador = Ti.UI.createView();
						
						if(Ti.Platform.getOsname() == 'android'){
							back.top = "0%";
							back.left = "3%";
							contenidoMarcador.add(back);
						}else{
							w.leftNavButton = back;
						}
						
						var infoMarcador = Ti.UI.createLabel({
							text:JSON.stringify(e.source)
						});
						
						w.add(contenidoMarcador);
						contenidoMarcador.add(infoMarcador);
						w.open();
					});
					map.addAnnotation(mark);
				}
			}
		});
		client.open("GET",url);
		client.send();
		win.add(map);
		return win;  
	};
	
	namespace.funciones.graphWindow = function(){
		return Ti.UI.createWindow();
	};
	
	
})();
