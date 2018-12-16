var towerMarkers = [];
var polys = []

function drawTowers() {

    let allPIndex = []
    mapPoints = []

    allAUPoints.filter(function (el, index) {

        let startPointUTC = Math.round((gmtDateFromUTC(el.utcDate, el.utcTime)).getTime() / 1000)
        let seizureParts = el.seizureTime.split(":")
        let elapsedTimeParts = el.elapsedTime.split(":")

        let seizureMinsinSecs = parseFloat(seizureParts[0]*60)
        let seizureSecs = parseFloat(seizureParts[1])
        let elapseMinsinSecs = parseFloat(elapsedTimeParts[0]*60)
        let elapseSecs = parseFloat(elapsedTimeParts[1])

        let endPointGMT = startPointUTC + seizureMinsinSecs + seizureSecs + elapseMinsinSecs + elapseSecs

        el.endPointGMT = endPointGMT

        if (endPointGMT >= minLower &&
            startPointUTC <= minUpper) {


            mapPoints.push(el)

            allPIndex.push(index)
        }

    });

    for (let i = 0; i < mapPoints.length; i++) {

        let towerStartDate = mapPoints[i]["utcDate"]
        let circleTime = mapPoints[i]["utcTime"]

        let startDateTimeEst = gmtDateFromUTC(towerStartDate, circleTime)
        let towerStartDateStr = formatDate(startDateTimeEst)

        
        let towerEndDateStr = display(mapPoints[i]["endPointGMT"]);
        
        unixTime = Math.round((new Date(startDateTimeEst)).getTime() / 1000)


        let towerLat = mapPoints[i]["latitude"]
        let towerLon = mapPoints[i]["longitude"]


        let adjustCoordinates = getOffset(mapPoints[i]["longitude"], parseFloat(0), mapPoints[i]["latitude"])
        let markerLat = parseFloat(adjustCoordinates[0])
        let markerLong = parseFloat(adjustCoordinates[1])


        let markerURL = "circleMarker.png"

        var icon = {
            url: markerURL,
            scaledSize: new google.maps.Size(22.5, 30),
            // origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(11.25, 20), // anchor
            labelOrigin: new google.maps.Point(12, 12)
        };

        console.log({markerLat})
        console.log({markerLong})

        var towerMarker = new google.maps.Marker({
            position: {
                "lat": markerLat,
                "lng": markerLong,
            },
            color: "blue",
            label: {
                text: mapPoints[i]["item"].toString(),
                fontSize: "10px"
            },
            icon: icon,
            map: map,
            zIndex: 101
        });

        sector = mapPoints[i]["sector"]
        beamwidth = mapPoints[i]["beamwidth"]
        
        var infowindow = new google.maps.InfoWindow()
        towerMarker.html =
            `<div class="infoWindow">
        <b>Start Call:</b> <span>${towerStartDateStr}</span><br>
        <b>End Call:</b> <span>${towerEndDateStr}</span><br>
        <b>Sector:</b> <span>${sector}</span><br>
        <b>Beamwidth:</b> <span>${beamwidth}</span><br>
        <b>Seizure:</b> <span>${mapPoints[i]["seizureTime"]}</span><br>
        <b>Elapsed Time:</b> <span>${mapPoints[i]["elapsedTime"]}</span><br>
        </div>`

        google.maps.event.addListener(towerMarker, "click", (function (towerMarker) {
            return function (evt) {
                infowindow.setContent(this.html);
                infowindow.open(map, towerMarker);
            }
        })(towerMarker));

        

        // var centerPt = `{lat: ${towerLat}, lng: ${towerLon}}`
        var centerPt = new google.maps.LatLng(parseFloat(towerLat), parseFloat(towerLon));
        console.log(centerPt)
        getPie(centerPt, sector, beamwidth);

        towerMarkers.push(towerMarker)

    }


}

function getPie(centerPt, sector, beamwidth) {

    try {
        let startDeg = 0 + sector - (.5*beamwidth)
        let endDeg = startDeg + (+beamwidth)


        let slices = [
            [startDeg, endDeg, 'red']
        ]
        let radiusMeters = 2000;


        var path = getArcPath(centerPt, radiusMeters, slices[0][0], slices[0][1]);
        //Insert the center point of our circle as first item in path
        path.unshift(centerPt);
        //Add the center point of our circle as last item in path to create closed path.
        //Note google does not actually require us to close the path,
        //but doesn't hurt to do so
        path.push(centerPt);

        var poly = new google.maps.Polygon({
            path: path,
            map: map,
            fillColor: slices[0][2],
            fillOpacity: 0.3,
            strokeColor: "#FF0000",
            strokeOpacity: 0.3,
            strokeWeight: 1,
        });

        polys.push(poly);
    } catch (error) {
        console.log(error)
    }
}

function getArcPath(center, radiusMeters, startAngle, endAngle, resolution) {
    var point, previous,
        func = google.maps.geometry.spherical.computeOffset,
        points = [],
        loops = 0,
        a = startAngle,
        increment = (typeof resolution == 'number' && !isNaN(resolution)) ? resolution : 1;
    while (true) {
        point = func(center, radiusMeters, a);
        points.push(point);
        if (a == endAngle && points.length > 1) {
            break;
        }
        previous = a;
        a += increment;
        if (a >= 360 && endAngle != 360) {
            loops++;
            if (loops > 1) {
                console.error('Excessive recursion in getArcPath()');
                console.log({startAngle})
                console.log({endAngle})
                return [];
            }
            a = a % 360;
        }
        if ((previous < endAngle) && (a >= endAngle)) {
            a = endAngle;
        }
    }
    return points;
}



function removeAllTowers() {
    for (var i in polys) {
        polys[i].setMap(null);
    }
    polys = []; // this is if you really want to remove them, so you reset the variable.

    for (var i in towerMarkers) {
        towerMarkers[i].setMap(null);
    }

    towerMarkers = []
}