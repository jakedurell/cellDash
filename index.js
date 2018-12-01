var map;
var circles = [];
var circleMarkers = [];
var centerMarkers = [];
var slider = document.getElementById("myRange");
var rangeText = document.getElementById("range");
var rangeTextDesc = document.getElementById("rangeDesc");

var minDate = "2017.05.22"
var minTime = "22:00:00"
var maxDate = "2017.05.23"
var maxTime = "00:00:00"



var minGMT = Math.round((new Date(minDate + " " + minTime)).getTime() / 1000)
var maxGMT = Math.round((new Date(maxDate + " " + maxTime)).getTime() / 1000)


let totalMin = (minGMT + maxGMT) / 2

$('#myRange').prop('min', minGMT);
$('#myRange').prop('max', maxGMT);
$('#myRange').prop('step', 60);
$('#myRange').prop('value', totalMin);



let rangeMin = 10
let range = rangeMin * 60
let minLower = totalMin - range
let minUpper = totalMin + range
var activeInfoWindow
let rangePercent = (2 * range) / (slider.max - slider.min)
var style = document.querySelector('[data="test"]');

rangeText.innerHTML = `<b>${rangeMin*2} min. Range:</b> <u>${display(minLower)}</u> to <u>${display(minUpper)}</u><br><br>`
rangeTextDesc.innerHTML = `
            <div class="legend">
                <div class="legendItem">
                    <img src="coordCircle.png" class="legendPic">
                    <p>Alleged NELOS "Item" coordinates at center of circle with radius based on "Location Accuracy"</p>
                </div>
                <div class="legendItem">
                    <img src="googleIcon.png" class="legendPic">
                    <p>Alleged Scene of Crime</p>
                </div>
                <div class="legendItem">
                    <img src="homeIcon.png" class="legendPic">
                    <p>Home of Alibi Witness</p>
                </div>
            </div>`;
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
                            <th>Item #s</th>
                            <th>A) Start Date/Time</th>
                            <th>B) End Time</th>
                            <th>C) Driving Distance<br><small>(Google est.)</small></th>
                            <th>E) Duration<br><small>(Based on reported NELOS times.)</small></th>
                            <th>F) Implied Speed<br><small>(mph)</small></th>
                            <th>G) Approximate Ending Location<br><small>(Based on google geocoding. Not exact location. Provides nearest known place.)</small></th>                
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

        dateParts = allPoints[i - 1]["gmtDate"].split("/")
        dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]

        var lastDate = formatDate(new Date(dateString + " " + allPoints[i - 1]["gmtTime"] + " UTC"))



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
                label: "Duration",
                borderColor: "#3e95cd",
                fill: true,
                pointBackgroundColor: diffColor
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Google est. time - NELOS implied time.',
                position: 'left',
                fontSize: 14
            },
            layout: {
                padding: {
                    left: 20,
                    right: 0,
                    top: 0,
                    bottom: 0
                },
                margin: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 15
                }
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
                text: 'Google Implied Velocities & NELOS Implied Velocities',
                position: 'left',
                fontSize: 14
            },
            layout: {
                padding: {
                    left: 20,
                    right: 0,
                    top: 0,
                    bottom: 0
                },
                margin: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 15
                }
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
    

    console.log(maxMPH)


    console.log({
        mph0to25
    })
    console.log({
        mph25to65
    })
    console.log({
        mph65to100
    })
    console.log({
        mph100to150
    })
    console.log({
        mph150to500
    })
    console.log({
        mph500AndOver
    })
    console.log({mphArray})

    console.log(mph0to25 + mph25to65 + mph65to100 + mph100to150 + mph150to500 + mph500AndOver)
}

var numGreaterThan = 0

var mph0to25 = 0
var mph25to65 = 0
var mph65to100 = 0
var mph100to150 = 0
var mph150to500 = 0
var mph500AndOver = 0


function gmtDateFromUTC(strDate, strTime) {
    moment.tz.setDefault("America/New_York");
    timezone = "America/New_York";
    format = "dddd, MMMM D YYYY, h:mm:ss a";

    let dateParts = strDate.split("/")
    let dateString = "20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]

    var date = new Date(dateString + " " + strTime + " UTC")
    return date
}

var maxMPH = []

var mphArray = []

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

    var mph = (miles / (timeFromLast / 60))

    if (index == 1) {
        maxMPH.push(point)
        maxMPH.push(mph)
    } else if (mph > maxMPH[1]) {
        console.log(maxMPH)
        maxMPH.pop()
        maxMPH.pop()
        maxMPH.push(point)
        maxMPH.push(mph)
    }

    mph = mph.toFixed(2)

    mphArray.push(mph)
    if (mph >= 0 && mph < 25) {
        mph0to25++
    } else if (mph >= 25 && mph < 65) {
        mph25to65++
    } else if (mph >= 65 && mph < 100) {
        mph65to100++
    }  else if (mph >= 100 && mph < 150) {
        mph100to150++
    } else if (mph >= 150 && mph < 500) {
        mph150to500++
    } else if (mph >= 500) {
        mph500AndOver++
    } else {
        console.log("error: " + mph)
    }

    warningIcon = ""
    if (point["duration"] / 60 > timeFromLast) {
        flagged = "flagged"
        warningIcon = "<i class='fas fa-exclamation-triangle'></i>"



 

    }
    //418 to 417
    //44.459766, -73.146276
    //44.464212, -73.120446

    //397 to 396
    //44.469414, -73.194723 to 44.482707, -73.213533 
    //44.482707, -73.213533 

    var $tr = $(`<tr class = ${flagged}>`).appendTo($tbody);
    $('<td width = "100px">').text((point["item"]+1)+"-"+point["item"]).appendTo($tr);
    $('<td>').text(formatDate(dateLast)).appendTo($tr);
    $('<td>').text(formatTime(date)).appendTo($tr);
    $('<td>').text(miles.toFixed(5) + " miles").appendTo($tr);
    $('<td>').text(timeFromLast.toFixed(2) + " min").appendTo($tr);
    $('<td>').html(mph + " " + warningIcon).appendTo($tr);
    $('<td>').html("<small>"+point["locationText"]+"</small><br> <small>lon) "+point["longitude"]+" lat) " +point["latitude"]+"</small>").appendTo($tr);

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

    markerURL = "homeIcon.png"

    var icon = {
        url: markerURL,
        scaledSize: new google.maps.Size(36, 36)
    };
    var alibi = new google.maps.Marker({
        position: {
            "lat": 44.496710,
            "lng": -73.125110
        },
        color: "blue",
        icon: icon,
        map: map,
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
    rangeText.innerHTML = `<b>${rangeMin*2} min. Range:</b> <u>${display(minLower)}</u> to <u>${display(minUpper)}</u><br><br>`;
    removeAllcircles()
    drawCircles();
}

function display(a) {


    let dateString = formatDate(new Date(a * 1000))

    // var hours = Math.trunc(a / 60);
    // let amPm = "";
    // if (hours >= 12) {
    //     hours = hours - 12
    //     amPm = "pm"
    // } else {
    //     amPm = "am"
    // }
    // var minutes = a % 60;
    return dateString;
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}


function formatDate(date) {
    var strTime = formatTime(date)
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return strTime;
}