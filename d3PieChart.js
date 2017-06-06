/// config contents
// elementID
function GenerateD3Pie(config){

	var pieTitle = config.title
	var pieLocationId = config.locationId;
	var sortValue = config.sortValue;
	var dataList = config.dataList;	
	var curvedLabel = false;
	
	if(config.curvedLabel === true || config.curvedLabel === false){
		curvedLabel = config.curvedLabel;
	}

	var width = $(pieLocationId).width();
	var height = $(pieLocationId).height();
	var radius = (Math.min(width, height) / 2) * 0.95;

	var testDataSet = [];	
	
	var uniqueValues = 0;
	for (var i = 0, l = dataList.length; i < l; i++) { 
    	var item = dataList[i];
    	var currentTypeIndex = findIndexOfSetByType(testDataSet, item[sortValue]);
    	if(currentTypeIndex === -1){
    		uniqueValues++;
 	
 			testDataSet.push({
				type: item[sortValue],
				data: [],
				value : 0,
				color: getRandomColor(uniqueValues)
			});

			currentTypeIndex = findIndexOfSetByType(testDataSet, item[sortValue]);
    	}

		var currentTypeIndex = findIndexOfSetByType(testDataSet, item[sortValue]); 

    	testDataSet[currentTypeIndex].data.push(item);
    	testDataSet[currentTypeIndex].value++;
	}

	function findIndexOfSetByType(dataSet, type){
		var types = dataSet.map(function(o) { return o.type; });
		return types.indexOf(type);
	}

	var dataSetTotal = sumArray(testDataSet.map(function(o) { return o.value; }));
	var dataSetDomain = testDataSet.map(function(o) { return o.type; });
	var dataSetRange = testDataSet.map(function(o) { return o.color; });
	var pieSpecificId = pieLocationId.replaceAll("#","").replaceAll(".","").replaceAll(" ","");

	//dataList = dataList.sort(compare);

	var sliceEventObj = {
        'mouseover': function(d, i, j) {
            pathAnim(d3.select(this), 1);

            svg.select('.value').text(function(donut_d) {
                return parseFloat(d.value.toFixed(1));
            });
            svg.select('.percentage').text(function(donut_d) {
                return parseFloat(((d.value/dataSetTotal)*100).toFixed(2)) + '%';
            });
        },
        
        'mouseout': function(d, i, j) {
            var thisPath = d3.select(this);
            
            if (!thisPath.classed('clicked')) {
                pathAnim(thisPath, 0);
            }   

            setCenterText();
        },

        'click': function(d, i, j) {
            if (0 === svg.selectAll('.clicked').length) {
                var thisCenterCircle = svg.select('.centerCircle');
                thisCenterCircle.on('click')();
            }

            var thisPath = d3.select(this);
            var clicked = thisPath.classed('clicked');
            pathAnim(thisPath, ~~(!clicked));
            thisPath.classed('clicked', !clicked);

            setCenterText();
        }
    };

	var centerEventObj = {
        'mouseover': function(d, i) {
            d3.select(this)
                .transition()
                .attr("r", radius * 0.61);
        },

        'mouseout': function(d, i) {
            d3.select(this)
                .transition()
                .duration(500)
                .ease('bounce')
                .attr("r", radius * 0.56);
        },

        'click': function(d, i) {
            var paths = svg.selectAll('.clicked');
            pathAnim(paths, 0);
            paths.classed('clicked', false);
            var centerCircle = d3.select(this);
            resetAllCenterText();
        }
    }


    var setCenterText = function() {
    	var selected = svg.selectAll('.clicked').data();

        var sum = d3.sum(svg.selectAll('.clicked').data(), function(d) {
            return d.data.value;
        });

        svg.select('.value')
            .text(function(d) {
                return parseFloat((sum)? sum.toFixed(1) : dataSetTotal.toFixed(1));
            });
        svg.select('.percentage')
            .text(function(d) {
                return (sum)? parseFloat(((sum/dataSetTotal)*100).toFixed(2)) + '%'
                            : '';
            });
    }

    var resetAllCenterText = function() {
        svg.selectAll('.value')
            .text(function(d) {
                return parseFloat(dataSetTotal.toFixed(1));
            });
        svg.selectAll('.percentage')
            .text('');
    }

    var pathAnim = function(path, dir) {
        switch(dir) {
            case 0: // normal size
                path.transition()
                    .duration(500)
                    .ease('bounce')
                    .attr('d', d3.svg.arc()
                        .innerRadius(radius * 0.7)
                        .outerRadius(radius * 0.9)
                    );
                break;

            case 1: // hover/clicked size(larger)
                path.transition()
                    .attr('d', d3.svg.arc()
                        .innerRadius(radius * 0.67)
                        .outerRadius(radius *0.95 )//* 1.08)
                    );
                break;
        }
    }


//-------------------------------------------------------------------------------------

	var svg = d3.select(pieLocationId)
		//.data(dataList.types)
		.data(testDataSet)
		.append("svg")
		.append("g")
		.attr("class", "donut");

	svg.append("g")
		.attr("class", "slices");
	svg.append("g")
		.attr("class", "labels");

	// svg.append("g").attr("class", "pieChartTitle")
	// 	.append("text")
	// 	.attr("text-anchor", "middle")   		
 //   		.text(pieTitle);	

//----------------CENTER CIRCLE----------------------   
	
	svg.append("circle")
		.attr("class", "centerCircle")
        .attr("r", radius * 0.56)
        .style("fill", "#E7E7E7")
        .on(centerEventObj);

    svg.append('text')
            .attr('class', 'center-txt type')
            .attr('y', radius * -0.16)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text(pieTitle);
            // .text(function(d, i) {
            //     return d.type;
            // });
    svg.append('text')
            .attr('class', 'center-txt value')
            .attr('text-anchor', 'middle');
    svg.append('text')
            .attr('class', 'center-txt percentage')
            .attr('y', radius * 0.16)
            .attr('text-anchor', 'middle')
            .style('fill', '#A2A2A2');
  //-------------------------------------------------------


	var pie = d3.layout.pie()
		.startAngle(-90 * Math.PI/180)				// turn pie 90 degrees to start the pie on the left center
		.endAngle(-90 * Math.PI/180 + 2*Math.PI)	// turn pie 90 degrees to end the pie on the left center
		.padAngle(.01)		
		.value(function(d) {return d.value;})
		//.sort(null);

	var arc = d3.svg.arc()
		// .outerRadius(radius * 0.8)
		// .innerRadius(radius * 0.4);
		.innerRadius(radius * 0.7)
        .outerRadius(radius * 0.9);
        // .outerRadius(function() {
        //     return (d3.select(this).classed('clicked'))? radius * 0.9 : radius *0.7; 
        // });

	var outerArc = d3.svg.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

//-------------------------------------------------------
	var key = function(d){ 
		return d.data.label; 
	};

	
	var color = d3.scale.ordinal()
		.domain(dataSetDomain)
		.range(dataSetRange);

	function populateData (){
		 var labels = testDataSet;
		//var labels = dataList.types;
		return labels.map(function(obj){
			return { label: obj.type, value: obj.value, data: obj.data};
			//return { label: obj.name, value: obj.total, data: obj.data};
		});
	}

	change(populateData());

//-------------------------------------------------------------------------------------

	function change(data) {

		/* ------- PIE SLICES -------*/
		var slice = svg.select(".slices").selectAll("path.slice")
			.data(pie(data));

		slice.enter()
			.insert("path")
			.style("fill", function(d) { 
				return color(d.data.label); 
			})
			.attr("class", "slice")
			.attr("id", function(d,i) { return pieSpecificId+"_sliceArc_" + i; }) //Give each slice a unique ID
			.on(sliceEventObj);

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

		setCenterText();


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