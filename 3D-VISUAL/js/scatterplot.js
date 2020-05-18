function scatterplot(target) {
    //var d3 = target.append("d3.v3.min.js")
    var x3d = target.append("x3d")
        .style("width", parseInt(target.style("width")) + "px")
        .style("height", parseInt(target.style("height")) + "px")
        .style("border", "none");
            
    var scene = x3d.append("scene");

    scene.append("orthoviewpoint")
         .attr("centerOfRotation", [5, 5, 5])
         .attr("fieldOfView", [-5, -5, 15, 15])
         .attr("orientation", [-0.5, 1, 0.2, 1.12 * Math.PI / 4])
         .attr("position", [8, 4, 15]);

    var rows = initializeDataGrid();
    var axisRange = [0, 10];
    var scales = [];
    var initialDuration = 0;
    var defaultDuration = 900;
    var ease = "linear";
    var time = 0;
    var axisKeys = ["x", "MW", "z"];
    var xdomin=[1500,2500];
    var zdomin=[580,606];
    var ydomin=[600,1000];
    
    

    // Helper functions for initializeAxis() and drawAxis()
    function axisName(name, axisIndex) {
        return ["x", "MW", "z"][axisIndex] + name;
    }

    function constVecWithAxisValue(otherValue, axisValue, axisIndex) {
        var result = [otherValue, otherValue, otherValue];
        result[axisIndex] = axisValue;
        return result;
    }

    // Used to make 2d elements visible
    function makeSolid(selection, color) {
        selection.append("appearance").append("material").attr("diffuseColor", color || "black")
        return selection;
    }

    // Initialize the axes lines and labels
    function initializePlot() {
        initializeAxis(0);
        initializeAxis(1);
        initializeAxis(2);
    }

    function initializeAxis( axisIndex )
  {
    var key = axisKeys[axisIndex];
    drawAxis( axisIndex, key, initialDuration );

    var scaleMin = axisRange[0];
    var scaleMax = axisRange[1];

    // the axis line
    var newAxisLine = scene.append("transform")
         .attr("class", axisName("Axis", axisIndex))
         .attr("rotation", ([[0,0,0,0],[0,0,1,Math.PI/2],[0,1,0,-Math.PI/2]][axisIndex]))
      .append("shape")
    newAxisLine
      .append("appearance")
      .append("material")
        .attr("emissiveColor", "lightgray")
    newAxisLine
      .append("polyline2d")
         // Line drawn along y axis does not render in Firefox, so draw one
         // along the x axis instead and rotate it (above).
        .attr("lineSegments", "0 0," + scaleMax + " 0")

   // axis labels
   var newAxisLabel = scene.append("transform")
       .attr("class", axisName("AxisLabel", axisIndex))
       .attr("translation", constVecWithAxisValue( 0, scaleMin + 1.1 * (scaleMax-scaleMin), axisIndex ))

   var newAxisLabelShape = newAxisLabel
     .append("billboard")
       .attr("axisOfRotation", "0 0 0") // face viewer
     .append("shape")
     .call(makeSolid)

   var labelFontSize = 0.6;

   newAxisLabelShape
     .append("text")
       .attr("class", axisName("AxisLabelText", axisIndex))
       .attr("solid", "true")
       .attr("string", key)
    .append("fontstyle")
       .attr("size", labelFontSize)
       .attr("family", "SANS")
       .attr("justify", "END MIDDLE" )
  }

  // Assign key to axis, creating or updating its ticks, grid lines, and labels.
   function drawAxis( axisIndex, key, duration ) {

    var scale = d3.scale.linear()
      .domain(ydomin) // demo data range
      .range( axisRange )
    if (axisIndex == 0) {
        scale = d3.scale.linear()
        .domain(xdomin)
        .range( [0,10] )
    } 
   if (axisIndex == 2) {
        scale = d3.scale.linear()
        .domain(zdomin)
        .range( [0,10] )
    } 
    scales[axisIndex] = scale;

    var numTicks = 8;
    var numTicksx = 25; 
    var numTicksz = 26; 
    var tickSize = 0.1;
    var tickFontSize = 0.5;

    // ticks along each axis
    var ticks = scene.selectAll( "."+axisName("Tick", axisIndex) )
       .data( scale.ticks( numTicks ));
    if (axisIndex == 0) {
        ticks = scene.selectAll( "."+axisName("Tick", axisIndex) )
       .data( scale.ticks( numTicksx ));
    } 
      if (axisIndex == 2) {
        ticks = scene.selectAll( "."+axisName("Tick", axisIndex) )
       .data( scale.ticks( numTicksz ));
    } 
    var newTicks = ticks.enter()
      .append("transform")
        .attr("class", axisName("Tick", axisIndex));
    newTicks.append("shape").call(makeSolid)
      .append("box")
        .attr("size", tickSize + " " + tickSize + " " + tickSize);
    // enter + update
    ticks.transition().duration(duration)
      .attr("translation", function(tick) { 
         return constVecWithAxisValue( 0, scale(tick), axisIndex ); })
    ticks.exit().remove();

    // tick labels
    var tickLabels = ticks.selectAll("billboard shape text")
      .data(function(d) { return [d]; });
    var newTickLabels = tickLabels.enter()
      .append("billboard")
         .attr("axisOfRotation", "0 0 0")     
      .append("shape")
      .call(makeSolid)
    newTickLabels.append("text")
      .attr("string", scale.tickFormat(10))
      .attr("solid", "true")
      .append("fontstyle")
        .attr("size", tickFontSize)
        .attr("family", "SANS")
        .attr("justify", "END MIDDLE" );
    tickLabels // enter + update
      .attr("string", scale.tickFormat(10))
    tickLabels.exit().remove();

    // base grid lines
    if (axisIndex==0 || axisIndex==2) {

      var gridLines = scene.selectAll( "."+axisName("GridLine", axisIndex))
         .data(scale.ticks( numTicksx ));
      gridLines.exit().remove();
      
        if (axisIndex==2){
            gridLines = scene.selectAll( "."+axisName("GridLine", axisIndex))
            .data(scale.ticks( numTicksz ));
            gridLines.exit().remove();
        }
        
      var newGridLines = gridLines.enter()
        .append("transform")
          .attr("class", axisName("GridLine", axisIndex))
          .attr("rotation", axisIndex==0 ? [0,1,0, -Math.PI/2] : [0,0,0,0])
        .append("shape")

      newGridLines.append("appearance")
        .append("material")
          .attr("emissiveColor", "gray")
      newGridLines.append("polyline2d");

      gridLines.selectAll("shape polyline2d").transition().duration(duration)
        .attr("lineSegments", "0 0, " + axisRange[1] + " 0")

      gridLines.transition().duration(duration)
         .attr("translation", axisIndex==0
            ? function(d) { return scale(d) + " 0 0"; }
            : function(d) { return "0 0 " + scale(d); }
          )
    }  
  }

    // Update the data points (spheres) and stems.
    function plotData(duration) {
        
        if (!rows) {
            console.log("no rows to plot.")
            return;
        }

        var x = scales[0], MW = scales[1], z = scales[2];
        var sphereRadius = 0.1 + Math.random();

        var datapoints = scene.selectAll(".datapoint").data(rows);
        datapoints.exit().remove();

        var newDatapoints = datapoints.data(rows).enter()
            .append("transform")
            .attr("class", "datapoint")
            .attr("scale", function(d, i) {
                var r = 0.1 ;
                return [r, r, r]; //[0.1 + Math.random(), 0.1 + Math.random(), 0.1 + Math.random()];
            })
            .append("shape")
            .attr("id", function(d, i) { return "shape-" + i; })
            .attr("data-state", "unclicked")
            .attr("data-id", function(d, i) { return i; });
        newDatapoints//appearance
            .append("appearance")
            .append("material")
            .attr("id", function(d, i) { return "material-" + i; })
            .attr("data-id", function(d, i) { return i; });
        newDatapoints
            .append("sphere");
             // Does not work on Chrome; use transform instead
             //.attr("radius", sphereRadius)

        datapoints.selectAll("shape appearance material")
            .attr("diffuseColor", function(d, i) {
                var m = d3.select(this);
                m.attr("ambientIntensity", "1.0");
                m.attr("shininess", "1.0");
                if (m.attr("diffuseColor") === "yellow") { return "yellow"; }
                return "dodgerblue";
            });
        
        datapoints.transition().ease(ease).duration(duration)
            .attr("translation", function(row) { return x(row[axisKeys[0]]) + " " + MW(row[axisKeys[1]]) + " " + z(row[axisKeys[2]])});
        
        
        //shangmian
        
        function mouseoverColor() {
            
            var s = d3.select(this);
            // console.log("\nShape:", s);
            
            var id = s.attr("data-id");
            // console.log("ID:", id);
            
            var state = s.attr("data-state");
            //console.log("State:", state);
            if (state === "clicked") { return false; }
            
            var m = d3.select("#material-" + id);
            // console.log("Material:", m);
            if (m.attr("diffuseColor") === "yellow") { m.attr("diffuseColor", "dodgerblue"); } else { m.attr("diffuseColor", "yellow"); }
        }
        d3.selectAll("shape").on("mouseover", mouseoverColor);
        
        function mouseoutColor() {
            
            var s = d3.select(this);
            // console.log("\nShape:", s);
            
            var id = s.attr("data-id");
            // console.log("ID:", id);
            
            var m = d3.select("#material-" + id);
            // console.log("Material:", m);
            
            var state = s.attr("data-state");
            console.log("State:", state);
            if (state === "clicked" || m.attr("diffuseColor") === "dodgerblue") { return false; }
            if (m.attr("diffuseColor") === "yellow") { m.attr("diffuseColor", "dodgerblue"); } else { m.attr("diffuseColor", "yellow"); }
        }
        d3.selectAll("shape").on("mouseout", mouseoutColor);
        
        function changeState() {
            
            var s = d3.select(this);
            // console.log("\nShape:", s);
            
            var id = s.attr("data-id");
            // console.log("ID:", id);
            
            var m = d3.select("#material-" + id);
            // console.log("Material:", m);
            
            var state = s.attr("data-state");
            // console.log("State:", state);
            
            if (state === "clicked") {
                s.attr("data-state", "unclicked");
                m.attr("diffuseColor", "dodgerblue");
            } else {
                s.attr("data-state", "clicked");
                m.attr("diffuseColor", "yellow");
            }
        }
        d3.selectAll("shape").on("click", changeState);
        
      /* var stems = scene.selectAll(".stem").data(rows);
        stems.exit().remove();
        var newStems = stems.enter()
            .append("transform")
            .attr("class", "stem")
            .append("shape");
        newStems
            .append("appearance")
            .append("material")
            .attr("emissiveColor", "gray");
        newStems
            .append("polyline2d")
            .attr("lineSegments", function(row) { return "0 1, 0 0"; });
        stems.transition().ease(ease).duration(duration)
            .attr("translation", function(row) { return x(row[axisKeys[0]]) + " 0 "  + z(row[axisKeys[2]]); })
            .attr("scale", function(row) { return [1, y(row[axisKeys[1]])]; });*/
        
        document.getElementById("time").setAttribute("data-count", "0");
    }

    
    function initializeDataGrid() {
        var rows = [];
        // Follow the convention where y(x,z) is elevation.
        
        
         d3.csv("hope.csv",function(error,csvdata){
		
			if(error){
				alert("Error loading data :( ");
                console.error(error);
			}
            else{
                for(var i=0;i<csvdata.length;i++){
                    var yset;
                    var date;
                    yset=csvdata[i].MW;
                    var setz = csvdata[i].THRTEMP;
                    var setx = csvdata[i].FWFLOW;
                    rows.push({ x: setx , MW: yset, z: setz });
                }
			//console.log(csvdata);	
            }
		});
        
        return rows;

    }

    function updateData() {
        time += Math.PI / 8;
        if (x3d.node() && x3d.node().runtime) {
            var s1 = document.getElementById("s1").value;
            var s2 = document.getElementById("s2").value;
            var ms = document.getElementById("MS").value;
            var b = document.getElementById("time");
            var c = parseInt(b.getAttribute("data-count"));
            console.log(s2);
            //console.log(s2);
            //console.log(time);
            if (c > 0) {
                
                d3.csv("hope.csv",function(error,cdata){
		            if(error){
				        alert("Error loading data :( ");
                        console.error(error);
			         }
                     else{
                         if(s1=="FWFLOW"){
                                xdomin = [1500,2500];
                            }
                            if(s1=="TAF"){
                                xdomin = [2300,3700];
                            }
                            if(s1=="YRHRPRS"){
                                xdomin = [6.5,10];
                            }
                            if(s1=="YRHRTEMPT"){
                                xdomin = [580,606];
                            }
                            if(s1=="O2"){
                                xdomin = [2,4.5];
                            }
                            if(s1=="THRTEMP"){
                                xdomin = [580,606];
                            }
                            if(s1=="MSP"){
                                xdomin = [20,32];
                            }
                         
                            if(s2=="FWFLOW"){
                                zdomin = [1500,2500];
                            }
                            if(s2=="TAF"){
                                zdomin = [2300,3700];
                            }
                            if(s2=="YRHRPRS"){
                                zdomin = [6.5,10];    
                            }
                            if(s2=="YRHRTEMPT"){
                                zdomin = [580,606];
                            }
                            if(s2=="O2"){
                                zdomin = [2,4.5];
                            }
                            if(s2=="THRTEMP"){
                                zdomin = [580,606];
                            }
                            if(s2=="MSP"){
                                zdomin = [20,32];
                            }
                            if(s2=="Angle"){
                                zdomin = [50,65];
                            }
                            
                            if(ms=="All")
                                ydomin = [600,1000];
                            if(ms=="B6")
                                ydomin = [600,700];
                            if(ms=="B7")
                                ydomin = [700,800];
                            if(ms=="B8")
                                ydomin = [800,900];
                            if(ms=="B9") 
                                ydomin = [900,1000];
                        for(var j=0;j<cdata.length;j++){
                            var yc,zc,xc;
                            var date;
                            yc=cdata[j].MW;
  
                            if(s1=="FWFLOW"){
                                xc = cdata[j].FWFLOW;
                            }
                            if(s1=="TAF"){
                                xc = cdata[j].TAF;
                            }
                            if(s1=="YRHRPRS"){
                                xc = cdata[j].YRHRPRS;
                            }
                            if(s1=="YRHRTEMPT"){
                                xc = cdata[j].YRHRTEMPT;
                            }
                            if(s1=="O2"){
                                xc = cdata[j].O2;
                            }
                            if(s1=="THRTEMP"){
                                xc = cdata[j].THRTEMP;
                            }
                            if(s1=="MSP"){
                                xc = cdata[j].MSP;
                            }
                            
                            if(s2=="FWFLOW"){
                                zc = cdata[j].FWFLOW;
                            }
                            if(s2=="TAF"){
                                zc = cdata[j].TAF;
                            }
                            if(s2=="YRHRPRS"){
                                zc = cdata[j].YRHRPRS; 
                            }
                            if(s2=="YRHRTEMPT"){
                                zc = cdata[j].YRHRTEMPT;
                            }
                            if(s2=="O2"){
                                zc = cdata[j].O2;
                            }
                            if(s2=="THRTEMP"){
                                zc = cdata[j].THRTEMP;
                            }
                            if(s2=="MSP"){
                                zc = cdata[j].MSP;
                            }
                            if(s2=="Angle"){
                                zc = cdata[j].HHA81AS001XQ01;
                            }
                            
                            if(ms=="B6"&&(yc<600||yc>700)){
                                yc=0;
                                xc=0;
                                zc=0;
                            }
                            if(ms=="B7"&&(yc<700||yc>800)){
                                yc=0;
                                xc=0;
                                zc=0;
                            }
                            if(ms=="B8"&&(yc<800||yc>900)){
                                yc=0;
                                xc=0;
                                zc=0;
                            }
                            if(ms=="B9"&&(yc<900||yc>1000)){
                                yc=0;
                                xc=0;
                                zc=0;
                            }
                            
                            //var xc = cdata[j].s2;  
                            rows[j].x =xc;
                            rows[j].z =zc;
                            rows[j].MW =yc;
                            //rows.push({ x: xc , y: yc, z: zc });
                        }
			         console.log(rows);	
                    }
		        });

                initializePlot();
                plotData(defaultDuration);
            }
            initializePlot();
            plotData(defaultDuration);
            
        } else {
            console.log("x3d not ready.");
        }
    }

    function timeLapse() {
        var b = document.getElementById("time");
        var c = parseInt(b.getAttribute("data-count"));
        if (c > 0) {
            b.setAttribute("data-count", "0");
        } else {
            b.setAttribute("data-count", "1");
            updateData();
        }
    }
    document.getElementById("time").addEventListener("click", timeLapse);
                
                
    
    function clearHighlighting() {
        var s = d3.select("scene");
        var d = scene.selectAll(".datapoint");
        d.selectAll("shape appearance material").attr("diffuseColor", "dodgerblue");
    }
    document.getElementById("clear").addEventListener("click", clearHighlighting);
    
    initializeDataGrid();
    initializePlot();
    setInterval(updateData, defaultDuration);
}
function init() {
    d3.select("html").style("height", "100%").style("width", "100%");
    d3.select("body").style("height", "100%").style("width", "100%");
    document.getElementById("plot").innerHTML = "";
    d3.select("#plot").style("width", "80%").style("float", "right").style("height", "600px").style("margin", "0 auto");
    d3.select("#time").style("padding", "8px 16px").style("cursor", "pointer").style("margin-right", "16px");
    d3.select("#clear").style("padding", "8px 16px").style("cursor", "pointer");
    d3.select("#wrapper").style("margin", "0 auto").style("width", "80%").style("float", "right");
    scatterplot(d3.select("#plot"));
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", init);
