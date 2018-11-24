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





function processPoints() {

    

    let allLatLongs = cellPoints.slice(0,10).map(point => 
        new google.maps.LatLng(point.Latitude, point.Longitude)
    )

    getDistanceAndTimeInfo(allLatLongs)

    //     

    //     for (let i = 0; i < cellPoints.length; i++) {

    //         let day = cellPoints[i].Date.split("/")[1]
    //         let month = Number(cellPoints[i].Date.split("/")[0]) - 1
    //         let year = 20 + cellPoints[i].Date.split("/")[2]
    //         let hours = cellPoints[i].Time.split(":")[0]
    //         let minutes = cellPoints[i].Time.split(":")[1]
    //         let seconds = cellPoints[i].Time.split(":")[2]

    //         let date = new Date(year, month, day, hours, minutes, seconds)
    //         cellPoints[i].dateTime = date

    //         console.log(cellPoints[i].Latitude)

    //         allCoordinates = allCoordinates + cellPoints[i].Latitude + ", " + cellPoints[i].Longitude

    //         if (i < cellPoints.length - 1) {
    //             allCoordinates = allCoordinates + " | "
    //         }




    //         // if (i > 0) {
    //         //     let lastPoint = cellPoints[i - 1]
    //         //     getDistanceAndTimeInfo(cellPoints[i], date, i, lastPoint, function (stuff) {

    //         //         // console.log(i)

    //         //         let timeDiff = (stuff[4] - timeDistanceresult[i - 1][4]) / 1000 / 60

    //         //         console.log(timeDiff)
    //         //         console.log(stuff[1])



    //         //         timeDistanceresult.push(stuff)

    //         //         if (i === cellPoints.length-1) {
    //         //             plotPoints()
    //         //         }
    //         //     })
    //         // } else {
    //         //     timeDistanceresult.push(["na", "na", "na", "na", date])
    //         // }


    //         // let timeDiff = 0
    //         // if (i > 0) {
    //         //     // console.log(timeDistanceresult[i][4])
    //         //     timeDiff = (timeDistanceresult[i][4]-timeDistanceresult[i-1][4]/1000)/60
    //         // }
    //         // console.log(timeDistanceresult[i-1])
    //     }

    //     console.log(allCoordinates)


}

function plotPoints() {
    for (let i = 0; i < cellPoints.length; i++) {
        // $("pointPlot").append("<div class = 'pointPlots'></div>");

        var $newdiv1 = $("<div class='pointPlots' id='point" + i + "'></div>")
        $(".pointPlot").append($newdiv1);


        var hms = cellPoints[i].Time; // your input string
        var a = hms.split(':'); // split it at the colons
        var minutes = (+a[0]) * 60 + (+a[1]) + (+a[2] / 60);

        let totalRange = slider.max - slider.min
        let leftPercent = ((minutes - slider.min) / totalRange - (rangePercent / 2)) * 100 - .5


        $(`#point${i}`).css({
            'left': `${Math.floor(leftPercent)}%`
        })


        let card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = createPointCard(cellPoints[i], i)

        $('#pointText').append(card);

        // $(`#point${i}`).css({'top': `${550+i*2}px`})
    }

}


function createPointCard(point, index) {


    let cardHTML = (`<button class="collapsed caret" type="button" data-toggle="collapse" data-target=${"#collapse" + (index + 1)} aria-expanded="false" aria-controls=${"collapse" + (index + 1)}>
                <div class="card-header" id=${"point" + (index + 1)}>
                    <div class="header-name">
                        <h3>${index + 1}) "${point.Address}"  (${point.Time})</h3>
                        <div id="content">
                        <div id="bodyContent"> 
                        <p class="pointDetail" >Longitude) ${point.Longitude}  Latitude) ${point.Latitude}</p>
                        </div> 
                        </div>
                    </div>
                <i class="fas fa-caret-left"></i>
            </div>
        </button>
        `);

    return cardHTML
}



function getDistanceAndTimeInfo(allLatLongs, mycallback) {
    let distanceService = new google.maps.DistanceMatrixService();

    // let pickupLat = lastPoint.Latitude
    // let pickupLng = lastPoint.Longitude
    // let dropoffLat = point.Latitude
    // let dropoffLng = point.Longitude
    var d = $.Deferred();

    DrivingOptions = {
        departureTime: new Date(Date.now()),
        trafficModel: 'optimistic'
    }

    distanceService.getDistanceMatrix({
        origins: allLatLongs,
        destinations: allLatLongs,
        travelMode: 'DRIVING',
        drivingOptions: DrivingOptions,
        unitSystem: google.maps.UnitSystem.IMPERIAL
    }, callback);


    function callback(response, status) {
        if (status == 'OK') {
            // var origins = response.originAddresses;
            // var destinations = response.destinationAddresses;
            console.log(response)

            for (var i = 0; i < response.length; i++) {
                var results = response.rows[i].elements;

                console.log(results)
                // var element = results[j];
                // var distance = element.distance.text;
                // var duration = element.duration.text;
                // var from = origins[i];
                // var to = destinations[j];

                // mycallback([distance, duration, from, to, date])
                d.resolve(response);
            }
        } else {
            d.reject(status);
            console.log(status)
        }
    }
    return d.promise();

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
    processPoints()

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