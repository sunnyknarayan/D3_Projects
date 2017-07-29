function createMostStolenMap(divId, usMap, vehicleTheftData) {
    var width = 960,
	height = 500;

    var svgmap = d3.select(divId).append("svg")
	.attr("width", width)
	.attr("height", height);

    var projection = d3.geo.albersUsa()
	.scale(1000)
	.translate([width / 2, height / 2]);

    var path = d3.geo.path()
	.projection(projection);
	
	var match=d3.map();
	vehicleTheftData.forEach(function(d){ match.set(d.state, d.rankings[0].model);})
	console.log(match);	

    var vehiclename = _.uniq(vehicleTheftData.map(function(d){return d.rankings[0].model ;}))
    
	var mapcolor = d3.scale.category10().domain(vehiclename);
	
	
	var legend = svgmap.selectAll(".legend")
	.data(vehiclename)
	.enter().append("g")
	.attr("class", "legend")
	.attr("transform", function(d,i) { return "translate(0," + (height - 20 - 20*i) + ")";});

    legend.append("rect")
	.attr("x", width-20)
	.attr("width", 16)
	.attr("height", 16)
	.style("fill", mapcolor)

    legend.append("text")
	.attr("x", width-24)
	.attr("y", 13)
	.attr("text-anchor", "end")
	.text(function(d) { return d;})
    
	
    
    svgmap.append("g")
	.selectAll("path")
	.data(topojson.feature(usMap, usMap.objects.usStates).features)
	.enter().append("path")
	.attr("d", path)
	.style("fill", function(d) {return mapcolor(match.get(d.properties.NAME));})
	.attr("class", "state-boundary")
}

function create2013ChangeMap(divId, usMap, vehicleTheftData) {
    var width = 1000,
	height = 600;

    var svg = d3.select(divId).append("svg")
	.attr("width", width)
	.attr("height", height);

    var projection = d3.geo.albersUsa()
	.scale(1000)
	.translate([width / 2, height / 2]);

	var match=d3.map();
	vehicleTheftData.forEach(function(d){ match.set(d.state, +d.change);})
	console.log(match);	

    var vehiclename1 = _.uniq(vehicleTheftData.map(function(d){return d.change ;}))	
	
    var path = d3.geo.path()
	.projection(projection);


    var colExtent = d3.extent(match.values());

    var color;

    // change this variable to switch between continuous and segmented
    var continuous = false;
    if (continuous) {
	// -- continuous colormap --
	color = d3.scale.linear()
    	    .domain(colExtent)
    	    .range(["rgb(255,255,204)", "rgb(0,104,55)"])
    	    .interpolate(d3.interpolateHcl);
    } else {
	// -- segmented colormap --
	var color = d3.scale.quantize()
	    .domain(colExtent)
	    .range(d3.range(5).map(function(i) { return "q" + i + "-5"; }));
    }

    var states = svg.append("g")
	.attr("class", "YlGn")
	.selectAll("path")
	.data(topojson.feature(usMap, usMap.objects.usStates).features)
	.enter().append("path")
	.attr("d", path)

    if (continuous) {
	states.attr("class", "state-boundary")
	    .style("fill", function(d) { return color(match.get(d.properties.NAME)); })
    } else {
	states.attr("class", function(d) {
	    return "state-boundary " + color(match.get(d.properties.NAME));})
    }

    var legendSize = 150;
    var numLevels;
    if (continuous) {
	numLevels = 150;
    } else {
	numLevels = 5;
    }
    var legend = svg.append("g").attr("class", "YlGn");
    var levels = legend.selectAll("levels")
    	.data(d3.range(numLevels))
    	.enter().append("rect")
    	.attr("x", function(d) { return width - legendSize - 20 +
    				 d*legendSize/numLevels;})
    	.attr("y", height-20)
    	.attr("width", legendSize/numLevels)
    	.attr("height", 16)
    	.style("stroke", "none");

    if (continuous) {
    	levels.style("fill", function(d) {
    	    return color(colExtent[0] * (legendSize-d)/legendSize +
        		 colExtent[1] * d/legendSize); })
    } else {
	levels.attr("class", function(d) { return "q" + d + "-" + numLevels; })
    }

    legend.append("text")
    	.attr("x", width - legendSize - 60)
    	.attr("y", height - 24)
    	.attr("text-anchor", "middle")
    	.text(colExtent[0])

    legend.append("text")
    	.attr("x", width - 20)
    	.attr("y", height - 24)
    	.attr("text-anchor", "middle")
    	.text(colExtent[0])

    legend.append("text")
    	.attr("x", width - legendSize/2 - 90)
    	.attr("y", height - 40)
    	.attr("text-anchor", "middle")
    	.text("Change in Motor Vehicle Theft from 2012 to 2013")
    
}


function processData(errors, usMap, vehicleTheftData) {
    console.log("Errors", errors)
    createMostStolenMap("#most-stolen", usMap, vehicleTheftData);
    create2013ChangeMap("#change", usMap, vehicleTheftData);
}

 queue()
    .defer(d3.json, "http://www.cis.umassd.edu/~dkoop/cis467/us-states.json")
    .defer(d3.json, "http://www.cis.umassd.edu/~dkoop/cis467/vehicle-theft.json")
    .await(processData);
