var map;
var circles = [];
var circleMarkers = [];
var slider = document.getElementById("myRange");
var rangeText = document.getElementById("range");
var rangeTextDesc = document.getElementById("rangeDesc");
let totalMin = 1350
let range = 5
let minLower = totalMin - range
let minUpper = totalMin + range
var activeInfoWindow
let rangePercent = (2 * range) / (slider.max - slider.min)
var style = document.querySelector('[data="test"]');

rangeText.innerHTML = "Between " + display(minLower) + " and " + display(minUpper);
rangeTextDesc.innerHTML = `(Points in this ${range*2} minute range are marked in green)`;
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



var $table = $(`<table id="allDataTable" class="table table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Start Date/Time</th>
                            <th>End Time</th>
                            <th>Driving Distance<br><small>(Google est.)</small></th>
                            <th>Duration<br><small>(Based on reported NELOS times.)</small></th>
                            <th>Implied Speed (mph)</th>
                            <th>Approximate Ending Location<br><small>(Based on google geocoding. Not exact location. Provides nearest known place.)</small></th>                
                        </tr>
                    </thead>
                </table>`).appendTo('#myTable');

var $tbody = $('<tbody></tbody>').appendTo($table);



function chartPoints() {

    let xAxis = []
    let durationDiffs = []
    let diffColor = []

    let googleVelocities = []
    let cellVelocities = []

    for (let i = 1; i < allPoints.length; i++) {
        
        var utcSeconds = allPoints[i]["gmtDateTime"];
        var lastUtcSeconds = allPoints[i - 1]["gmtDateTime"];
        
        moment.tz.setDefault("America/New_York");
        timezone = "America/New_York";
        format = "dddd, MMMM D YYYY, h:mm:ss a";
    
        let dateParts = allPoints[i]["estDate"].split("/")
        let dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]
    
        var date = formatTime(new Date(dateString + " " + allPoints[i]["estTime"] + " UTC"))

        dateParts = allPoints[i-1]["estDate"].split("/")
        dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]
    
        var lastDate = formatTime(new Date(dateString + " " + allPoints[i-1]["estTime"] + " UTC"))



        timeFromLast = 0;

        timeFromLast = (utcSeconds - lastUtcSeconds) / 60;


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
        let durationDiff = ((allPoints[i]["duration"] / 60) - timeFromLast).toFixed(2)
        durationDiffs.push(durationDiff);


        if (durationDiff > 0) {
            diffColor.push("#ff0000")
        } else {
            diffColor.push("#0000ff")
        }
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
                pointBackgroundColor: diffColor
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
                        min: -20,
                        max: 20,

                    }
                }],
                    xAxes: [{
                        ticks: {
                            display: false //this will remove only the label
                        }
                    }]
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


function gridPoints() {
    let lastPoint
    for (let i = 0; i < allPoints.length; i++) {

        if (i == 0) {
            lastPoint = allPoints[i]
            continue;
        }

        createPointRow(allPoints[i], i, lastPoint)

        lastPoint = allPoints[i]
    }
    // $(document).ready(function () {
    //     $('#allDataTable').DataTable();
    // });
    chartPoints();


    console.log({mph66to99})
    console.log({mph100to150})
    console.log({mph150AndOver})
    console.log({otherOver})


}

var numGreaterThan = 0

var mph66to99 = 0
var mph100to150 = 0
var mph150AndOver = 0
var otherOver = 0

function createPointRow(point, index, lastPoint) {
    // moment.tz.setDefault("America/New_York");
    var utcSeconds = point["gmtDateTime"];
    var utcSecondsLast = lastPoint["gmtDateTime"];

    // var date = new Date(moment.unix(utcSeconds))
    timeFromLast = (utcSeconds - utcSecondsLast) / 60

    moment.tz.setDefault("America/New_York");
    timezone = "America/New_York";
    format = "dddd, MMMM D YYYY, h:mm:ss a";

    let dateParts = point["estDate"].split("/")
    let dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]

    var date = new Date(dateString + " " + point["estTime"] + " UTC")

    dateParts = lastPoint["estDate"].split("/")
    dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]

    var dateLast = new Date(dateString + " " + lastPoint["estTime"] + " UTC")

    let flagged = ""
    
    var miles = (point["distance"] * 0.00062137)
    var $tbody = $('<tbody></tbody>').appendTo($table);
    
    var mph = (miles / (timeFromLast / 60)).toFixed(2)

    warningIcon = ""
    if (point["duration"] / 60 > timeFromLast) {
        flagged = "flagged"
        warningIcon = "<i class='fas fa-exclamation-triangle'></i>"




        if (mph > 65 && mph < 100 ) {
            mph66to99++
        } else if (mph >= 100 && mph < 150 ) {
            mph100to150++
        } else if (mph > 150) {
            mph150AndOver++
        } else {
            otherOver++
        }

    }


    var $tr = $(`<tr class = ${flagged}>`).appendTo($tbody);
    $('<td>').text(index).appendTo($tr);
    $('<td>').text(formatDate(dateLast)).appendTo($tr);
    $('<td>').text(formatTime(date)).appendTo($tr);
    $('<td>').text(miles.toFixed(2) + " miles").appendTo($tr);
    $('<td>').text(timeFromLast.toFixed(2) + " min").appendTo($tr);
    $('<td>').html(mph + " " + warningIcon).appendTo($tr);
    $('<td>').text(point["locationText"]).appendTo($tr);

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
    let count = 1

    var mapPoints = allPoints.filter(function (el) {
        return el.gmtDateTime >= 1495520010 &&
            el.gmtDateTime <= 1495525346;
    });


    for (let i = 0; i < cellPoints.length; i++) {
        count++
        var nums = []
        nums = cellPoints[i].Accuracy.match(/\d+/g);

        if (!nums) {
            nums = 3000;
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

        if (i === 19) {
            continue;
        }

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
            radius: parseFloat(nums)
        });


        circles.push(cityCircle);

        let adjustCoordinates = getOffset(cellPoints[i].Longitude, parseFloat(nums), cellPoints[i].Latitude)
        let adjLat = adjustCoordinates[0]
        let adjLong = adjustCoordinates[1]

        let markerURL = ""
        if (color == 'green') {
            markerURL = "circleMarkerGreen.png"
        } else {
            markerURL = "circleMarker.png"
        }

        var icon = {
            url: markerURL,
            scaledSize: new google.maps.Size(22.5, 30),
            // origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(11.25, 20), // anchor
            labelOrigin: new google.maps.Point(12, 12)
        };



        var circleMarker = new google.maps.Marker({
            position: {
                "lat": adjLat,
                "lng": adjLong,
            },
            color: "blue",
            label: {
                text: (i + 1).toString(),
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

        google.maps.event.addListener(circleMarker, "click", (function (circleMarker) {
            return function (evt) {
                infowindow.setContent(this.html);
                infowindow.open(map, circleMarker);
            }
        })(circleMarker));


        circleMarkers.push(circleMarker)

    }

}

var allLabelCoords = []

function getOffset(lon, radius, lat) {
    //Position, decimal degrees

    // let dw = Math.sqrt(radius^2/2)
    // let dn = dw

    let dw = radius * Math.cos(45)
    let dn = radius * Math.sin(45)

    //Earth’s radius, sphere
    let R = 6378137

    //Coordinate offsets in radians
    let dLat = dn / R
    let dLon = dw / (R * Math.cos(Math.PI * lat / 180))

    //OffsetPosition, decimal degrees
    let latO = lat + dLat * 180 / Math.PI
    let lonO = lon - dLon * 180 / Math.PI

    let coords = []
    coords.push(latO)
    coords.push(lonO)

    for (i = 0; i < allLabelCoords.length; i++) {
        if (coords[0] == allLabelCoords[i][0] && coords[1] == allLabelCoords[i][1]) {
            coords[1] = coords[1] + .001
        }
    }

    allLabelCoords.push(coords)
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
    allLabelCoords = []
}

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
    totalMin = Number(this.value)
    minLower = totalMin - range
    minUpper = totalMin + range
    rangeText.innerHTML = "Between " + display(minLower) + " and " + display(minUpper);
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


function formatDate(date) {
    var strTime = formatTime(date)
    return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
  }

  function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;
    var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return strTime;
  }