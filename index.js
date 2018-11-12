var map;
var circles = [];
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
let totalMin = 1250
let range = 5
let minLower = totalMin - range
let minUpper = totalMin + range

let rangePercent = range/(slider.max - slider.min)

console.log(minLower + " to " + minUpper)

output.innerHTML = "Between " + display(minLower) + " and " + display(minUpper);
// output.innerHTML = display(slider.value); // Display the default slider value

console.log(rangePercent)

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
        // title: ride.patientName,
        // icon: icon,
        zIndex: 101
    });

    drawCircles();

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
        var minutes = (+a[0]) * 60 + (+a[1]) + (+a[2]/60);

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
    } 
    else  {amPm = "am"} 
    var minutes = a % 60;
    return (hours + ":" + pad(minutes,2) + amPm);
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}