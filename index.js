var map;
var circles = [];
var circleMarkers = [];
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
let totalMin = 1350
let range = 5
let minLower = totalMin - range
let minUpper = totalMin + range
var activeInfoWindow
let rangePercent = (2 * range) / (slider.max - slider.min)
var style = document.querySelector('[data="test"]');

output.innerHTML = "Between " + display(minLower) + " and " + display(minUpper);
style.innerHTML = ".slider::-webkit-slider-thumb { width: " + (rangePercent * 100) + "%" + " !important; }";



$(document).ready(function () {
    var handlesSlider = document.getElementById('test5');

    noUiSlider.create(handlesSlider, {
        start: [4000, 8000],
        range: {
            'min': [2000],
            'max': [10000]
        }
    });
});

function gridPoints() {
    let lastPoint
    for (let i = 0; i < allPoints.length; i++) {

        if (i == 0) {
            lastPoint = allPoints[i]
        }

        var $newdiv1 = $("<div class='pointPlots' id='point" + i + "'></div>")
        $(".pointPlot").append($newdiv1);

        let card = document.createElement('div');
        card.classList.add('card');

        //Create Text for each ride with Google API information from python code
        card.innerHTML = createPointCard(allPoints[i], i, lastPoint)
        $('#pointText').append(card);


        lastPoint = allPoints[i]
    }

    chartPoints();

}

function chartPoints() {

    let xAxis = []
    let durationDiffs = []

    let googleVelocities = []
    let cellVelocities = []

    for (let i = 1; i < allPoints.length; i++) {
        moment.tz.setDefault("America/New_York");
        var utcSeconds = allPoints[i]["gmtDateTime"];
        var date = moment.unix(utcSeconds).format('HH:mm:ss')

        var lastUtcSeconds = allPoints[i - 1]["gmtDateTime"];
        var lastDate = moment.unix(lastUtcSeconds).format('MM/DD: HH:mm:ss')

        timeFromLast = 0;

        timeFromLast = (utcSeconds - allPoints[i - 1]["gmtDateTime"]) / 60;


        var googleVelocity
        var cellVelocity
        if (allPoints[i]["distance"] == 0) {
            googleVelocity = 0;
            cellVelocity = 0;
        } else {
            googleVelocity = ((allPoints[i]["distance"] * 0.00062137) / (allPoints[i]["duration"] / 60 / 60)).toFixed(2)
            cellVelocity = ((allPoints[i]["distance"] * 0.00062137) / (timeFromLast / 60)).toFixed(2)
        }

        googleVelocities.push(googleVelocity)
        cellVelocities.push(cellVelocity)


        xAxis.push(lastDate + " - " + date);
        durationDiffs.push(((allPoints[i]["duration"] / 60) - timeFromLast).toFixed(2));

    }

    new Chart(document.getElementById("line-chart"), {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: [{
                data: durationDiffs,
                label: "Google estimated duration minus reported cell data duration.",
                borderColor: "#3e95cd",
                fill: true,
                pointBackgroundColor: "#ff0000"
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Comparison of Times'
            }
        }
    });
    var myChart = new Chart(document.getElementById("line-chart2"), {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: [{
                data: cellVelocities,
                label: "Implied cell velocities",
                borderColor: "#3e95cd",
                fill: true
            }, {
                data: googleVelocities,
                label: "Google implied velocities",
                borderColor: "#ff0000",
                fill: false
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Comparison of Times'
            },
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: 120,

                    }
                }]
            }
        }
    });

    document.getElementById("line-chart2").onclick = function (evt) {
        var activePoints = myChart.getElementAtEvent(event);

        // make sure click was on an actual point
        if (activePoints.length > 0) {
            var clickedDatasetIndex = activePoints[0]._datasetIndex;
            var clickedElementindex = activePoints[0]._index;
            var label = myChart.data.labels[clickedElementindex];
            var value = myChart.data.datasets[clickedDatasetIndex] //.data[clickedElementindex];     
            //   alert("Clicked: " + label + " - " + value);
            console.log(clickedElementindex)
        }
    };
}

var numGreaterThan = 0

function createPointCard(point, index, lastPoint) {
    moment.tz.setDefault("America/New_York");
    var utcSeconds = point["gmtDateTime"];
    var date = moment.unix(utcSeconds).format('dddd, MMMM Do, YYYY h:mm:ss A')
    timeFromLast = (utcSeconds - lastPoint["gmtDateTime"]) / 60

    let flagged = ""
    if (point["duration"] / 60 > timeFromLast) {
        flagged = "flagged"
        numGreaterThan++
    }

    let cardHTML = (`
                <div class="card-header ${flagged}" id=${"point" + (index + 1)}>
                    <div class="header-name">
                        <h3>${index + 1}) ${point["locationText"]} (approximate location)</h3>
                        <h3>${date}</h3>
                        <div id="content">
                        <div id="bodyContent">
                        <ul>
                        <li class="pointDetail" >Distance from last) ${point["distance"] * 0.00062137} miles</li>
                        <li class="pointDetail" >Est. Travel) ${(point["duration"]/60).toFixed(2)} minutes</li>
                        <li class="pointDetail" >Reported Time Between) ${timeFromLast.toFixed(2)} minutes</li>
                        </ul>
                        </div> 
                        </div>
                    </div>
                <i class="fas fa-caret-left"></i>
            </div>
        `);

    return cardHTML
}


function initMap() {
    map = new google.maps.Map(document.getElementById('cellLocationMap'), {
        center: {
            lat: 44.4600,
            lng: -73.1500
        },
        zoom: 12
    });

    var marker = new google.maps.Marker({
        position: {
            "lat": 44.465980,
            "lng": -73.120530
        },
        map: map,
        // title: point.patientName,
        // icon: icon,
        zIndex: 101
    });


    var alibi = new google.maps.Marker({
        position: {
            "lat": 44.496710,
            "lng": -73.125110
        },
        color: "blue",
        map: map,
        // title: ride.patientName,
        // icon: icon,
        zIndex: 101
    });


    drawCircles();
    gridPoints();

}

function drawCircles() {

    let color = '#FF0000'

    for (let i = 0; i < cellPoints.length; i++) {
        // Add the circle for this city to the map.

        var nums = cellPoints[i].Accuracy.match(/\d+/g);

        if (!nums) {
            continue;
        }

        var hms = cellPoints[i].Time; // your input string
        var a = hms.split(':'); // split it at the colons

        // Hours are worth 60 minutes.
        var minutes = (+a[0]) * 60 + (+a[1]) + (+a[2] / 60);

        if (minutes >= minLower && minutes <= minUpper) {
            color = 'green'
        } else if (minutes > minUpper) {
            color = 'blue'
        } else {
            color = 'red'
            continue;
        }

        // var m = moment(new Date());


        var cityCircle = new google.maps.Circle({
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.1,
            map: map,
            center: {
                lat: cellPoints[i].Latitude,
                lng: cellPoints[i].Longitude
            },
            radius: parseFloat(nums[0])
        });

        circles.push(cityCircle);

        let adjustCoordinates = getOffset(cellPoints[i].Longitude, parseFloat(nums[0]), cellPoints[i].Latitude)
        let adjLat = adjustCoordinates[0]
        let adjLong = adjustCoordinates[1]

        var icon = {
            url: "circleMarker.png",
            scaledSize: new google.maps.Size(22.5, 30),
            // origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(11.25, 20), // anchor
            labelOrigin: new google.maps.Point(12, 12)
        };

        var circleMarker = new google.maps.Marker({
            position: {
                "lat": adjLat,
                "lng":  adjLong,
            },
            color: "blue",
            label: {
                text: i.toString(),
                fontSize: "10px"
            },
            icon: icon,
            map: map,
            zIndex: 101
        });

        var infowindow = new google.maps.InfoWindow()

        circleMarker.html = 
        `<div class="infoWindow">
            <b>Timestamp:</b> <span>${cellPoints[i]["Date"]} - ${cellPoints[i]["Time"]} <br>
        </div>`

        google.maps.event.addListener(circleMarker, "click", (function(circleMarker) {
            return function(evt) {
              infowindow.setContent(this.html);
              infowindow.open(map, circleMarker);
            }
          })(circleMarker));


        circleMarkers.push(circleMarker)

    }

}

function getOffset(lon, radius, lat) {
     //Position, decimal degrees

    // let dw = Math.sqrt(radius^2/2)
    // let dn = dw

    let dw = radius * Math.cos(45)
    let dn = radius * Math.sin(45)

 //Earth’s radius, sphere
 let R=6378137

 //Coordinate offsets in radians
 let dLat = dn/R
 let dLon = dw/(R*Math.cos(Math.PI*lat/180))
 
 //OffsetPosition, decimal degrees
 let latO = lat + dLat * 180/Math.PI
 let lonO = lon - dLon * 180/Math.PI

 let coords = []
 coords.push(latO)
 coords.push(lonO)

 return coords
}

function removeAllcircles() {
    for (var i in circles) {
        circles[i].setMap(null);
    }
    circles = []; // this is if you really want to remove them, so you reset the variable.

    for (var i in circleMarkers) {
        circleMarkers[i].setMap(null);
    }
    circleMarkers = []; // this is if you really want to remove them, so you reset the variable.
}

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
    totalMin = Number(this.value)
    minLower = totalMin - range
    minUpper = totalMin + range
    output.innerHTML = "Between " + display(minLower) + " and " + display(minUpper);
    removeAllcircles()
    drawCircles();
}

function display(a) {
    var hours = Math.trunc(a / 60);
    let amPm = "";
    if (hours >= 12) {
        hours = hours - 12
        amPm = "pm"
    } else {
        amPm = "am"
    }
    var minutes = a % 60;
    return (hours + ":" + pad(minutes, 2) + amPm);
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}