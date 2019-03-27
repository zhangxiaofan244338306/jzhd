var hdLayer = "http://192.168.1.166:6080/arcgis/rest/services/JTMAP/query/MapServer/1";
var skLayer = "http://192.168.1.166:6080/arcgis/rest/services/JTMAP/query/MapServer/0";

function showLayer(hhmc) {
	queryLayer = new esri.layers.GraphicsLayer();
	var query = new esri.tasks.Query();
	var qLayer = hdLayer;
	if(hhmc.indexOf("水库") >= 0) {
		qLayer = skLayer;
	}
	//把需要查询的底图服务加载进来  
	var queryTask = new esri.tasks.QueryTask(qLayer);
	//需要返回Geometry  
	query.returnGeometry = true;
	//需要返回的字段  
	query.outFields = ["HHMC", "GLDW"];
	//设置查询条件，buildNo是之前DOM操作时从信息内容里取出来的 
	var random = (new Date()).getTime()
	query.where = "1=1" + " And " + random + "=" + random + " and HHMC  = '" + hhmc + "'";

	queryTask.execute(query, function(res) {
		var showExtent;
		for(var i = 0; i < res.features.length; i++) {
			var fea = res.features[i];
			//查询结果样式  
			var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
				new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([162, 162, 162, 1]), 1),
				new dojo.Color([255, 0, 0, 0.7]));

			var graphic = new esri.Graphic();
			graphic.setGeometry(fea.geometry);
			//设置查询到的graphic的显示样式  
			//graphic.setSymbol(symbol);
			var resizeInterval1, resizeInterval2;
			var resizeTimer, resizeTime = 2000;
			clearTimeout(resizeTimer);
			resizeInterval1 = setInterval(function() {
				//map.lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([167, 228, 88, 1]), 3);
				map.lineSymbol =new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
				new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([167, 228, 88, 1]), 3),
				new dojo.Color([255, 0, 0, 0.1]));
				graphic.setSymbol(map.lineSymbol);
			}, 200);
			resizeInterval2 = setInterval(function() {
				//map.lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([72, 129, 244, 1]), 3);
				map.lineSymbol =new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
				new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([72, 129, 244, 1]), 3),
				new dojo.Color([255, 0, 0, 0.1]));
				graphic.setSymbol(map.lineSymbol);
			}, 220);
			resizeTimer = setTimeout(function() {
				clearInterval(resizeInterval1);
				clearInterval(resizeInterval2);
			}, resizeTime);

			//map.lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([72, 129, 244, 1]), 3);
			map.lineSymbol =new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
				new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([72, 129, 244, 1]), 3),
				new dojo.Color([255, 0, 0, 0.1]));
			graphic.setSymbol(map.lineSymbol); //解决颜色因为延迟问题不一致

			//把查询结果添加到map.graphics中进行显示  
			//设置graphic的信息模板
			//信息模板
			var infoTemplate = new esri.InfoTemplate();
			//设置Title
			infoTemplate.setTitle(fea.attributes.HHMC);
			var content = "<b>管理单位:  </b>" + fea.attributes.GLDW;

			//设置Content
			infoTemplate.setContent(content);

			graphic.setInfoTemplate(infoTemplate);
			queryLayer.add(graphic);
			map.addLayer(queryLayer);
			//获取查询到的所有geometry的Extent用来设置查询后的地图显示  
			if(i == 0) {
				showExtent = fea.geometry.getExtent();
			} else {
				showExtent = showExtent.union(fea.geometry.getExtent());
			}
			//设置地图的视图范围  
			map.setExtent(showExtent.expand(1));
		}
	});
}

function initSearch() {
	var txt = document.getElementById("sugtxtgestId");
	var box = document.getElementById("inputDiv");
	txt.onkeyup = function() {

		var value = document.getElementById("sugtxtgestId").value;
		var arr2 = [];
		for(var i = 0; i < arr.length; i++) {
			if(arr[i].indexOf(value) >= 0) {
				arr2.push(arr[i]);
			}
		}
		//获取pop  

		var pop = document.getElementById("pop");
		//如果输入的值为空  
		if(this.value.length === 0) {
			if(pop) {
				box.removeChild(pop);
			}
			return;
		}

		//不满足的情况  
		// 如果已经存在则先删除  
		if(pop) {
			box.removeChild(pop);
		}

		//如果arr2的长度为0  
		if(arr2.length === 0) {
			return;
		}

		//创建盒子  
		var div = document.createElement("div");
		div.id = "pop";
		box.appendChild(div);

		//创建ul  
		var ul = document.createElement("ul");
		ul.id = "tt";
		div.appendChild(ul);

		//将数组arr2的数据显示出来  
		for(var i = 0; i < arr2.length; i++) {
			var li = document.createElement("li");
			li.innerHTML = arr2[i];
			ul.appendChild(li);
		}

		var obj_lis = document.getElementById("tt").getElementsByTagName("li");
		for(i = 0; i < obj_lis.length; i++) {
			obj_lis[i].onclick = function() {
				document.getElementById("sugtxtgestId").value = this.innerHTML;
				var pop = document.getElementById("pop");
				if(pop) {
					box.removeChild(pop);
				}
				showLayer(this.innerHTML);
			}
		}
	}

	mui(".mui-icon-clear")[0].addEventListener('tap', function() {
		var pop = document.getElementById("pop");
		if(pop) {
			box.removeChild(pop);
		}
	});

}

var arr = ["白石里水库", "大塘坝水库", "东沟水库", "东进水库", "方山水库", "海底水库", "杭山水库", "花园坝水库", "建国水库", "凌角坝水库", "龙口水库", "蚂蚁坝水库", "青龙洞水库", "四棚洼水库", "唐庄水库", "头棚水库", "瓦沟水库", "向阳水库", "斜角水库", "新浮水库", "阳山水库", "杨兴洼水库", "长山凹水库", "芝麻凹水库","中干河东段","中干河西段" ,"湟里河","薛埠河","夏溪河","丹金溧漕河"];

var river = [{
	value: '1',
	text: '河道',
	children: [{
		"OBJECTID": 1,
		value: "金坛区水利局",
		text: "中干河西段"
	}, {
		"OBJECTID": 2,
		value: "金坛区水利局",
		text: "中干河东段"
	}, {
		"OBJECTID": 3,
		value: "金坛区水利局",
		text: "湟里河"
	}, {
		"OBJECTID": 4,
		value: "金坛区水利局",
		text: "薛埠河"
	}, {
		"OBJECTID": 5,
		value: "金坛区水利局",
		text: "夏溪河"
	}, {
		"OBJECTID": 6,
		value: "金坛区水利局",
		text: "丹金溧漕河"
	}]
}, {
	value: '8',
	text: '水库',
	children: [{
		"OBJECTID": 1,
		value: "新浮水库管理所",
		text: "新浮水库"
	}, {
		"OBJECTID": 2,
		value: "海底水库管理所",
		text: "海底水库"
	}, {
		"OBJECTID": 3,
		value: "薛埠镇彭城村委",
		text: "四棚洼水库"
	}, {
		"OBJECTID": 4,
		value: "薛埠镇对达村委",
		text: "阳山水库"
	}, {
		"OBJECTID": 5,
		value: "薛埠镇赤岗村委",
		text: "蚂蚁坝水库"
	}, {
		"OBJECTID": 6,
		value: "薛埠镇水利",
		text: "向阳水库"
	}, {
		"OBJECTID": 7,
		value: "薛埠镇水利",
		text: "瓦沟水库"
	}, {
		"OBJECTID": 8,
		value: "薛埠镇上阮村委",
		text: "头棚水库"
	}, {
		"OBJECTID": 9,
		value: "薛埠镇水利站",
		text: "青龙洞水库"
	}, {
		"OBJECTID": 10,
		value: "薛埠镇上阮村委",
		text: "凌角坝水库"
	}, {
		"OBJECTID": 11,
		value: "薛埠镇赤岗村委",
		text: "长山凹水库"
	}, {
		"OBJECTID": 12,
		value: "薛埠镇赤岗村委",
		text: "芝麻凹水库"
	}, {
		"OBJECTID": 13,
		value: "薛埠镇方麓村委",
		text: "白石里水库"
	}, {
		"OBJECTID": 14,
		value: "薛埠镇方麓村委",
		text: "唐庄水库"
	}, {
		"OBJECTID": 15,
		value: "薛埠镇方麓村委",
		text: "建国水库"
	}, {
		"OBJECTID": 16,
		value: "薛埠镇连山村委",
		text: "方山水库"
	}, {
		"OBJECTID": 17,
		value: "薛埠镇茅庵村委",
		text: "龙口水库"
	}, {
		"OBJECTID": 18,
		value: "薛埠镇东窑村委",
		text: "东沟水库"
	}, {
		"OBJECTID": 19,
		value: "薛埠镇东进村委",
		text: "大塘坝水库"
	}, {
		"OBJECTID": 20,
		value: "薛埠镇石马村委",
		text: "斜角水库"
	}, {
		"OBJECTID": 21,
		value: "薛埠镇致和村委",
		text: "花园坝水库"
	}, {
		"OBJECTID": 22,
		value: "薛埠镇致和村委",
		text: "杭山水库"
	}, {
		"OBJECTID": 23,
		value: "薛埠镇水利站",
		text: "东进水库"
	}, {
		"OBJECTID": 24,
		value: "薛埠镇彭城村委",
		text: "杨兴洼水库"
	}]
}]