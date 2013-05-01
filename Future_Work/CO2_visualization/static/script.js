console.log('loaded script.js');

function handleResponse(data){
    console.log('Got from server' + data);
    var json_objects = jQuery.parseJSON(data)
    //var json_objects = data;
    console.log(json_objects);

var parseDate = d3.time.format("%d-%b-%Y").parse;

mdata = json_objects.record.slice(-18);
//console.log(mdata);
mdata.forEach(function(d) {
    //console.log(d);
    //console.log(parseDate(d.date));
    d.date = parseDate(d.date);
    d.data = +d.data;
  });


var margin = {top: 20, right: 30, bottom: 80, left: 50},
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var area = d3.svg.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.data); });

var svg = d3.select(".graficas").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  x.domain(d3.extent(mdata, function(d) { return d.date; }));
  y.domain([d3.min(mdata, function(d) { return d.data; }), d3.max(mdata, function(d) { return d.data; })]);

  svg.append("path")
      .datum(mdata)
      .attr("class", "area")
      .attr("d", area);

  svg.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);


  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("CO2 Levels in the environment (ppm)");
    
// select all the text elements for the xaxis
   svg.selectAll(".xaxis text") 
       .attr("transform", function(d) {
	   return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
       });
    
    return svg;
}


function handleClick(e){
    var text = $('#text').val();
    console.log('user typed' + text);
    $.ajax('/rpc', {
	type: 'POST',
	data: {
	    text: text
	},
	success: handleResponse
    });
}

$(document).ready(function(){
    $('#submitBtn').click(handleClick);    
})


