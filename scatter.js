var parentDiv = document.getElementById("scatter");
var margin = { top: 0, right: 0, bottom: 0, left: 0 },
 
outerWidth = parentDiv.clientWidth,
    outerHeight = parentDiv.clientHeight,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .range([0, width]).nice();

var y = d3.scaleLinear()
    .range([height, 0]).nice();

var xCat = "x",
    yCat = "y",
    colorCat = "nationality";

d3.json(dataPath, function (data) {
    
    var xMax = d3.max(data, function (d) { return d[xCat]; }),
        xMin = d3.min(data, function (d) { return d[xCat]; }),
        xMin = xMin > 0 ? 0 : xMin,
        yMax = d3.max(data, function (d) { return d[yCat]; }),
        yMin = d3.min(data, function (d) { return d[yCat]; }),
        yMin = yMin > 0 ? 0 : yMin;
        xRange = xMax - xMin;
        yRange = yMax - yMin;
        xOffset = xRange * 0.05;
        yOffset = yRange * 0.05;
        
    x.domain([xMin - xOffset, xMax + xOffset]);
    y.domain([yMin - yOffset, yMax + yOffset]);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var zoomBeh = d3.zoom()
        .scaleExtent([1, 3])
        .translateExtent([[-1.5*width, -1.5*height], [1.5*width, 1.5*height]])
        .on("zoom", zoom);

    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .attr("transform", "translate(-15, 0)")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoomBeh);

    //svg.call(tip);

    var view = svg.append("rect")
        .attr("width", width)
        .attr("height", height);

    var objects = svg.append("svg")
        .classed("objects", true)
        .attr("width", width)
        .attr("height", height);

    objects.selectAll(".dot")
        .data(data)
        .enter().append("svg:image")
        .attr("xlink:href", function(d) { return d['flag']; })
        .attr("width", 20)
        .attr("height", 20)
        .attr("class", "dot")
        .attr("transform", transform)
        .on("mouseover", function(d) {
            div.style("opacity", .9);
            div.html('<div class="container">' +
                        '<div class="row">' +
                            '<div class="col-sm-9 text-center">' +
                                '<img class="center-block" src="' + d.photo + '" />' + 
                            '</div>' + 
                            '<div class="col-sm-3 text-center">' +
                                '<img class="center-block" src="' + d.flag + '" />' + 
                                '<img class="center-block" src="' + d.club_logo + '" />' + 
                            '</div>' + 
                        '</div>' + 
                        '<div class="row">' +
                            '<div class="col-sm-12 text-center tip-name">' + d.name + '</div>' +
                        '</div>' + 
                        '<div class="row">' +
                            '<div class="col-sm-6 tip-skill-label">Nationality</div>' +
                            '<div class="col-sm-6 tip-skill-value">' + d.nationality + '</div>' +
                        '</div>' + 
                        '<div class="row">' +
                            '<div class="col-sm-6 tip-skill-label">Club</div>' +
                            '<div class="col-sm-6 tip-skill-value">' + d.club + '</div>' +
                        '</div>' + 
                        '<div class="row">' +
                            '<div class="col-sm-6 tip-skill-label">Age</div>' +
                            '<div class="col-sm-6 tip-skill-value">' + d.age + '</div>' +
                        '</div>' + 
                        '<div class="row">' +
                            '<div class="col-sm-6 tip-skill-label">Overall</div>' +
                            '<div class="col-sm-6 tip-skill-value">' + d.overall + '</div>' +
                        '</div>' + 
                        '<div class="row">' +
                            '<div class="col-sm-6 tip-skill-label">Potential</div>' +
                            '<div class="col-sm-6 tip-skill-value">' + d.potential + '</div>' +
                        '</div>' + 
                        '<div class="row">' +
                            '<div class="col-sm-6 tip-skill-label">Value</div>' +
                            '<div class="col-sm-6 tip-skill-value">&euro;' + d.value + 'M</div>' +
                        '</div>' + 
                        '<div class="row">' +
                            '<div class="col-sm-6 tip-skill-label">Wage</div>' +
                            '<div class="col-sm-6 tip-skill-value">&euro;' + d.wage + 'K</div>' +
                        '</div>' + 
                    '</div>'
                )     
                .style("left", (d3.event.pageX + 25) + "px")             
                .style("top", (d3.event.pageY) + "px");
            })
        .on("mouseout", function(d) {
            div.style("opacity", 0);
        });

    function zoom() {
        svg.attr("transform", d3.event.transform);
    }

    function transform(d) {
        return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
    }
});
