/// config contents
// elementID
function GenerateD3Pie(config){

	var pieTitle = config.title
	var pieLocationId = config.locationId;
	var sortValue = config.sortValue;
	var dataList = config.dataList;	
	var curvedLabel = false
	if(config.curvedLabel === true || config.curvedLabel === false){
		curvedLabel = config.curvedLabel;
	}

	var pieSpecificId = pieLocationId.replaceAll("#","").replaceAll(".","").replaceAll(" ","");

	// function compare(a,b) {
	//   if (a[sortValue] < b[sortValue])
	//     return -1;
	//   if (a[sortValue] > b[sortValue])
	//     return 1;
	//   return 0;
	// }

	//dataList = dataList.sort(compare);


//-------------------------------------------------------------------------------------

	var svg = d3.select(pieLocationId)
		.append("svg")
		.append("g")

	svg.append("g")
		.attr("class", "slices");
	svg.append("g")
		.attr("class", "labels");
	svg.append("g")
		.attr("class", "lines");

	svg.append("g").attr("class", "pieChartTitle")
		.append("text")
		.attr("text-anchor", "middle")   		
   		.text(pieTitle);	

   	var width = $(pieLocationId).width();
	var height = $(pieLocationId).height();
	var radius = Math.min(width, height) / 2;

	var pie = d3.layout.pie()
		.startAngle(-90 * Math.PI/180)
		.endAngle(-90 * Math.PI/180 + 2*Math.PI)
		.padAngle(.01)		
		.value(function(d) {return d.value;})
		//.sort(null);

	var arc = d3.svg.arc()
		.outerRadius(radius * 0.8)
		.innerRadius(radius * 0.4);

	var outerArc = d3.svg.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

//-------------------------------------------------------
	var key = function(d){ return d.data.label; };

	var dataListDomain = [];
	var dataListRange = [];
	var dataListFilteredCounts = {};

	var uniqueValues = 0;
	for (var i = 0, l = dataList.length; i < l; i++) { 
    	var item = dataList[i];
    	if(dataListFilteredCounts[item[sortValue]] === undefined){
    		uniqueValues++;
 			dataListDomain.push(item[sortValue]);   		
 			dataListRange.push(getRandomColor(uniqueValues));
    	}
    	dataListFilteredCounts[item[sortValue]] = (dataListFilteredCounts[item[sortValue]] || 0) + 1;
	}

	var color = d3.scale.ordinal()
		.domain(dataListDomain)
		.range(dataListRange);

	function populateData (){
		var labels = color.domain();
		return labels.map(function(label){
			return { label: label, value: dataListFilteredCounts[label] }
		});
	}

	change(populateData());

	// d3.select(".randomize")
	// 	.on("click", function(){
	// 		change(populateData());
	// 	});
//-------------------------------------------------------------------------------------

	function change(data) {

		/* ------- PIE SLICES -------*/
		var slice = svg.select(".slices").selectAll("path.slice")
			.data(pie(data), key);

		slice.enter()
			.insert("path")
			.style("fill", function(d) { return color(d.data.label); })
			.attr("class", "slice")
			.attr("id", function(d,i) { return pieSpecificId+"_sliceArc_" + i; }); //Give each slice a unique ID

		slice		
			.transition().duration(1000)
			.attrTween("d", function(d) {
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					return arc(interpolate(t));
				};
			})

		slice.exit()
			.remove();


		/* ------- TEXT CURVED LABELS -------*/

		if(curvedLabel){	

			var text = svg.select(".labels").selectAll("text")
				.data(pie(data), key);

			text.enter()
				.append("text")
				.attr("class","curvedLabelText")
				.attr("x", "5")
				.attr("dy", "-3")
				.append("textPath")
				//.attr("startOffset","50%")
				//.style("text-anchor","middle")
				.attr("xlink:href",function(d,i){return "#" + pieSpecificId + "_sliceArc_"+i;})
				.text(function(d) {
					return d.data.label;
				});
		}
		/* ------- TEXT LABELS -------*/
		else{
			var text = svg.select(".labels").selectAll("text")
				.data(pie(data), key);

			text.enter()
				.append("text")
				.attr("dy", ".35em")
				.text(function(d) {
					return d.data.label;
				});
			
			function midAngle(d){
				return d.startAngle + (d.endAngle - d.startAngle)/2;
			}

			text.transition().duration(1000)
				.attrTween("transform", function(d) {
					this._current = this._current || d;
					var interpolate = d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return function(t) {
						var d2 = interpolate(t);
						var pos = outerArc.centroid(d2);
						pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
						return "translate("+ pos +")";
					};
				})
				.styleTween("text-anchor", function(d){
					this._current = this._current || d;
					var interpolate = d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return function(t) {
						var d2 = interpolate(t);
						return midAngle(d2) < Math.PI ? "start":"end";
					};
				});

			text.exit()
				.remove();

			/* ------- SLICE TO TEXT POLYLINES -------*/

			var polyline = svg.select(".lines").selectAll("polyline")
				.data(pie(data), key);
			
			polyline.enter()
				.append("polyline");

			polyline.transition().duration(1000)
				.attrTween("points", function(d){
					this._current = this._current || d;
					var interpolate = d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return function(t) {
						var d2 = interpolate(t);
						var pos = outerArc.centroid(d2);
						pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
						return [arc.centroid(d2), outerArc.centroid(d2), pos];
					};			
				});
			
			polyline.exit()
				.remove();
		}
	};
}