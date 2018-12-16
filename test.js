function initialize() {
    var gm = google.maps,
        centerPt = new gm.LatLng(55.685025, 21.118995),

        map = new gm.Map(document.getElementById('map_canvas'), {
            mapTypeId: gm.MapTypeId.ROADMAP,
            zoom: 16,
            center: centerPt
        }),
        marker = new gm.Marker({
            position: centerPt,
            map: map,
            //Colors available (marker.png is red):
            //black, brown, green, grey, orange, purple, white & yellow
            icon: 'http://maps.google.com/mapfiles/marker_green.png'
        }),
        slices = [
            [300, 60, 'red'],
            [60, 180, 'green'],
            [180, 300, 'blue']
        ],
        polys = [],
        i = 0,
        radiusMeters = 200;



    for (; i < slices.length; i++) {
        var path = getArcPath(centerPt, radiusMeters, slices[i][0], slices[i][1]);
        //Insert the center point of our circle as first item in path
        path.unshift(centerPt);
        //Add the center point of our circle as last item in path to create closed path.
        //Note google does not actually require us to close the path,
        //but doesn't hurt to do so
        path.push(centerPt);
        var poly = new gm.Polygon({
            path: path,
            map: map,
            fillColor: slices[i][2],
            fillOpacity: 0.6
        });
        polys.push(poly);
    }
}

/***
 * REQUIRES: google.maps.geometry library, via a 'libraries=geometry' parameter
 *  on url to google maps script.
 * @param center must be a google.maps.LatLng object.
 * @param radiusMeters must be a Number, radius in meters.
 * @param startAngle must be a Number from 0 to 360, angle at which to begin arc.
 * @param endAngle must be a Number from 0 to 360, angle at which to end arc.
 *   For a full circle, use startAngle of 0 and endAngle of either 360 or 0
 *   which will create a closed path.
 * @param resolution -optional- a Number,
 * 
 *  
 * @Returns array of google.maps.LatLng objects.
 * getArcPath works in clockwise direction only, so any application using it
 *  in order to get counterclockwise arcs will need to adjust their start
 *  and end angles accordingly and then .reverse() the result of getArcPath.
 ***/
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

google.maps.event.addDomListener(window, 'load', initialize);