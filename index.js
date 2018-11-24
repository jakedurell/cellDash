var map;
var circles = [];
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
let totalMin = 1350
let range = 5
let minLower = totalMin - range
let minUpper = totalMin + range

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
        
        if (i == 0) {lastPoint = allPoints[i]}

        var $newdiv1 = $("<div class='pointPlots' id='point" + i + "'></div>")
        $(".pointPlot").append($newdiv1);


        let card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = createPointCard(allPoints[i], i, lastPoint)

        $('#pointText').append(card);
        lastPoint = allPoints[i]
    }

}


function createPointCard(point, index, lastPoint) {
    var utcSeconds = point["gmtDateTime"];
    var date = moment.unix(utcSeconds).format('dddd, MMMM Do, YYYY h:mm:ss A')
    timeFromLast = (utcSeconds-lastPoint["gmtDateTime"])/60
    console.log(timeFromLast.toFixed(2))
    let flagged = ""
    if (point["duration"]/60 > timeFromLast) {
        flagged = "flagged"
    }

    let cardHTML = (`<button class="collapsed caret ${flagged}" type="button" data-toggle="collapse" data-target=${"#collapse" + (index + 1)} aria-expanded="false" aria-controls=${"collapse" + (index + 1)}>
                <div class="card-header" id=${"point" + (index + 1)}>
                    <div class="header-name">
                        <h3>${index + 1}) ${point["locationText"]}</h3>
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
        </button>
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

    console.log(allPoints)

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

        // console.log(minutes);

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

    }

}

function removeAllcircles() {
    for (var i in circles) {
        circles[i].setMap(null);
    }
    circles = []; // this is if you really want to remove them, so you reset the variable.
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