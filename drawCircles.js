var allLabelCoords = []

function drawCircles() {

    let color = '#FF0000'
    let count = 1

    var mapPoints = allPoints.filter(function (el) {
        return el.gmtDateTime >= 1495520010 &&
            el.gmtDateTime <= 1495525346;
    });


    for (let i = 0; i < mapPoints.length; i++) {
        count++
        var nums = []
        nums = mapPoints[i]["accuracy"];

        if (nums<0) {
            nums = 3000;
        }

        let circleDate = mapPoints[i]["gmtDate"]
        let circleTime = mapPoints[i]["gmtTime"]
        
        let estDateTime = gmtDateFromUTC (circleDate, circleTime)

        let circleDateStr = formatDate(estDateTime)
        let circleTimeStr = formatTime(estDateTime)


        let hms = formatTime24(estDateTime)
        var a = hms.split(':'); // split it at the colons
        // Hours are worth 60 minutes.

        var minutes = (+a[0] * 60) + (+a[1]) + ((+a[2]) / 60);

        console.log({circleTimeStr})
        console.log({a})
        console.log({minutes})

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
                lat: mapPoints[i]["latitude"],
                lng: mapPoints[i]["longitude"]
            },
            radius: parseFloat(nums)
        });



        circles.push(cityCircle);

        let adjustCoordinates = getOffset(mapPoints[i]["longitude"], parseFloat(nums), mapPoints[i]["latitude"])
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
        <b>Timestamp:</b> <span>${circleDateStr}<br>
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

function formatTime24(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;
    var strTime = hours + ':' + minutes + ':' + seconds;
    return strTime;
  }