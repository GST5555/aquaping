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
		var tipsWindow = namespace.funciones.configurationWindow();
		var configurationWindow = namespace.funciones.configurationWindow();

		namespace.Tab1 = Titanium.UI.createTab({
			window: mapWindow,
			icon: 'icons/world.png',
			title:'Water Sources',
		});
		
		namespace.Tab2 = Titanium.UI.createTab({
			window: tipsWindow,
			icon:'icons/tips.png',
			title:'Tips'
		});
		
		namespace.Tab3 = Titanium.UI.createTab({
			window: configurationWindow,
			icon:'icons/configuration.png',
			title:'Configuration'
		});
		
		tabGroup.addTab(namespace.Tab1);
		tabGroup.addTab(namespace.Tab2);
		tabGroup.addTab(namespace.Tab3);
		return tabGroup;
	
	};
	
	
	namespace.funciones.currentLocation = function(){
		return ;
	};
	
	namespace.funciones.mapWindow = function(){
		var win = Ti.UI.createWindow({
			barColor:'rgb(9, 53, 120)',
			title:'Water Sources'
		});
		
		
		namespace.funciones.getSourceTypes();

		var map = Ti.Map.createView({
			region:{
				latitudeDelta:0.05,
				longitudeDelta:0.05
			},
			userLocation:true
		});
		
		map.addEventListener('click', function(e){
			Ti.API.info("Click en map view: "+JSON.stringify(e));
		});
		
		namespace.funciones.getAnnotations(map);
		
		var addWaterSource = Ti.UI.createButton({
			title:' Add Water Source ',
			backgroundColor:'rgb(9, 53, 120)',
			font:{
			      fontFamily:'SixCaps'
			},
		    touchEnabled: true, 
			backgroundImage: 'none',
			borderRadius:3,
			bottom:'3%',
			right:'3%'
		});
		
		addWaterSource.addEventListener('click', function(e){
			namespace.funciones.addWaterSourceWindow();
		});
		
		map.add(addWaterSource);
		
		win.add(map);
		return win;  
	};
	
	namespace.funciones.getAnnotations = function(map){
		var url = "http://data.mwater.co/apiv2/sources";
		var client = Ti.Network.createHTTPClient({
			onload: function(e){
				var datos = JSON.parse(this.responseText);
				for(i = 0; i < datos.sources.length;i++ ){
					var mark = Ti.Map.createAnnotation({
						longitude:datos.sources[i].longitude,
						latitude:datos.sources[i].latitude,
						title:datos.sources[i].name,
						subtitle:datos.sources[i].desc,
						image:'icons/waterPin.png',
						uid:datos.sources[i].uid,
						font:{
						      fontFamily:'SixCaps'
						}
					});
					
					var moreInfo = Ti.UI.createImageView({
						height:"32px",
						width:"32px",
						image:'icons/search.png',
						info:datos.sources[i]	
					});					
					mark.rightView = moreInfo;
					
					moreInfo.addEventListener('click',function(e){
						namespace.funciones.moreInfoWindow(e);
					});
					map.addAnnotation(mark);
				}
				return map;
			},
			onerror: function(e){
				return undefined;
			}
		});
		client.open("GET",url);
		client.send();
	};
	
	namespace.funciones.getSourceTypes = function(){
		var url = "http://data.mwater.co/apiv2/source_types";
		var client = Ti.Network.createHTTPClient();
		client.open('GET', url);
		client.onload = function(e){
			Ti.API.info(JSON.parse(this.responseText));
			Ti.App.source_types = JSON.parse(this.responseText);		
		};
		client.onerror = function(e){
			Ti.App.source_types = undefined;
		};
		client.send();
	};
	
	namespace.funciones.getWaterSourceByUid = function(uid){
		
	};
	
	
	namespace.funciones.moreInfoWindow = function(e){
		var back = Ti.UI.createButton({
			title:'back'
		});
		
		var w = Ti.UI.createWindow({
			backgroundColor:'rgb(9, 53, 120)',
			title:'Water Source',
			barColor:'rgb(9, 53, 120)',
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
		var url = "http://data.mwater.co/apiv2/sources/"+e.source.info.uid;
		var client = Ti.Network.createHTTPClient();
		client.open('GET', url);
		client.onload = function(e){
			var waterSource = JSON.parse(this.responseText);
			Ti.API.info(waterSource);
			Ti.API.info(Ti.App.source_types.source_types[0].name);
			
			var imageWaterSource = Ti.UI.createImageView({
				image:'icons/water.png',
				center:'0%',
				top:'3%'
			});
			contenidoMarcador.add(imageWaterSource);
			
			var nameLabel = Ti.UI.createLabel({
				text:waterSource.name,
				top:"56%",
				left:"3%",
				color:'rgb(255,255,255)'
			});
			contenidoMarcador.add(nameLabel);
			
			var descriptionLabel = Ti.UI.createLabel({
				text:waterSource.desc,
				top:"62%",
				left:"3%",
				font:{
					fontSize:"15dp"
				},
				color:'rgb(255,255,255)'
			});
			contenidoMarcador.add(descriptionLabel);
			
			var id_text = Ti.UI.createLabel({
				text:'ID:',
				top:"68%",
				left:"3%",
				color:'rgb(255,255,255)',
				font:{
					fontSize:"12dp"
				},
			});
			contenidoMarcador.add(id_text);
			
			var idLabel = Ti.UI.createLabel({
				text:waterSource.code,
				top:"68%",
				left:"12%",
				font:{
					fontSize:"12dp"
				},
				color:'rgb(255,255,255)'
			});
			contenidoMarcador.add(idLabel);
			
			var type_text = Ti.UI.createLabel({
				text:'Type:',
				top:'75%',
				left:"3%",
				color:'rgb(255,255,255)',
				font:{
					fontSize:"12dp"
				},
			});
			contenidoMarcador.add(type_text);
			
			var typeLabel = Ti.UI.createLabel({
				text:(waterSource.source_type == null) ? 'Not defined' : Ti.App.source_types.source_types[waterSource.source_type].name,
				top:'75%',
				left:"15%",
				font:{
					fontSize:"12dp"
				},
				color:'rgb(255,255,255)'
			});
			Ti.API.info(typeLabel.text);
			contenidoMarcador.add(typeLabel);
			
			var ducha = Ti.UI.createImageView({
				image:'icons/water_sources_warnings/ducha.png',
				top:'85%',
				left:'3%',
				height:'128px',
				width:'128px'
			});
			contenidoMarcador.add(ducha);
			
			var noBaniarte = Ti.UI.createImageView({
				image:'icons/water_sources_warnings/noBaniarte.png',
				top:'85%',
				left:'24%',
				height:'128px',
				width:'128px'
			});
			contenidoMarcador.add(noBaniarte);
			
			var noDarselaAanimales = Ti.UI.createImageView({
				image:'icons/water_sources_warnings/noDarselaAanimales.png',
				top:'85%',
				left:'45%',
				height:'128px',
				width:'128px'
			});
			contenidoMarcador.add(noDarselaAanimales);
			
			
			w.add(contenidoMarcador);		
		};
		client.onerror = function(e){
			return undefined;
		};
		client.send();		
		w.open();
	};
	
	namespace.funciones.addNoteWindow = function(e){
		var back = Ti.UI.createButton({
			title:'back'
		});
		
		var w = Ti.UI.createWindow({
			backgroundColor:'rgb(9, 53, 120)',
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
		
		var waterSourceLabel = Ti.UI.createLabel({
			text:'Water Source: '+e.source.info.name,
			top:'3%',
			left:'3%'
		});
		contenidoMarcador.add(waterSourceLabel);
		
		var nameLabel = Ti.UI.createLabel({
			text:'Name: ',
			top:'12%',
			left:'3%'
		});
		contenidoMarcador.add(nameLabel);
		
		var nameField = Ti.UI.createTextField({
			width:'30%',
			borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		    borderColor:'rgb(255,255,255)',
			top:'12%',
			left:'18%'
		});
		contenidoMarcador.add(nameField);
		
		var questionOne = Ti.UI.createLabel({
			text:'Is there foam on the surface of the water?',
			left:'3%',
			top:'21%'
		});
		contenidoMarcador.add(questionOne);
		
		var questionTwo = Ti.UI.createLabel({
			text:'Does the water smell oddly?',
			left:'3%',
			top:'30%'
		});
		contenidoMarcador.add(questionTwo);
		
		var questionThree = Ti.UI.createLabel({
			text:'How much trash can be seen around?',
			left:'3%',
			top:'42%'
		});
		contenidoMarcador.add(questionThree);
		
		w.add(contenidoMarcador);
		w.open();
	};
	
	namespace.funciones.addWaterSourceWindow = function(){
		var backButton = Ti.UI.createButton({
			title:'back'
		});
		
		var cameraButton = Ti.UI.createButton({
			image:'icons/photo.png'
		});
		cameraButton.addEventListener('click', function(e){
			Ti.Media.showCamera({
				success:function(e){
					var image = e.media;
					if(e.mediaType == Ti.Media.MEDIA_TYPE_PHOTO){
						cameraButton.image = Ti.UI.createImageView({image:image,height:'32px',width:'32px'}).toImage();
					}
				}
			});
		});
		
		var w = Ti.UI.createWindow({
			backgroundColor:'rgb(9, 53, 120)',
			title:'New Water Source',
			barColor:'rgb(9, 53, 120)',
			leftNavButton: backButton,
			rightNavButton: cameraButton,
			modal:true
		});
		
		backButton.addEventListener('click', function(e){
			w.close();
		});
		
		
		var contenidoMarcador = Ti.UI.createView({
			height:'100%'
		});
		
		var tr = Titanium.UI.create2DMatrix();
		tr = tr.rotate(90);
		
		var dropDownButton = Ti.UI.createButton({
			style:Titanium.UI.iPhone.SystemButton.DISCLOSURE,
			transform:tr
		});
		
		var sourceTypeField = Ti.UI.createTextField({
			width:'50%',
			hintText:'Select type',
			//borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			backgroundImage:'none',
			rightButton:dropDownButton,
			rightButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS,
			//editable:false,
			backgroundColor:'rgb(255,255,255)',
			color:'rgb(0,0,0)',
			borderRadius:5,
		    borderColor:'rgb(255,255,255)',
			top:'12%',
			left:'42%'
		});
		contenidoMarcador.add(sourceTypeField);
		
		var sourceTypeLabel = Ti.UI.createLabel({
			text:'Source Type: ',
			color:'rgb(255,255,255)',
			top:'12%',
			left:'3%'
		});
		contenidoMarcador.add(sourceTypeLabel);
		
		var pickerSourceType_view = Ti.UI.createView({
			height:251,
			bottom:-251,
			zIndex:1
		});
		
		var cancel =  Titanium.UI.createButton({
			title:'Cancel',
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
		});
		 
		var done =  Titanium.UI.createButton({
			title:'Done',
			style:Titanium.UI.iPhone.SystemButtonStyle.DONE
		});
		
		var spacer =  Titanium.UI.createButton({
			systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		});
		 
		var toolbar =  Titanium.UI.iOS.createToolbar({
			top:0,
			items:[cancel,spacer,done]
		});
		 
		var pickerSourceType= Titanium.UI.createPicker({
			top:43,
			type:Titanium.UI.PICKER_TYPE_PLAIN
		});
		pickerSourceType.selectionIndicator=true;
		var data = [];
		for(i = 0;i < Ti.App.source_types.source_types.length; i++){
			data.push(Ti.UI.createPickerRow({title:Ti.App.source_types.source_types[i].name}));
		};
		pickerSourceType.add(data);
		pickerSourceType_view.add(toolbar);
		pickerSourceType_view.add(pickerSourceType);
		
		var slide_in = Ti.UI.createAnimation({bottom:0});
		var slide_out = Ti.UI.createAnimation({bottom:-251});
		
		done.addEventListener('click', function(e) {
			sourceTypeField.value = pickerSourceType.getSelectedRow(0).title;
			pickerSourceType_view.animate(slide_out);
		});
		 
		 
		sourceTypeField.addEventListener('focus', function(e) {
			pickerSourceType_view.animate(slide_out);
		});
		 
		dropDownButton.addEventListener('click',function(e) {
			pickerSourceType_view.animate(slide_in);
			sourceTypeField.blur();
		});
		 
		cancel.addEventListener('click',function(e) {
			pickerSourceType_view.animate(slide_out);
		});
		
		contenidoMarcador.add(pickerSourceType_view);
			
		var nameLabel = Ti.UI.createLabel({
			text:'Name: ',
			color:'rgb(255,255,255)',
			top:'3%',
			left:'3%'
		});
		contenidoMarcador.add(nameLabel);
		
		var nameField = Ti.UI.createTextField({
			hintText:' Optional name',
			width:'60%',
			color:'rgb(164, 164, 164)',
			backgroundColor:'rgb(255,255,255)',
			borderRadius:5,
			top:'3%',
			left:'21%'
		});
		contenidoMarcador.add(nameField);
		
		var questionOne = Ti.UI.createLabel({
			text:'How clear is the water?',
			color:'rgb(255,255,255)',
			top:'18%',
			left:'3%'
		});
		contenidoMarcador.add(questionOne);
		
		var sliderQuestionOne = Titanium.UI.createSlider({
			min: 0,
			max: 10,
			height:'6%',
			width:'90%',
			value:5,
			borderRadius:5,
			center:'0%',
			top:'24%',
			thumbImage:'icons/circleYellow.png'
		});
		/*
		backgroundGradient: {
		        type: 'linear',
		        startPoint: { x: '0%', y: '50%' },
		        endPoint: { x: '100%', y: '50%' },
		        colors: [ { color: 'red', offset: 0.0}, { color: 'yellow', offset: 0.25 }, { color: 'green', offset: 1.0 } ],
		},
		*/
		sliderQuestionOne.addEventListener('change', function(e){
			//sliderLabel.text = String.format("%3.1f", e.value);
			if(e.value > 6){
				sliderQuestionOne.thumbImage = 'icons/circleGreen.png';
			}else if(e.value < 3){
				sliderQuestionOne.thumbImage = 'icons/circleRed.png';
			}else{
				sliderQuestionOne.thumbImage = 'icons/circleYellow.png'
			}
		});
		contenidoMarcador.add(sliderQuestionOne);
		
		
		var selectedQuestionTwoButton = 'currentLocation';

		var questionTwo = Ti.UI.createLabel({
			text:'Is there foam on the sirface of the water?',
			color:'rgb(255,255,255)',
			left:'3%',
			top:'30%'
		});
		contenidoMarcador.add(questionTwo);
		
		var selectedQuestionTwoButton = 'currentLocation';
		
		var questionTwoButton = Ti.UI.iOS.createTabbedBar({
			labels:['Yes', 'No'],
		    backgroundColor:'#336699',
		    top:'39%',
		    style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
		    height:'6%',
		    center:'0%',
		    width:'90%'
		});
		
		questionTwoButton.addEventListener('click', function(e){
			questionTwoButton.labels[e.index].enable = false;
			if(e.index == 1){
				questionTwoButton.labels[0].enable = true;
				selectedQuestionTwoButton = questionTwoButton.labels[0];
			}else{
				questionTwoButton.labels[1].enable = true;
				selectedQuestionTwoButton = questionTwoButton.labels[1];
			}
		});
		contenidoMarcador.add(questionTwoButton);
		
		
		var questionThree = Ti.UI.createLabel({
			text:'Does the water smell oddly?',
			color:'rgb(255, 255, 255)',
			left:'3%',
			top:'45%'
		});
		contenidoMarcador.add(questionThree);
		
		var selectedQuestionThreeButton = 'currentLocation';
		
		var questionThreeButton = Ti.UI.iOS.createTabbedBar({
			labels:['Yes', 'No'],
		    backgroundColor:'#336699',
		    top:'54%',
		    style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
		    height:'6%',
		    center:'0%',
		    width:'90%'
		});
		
		questionThreeButton.addEventListener('click', function(e){
			questionThreeButton.labels[e.index].enable = false;
			if(e.index == 1){
				questionThreeButton.labels[0].enable = true;
				selectedQuestionThreeButton = questionThreeButton.labels[0];
			}else{
				questionThreeButton.labels[1].enable = true;
				selectedQuestionThreeButton = questionThreeButton.labels[1];
			}
		});
		contenidoMarcador.add(questionThreeButton);
		
		
		var questionFour = Ti.UI.createLabel({
			text:'How much trash can be seen around?',
			color:'rgb(255, 255, 255)',
			left:'3%',
			top:'60%'
		});
		contenidoMarcador.add(questionFour);
		
		var selectedQuestionFourButton = 'currentLocation';
		
		
		var sliderQuestionFour = Titanium.UI.createSlider({
			min: 0,
			max: 10,
			height:'6%',
			width:'90%',
			value:5,
			borderRadius:5,
			center:'0%',
			top:'66%',
			thumbImage:'icons/circleYellow.png'
		});
		/*
		backgroundGradient: {
		        type: 'linear',
		        startPoint: { x: '0%', y: '50%' },
		        endPoint: { x: '100%', y: '50%' },
		        colors: [ { color: 'red', offset: 0.0}, { color: 'yellow', offset: 0.25 }, { color: 'green', offset: 1.0 } ],
		},
		*/
		sliderQuestionFour.addEventListener('change', function(e){
			//sliderLabel.text = String.format("%3.1f", e.value);
			if(e.value > 6){
				sliderQuestionFour.thumbImage = 'icons/circleGreen.png';
			}else if(e.value < 3){
				sliderQuestionFour.thumbImage = 'icons/circleRed.png';
			}else{
				sliderQuestionFour.thumbImage = 'icons/circleYellow.png'
			}
		});
		contenidoMarcador.add(sliderQuestionFour);

		var locationLabel = Ti.UI.createLabel({
			text:'Location: ',
			color:'rgb(255, 255, 255)',
			left:'3%',
			top:'75%'
		});
		contenidoMarcador.add(locationLabel);

		
		var selectedLocationButton = 'currentLocation';
		
		var locationButton = Ti.UI.iOS.createTabbedBar({
			labels:['Set current location', 'Choose location'],
		    backgroundColor:'#336699',
		    top:'82%',
		    style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
		    height:'6%',
		    center:'0%',
		    width:'90%'
		});
		
		locationButton.addEventListener('click', function(e){
			locationButton.labels[e.index].enable = false;
			if(e.index == 1){
				locationButton.labels[0].enable = true;
				selectedLocationButton = locationButton.labels[0];
			}else{
				locationButton.labels[1].enable = true;
				selectedLocationButton = locationButton.labels[1];
			}
		});
		contenidoMarcador.add(locationButton);

		var enviarButton = Ti.UI.createButton({
			title:'Submit',
			height:'6%',
			top:'90%'
		});
		contenidoMarcador.add(enviarButton);

		w.add(contenidoMarcador);
		w.open();
	};
	
	namespace.funciones.getCurrentLocation = function(){
		return Ti.Geolocation.getCurrentLocation();
	};
	
	namespace.funciones.configurationWindow = function(){
		return Ti.UI.createWindow();
	};
	
	
})();
