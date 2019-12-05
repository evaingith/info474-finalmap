'use strict';

(function() {
    var data = 'no data';
    var width = 1500;
    var height = 900;
    var svg = "";
    let geoPath = '';
    var albersProjection = '';
    var g = '';

    window.onload = function() {
        svg = d3.select('body')
                .append('svg')
                .attr('width', width)
                .attr('height', height)

        d3.json('la.json')
            .then((data) => makeMap(data));
    }

    function makeMap(mData) {
        data = mData;
        g = svg.append('g');

        albersProjection = d3.geoAlbers()
                                .scale(79000)
                                .rotate([118, 0])
                                .center([0, 34])
                                .translate([width /1.1, height/1.9]);

        geoPath = d3.geoPath()
                    .projection(albersProjection);

        g.selectAll('circle')
            .data(data.features)
            .enter()
            .append('path')
            .attr("class", "coord")
            .attr('fill', "#F5F5F5")
            .attr('stroke', "#4E79A7")
            .attr('d', geoPath);

        d3.csv("dataOnly.csv")
            .then((data) => makeScatterPlot(data));  
            makeLabels();
    }

    function makeScatterPlot(csvData) {
        data = csvData // assign data as global variable
        geoPath = d3.geoPath()
                    .projection(albersProjection);
        // get arrays of fertility rate data and life Expectancy data
        let pointData = data.map((row) => {
            let leng = row["Location "].length;
            let str= [row["Location "].substring(1, leng-1).split(',')]
            return [parseFloat(str[0][1]),parseFloat(str[0][0])]
        });

        const links = [];
        for (let i = 0; i < pointData.length - 1; i++) {
            const start=pointData[i];
            links.push({
                type:"Point",
                coordinates:[start[0],start[1]],
                'Crime Code Description': data[i]['Crime Code Description'],
                'Weapon Description': data[i]['Weapon Description'],
                'Premise Description': data[i]['Premise Description']  
                
            }) 
        }
        let div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
        var dots = g.selectAll("circle")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "coord")
            .attr('r', 2)
            .style("opacity", 0.5)
            .attr('fill', "#4E79A7")
            .attr("d", geoPath)
            .on("mouseover", (d) => {
                div.transition()
                  .duration(200)
                  .style("opacity", .9);
                div.html("Premise: " + d['Premise Description'])
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");
              })
              .on("mouseout", (d) => {
                div.transition()
                  .duration(500)
                  .style("opacity", 0);
              });



            var dropDown = d3.select("#filter").append("select");
      dropDown.selectAll("option")
                            .data(d3.map(data, function(d){return d['Crime Code Description'];}).keys())
                            .enter()
                            .append("option")
                            .text(function (d) { return d;})
                            .attr("value", function (d) { return d; });

            
      dropDown.on("change", function() {
        var selected = this.value;

        dots.filter(function(d) {return selected != d['Crime Code Description'];
        })
            .attr("display", 'none');
            
        dots.filter(function(d) {return selected == d['Crime Code Description'];})
            .attr("display", 'inline');
        });   

      }
      function makeLabels() {
        svg.append('text')
          .attr('x', 150)
          .attr('y', 640)
          .style('font-size', '20pt')
          .text("Crime in Los Angeles - Crime & Premise Description");
      }
      

})();
