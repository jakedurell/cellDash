var map;
var circles = [];
var circleMarkers = [];
var slider = document.getElementById("myRange");
var rangeText = document.getElementById("range");
var rangeTextDesc = document.getElementById("rangeDesc");

var minGMT = 1495520010;
var maxGMT = 1495525346;

$('#slider').prop('min', 10);
$('#slider').prop('max', 100);

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
    
        let dateParts = allPoints[i]["gmtDate"].split("/")
        let dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]
    
        var date = formatTime(new Date(dateString + " " + allPoints[i]["gmtTime"] + " UTC"))

        dateParts = allPoints[i-1]["gmtDate"].split("/")
        dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]
    
        var lastDate = formatTime(new Date(dateString + " " + allPoints[i-1]["gmtTime"] + " UTC"))



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

function gmtDateFromUTC(strDate, strTime){
    moment.tz.setDefault("America/New_York");
    timezone = "America/New_York";
    format = "dddd, MMMM D YYYY, h:mm:ss a";

    let dateParts = strDate.split("/")
    let dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]

    var date = new Date(dateString + " " + strTime + " UTC")

    return date
}

function createPointRow(point, index, lastPoint) {
    // moment.tz.setDefault("America/New_York");
    var utcSeconds = point["gmtDateTime"];
    var utcSecondsLast = lastPoint["gmtDateTime"];

    // var date = new Date(moment.unix(utcSeconds))
    timeFromLast = (utcSeconds - utcSecondsLast) / 60

    moment.tz.setDefault("America/New_York");
    timezone = "America/New_York";
    format = "dddd, MMMM D YYYY, h:mm:ss a";

    let dateParts = point["gmtDate"].split("/")
    let dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]

    var date = new Date(dateString + " " + point["gmtTime"] + " UTC")

    dateParts = lastPoint["gmtDate"].split("/")
    dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]

    var dateLast = new Date(dateString + " " + lastPoint["gmtTime"] + " UTC")

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