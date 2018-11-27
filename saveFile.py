# f = open('cellPoints2.js')

# out = open('foo.json', 'w')

# out.writelines(f.readlines())


import csv
import googlemaps
from datetime import datetime
import re
import datetime
import json

gmaps = googlemaps.Client(key='AIzaSyCG1ezWA98toSwUGbVGyBXTQF1RssMGgP4')
arrayList = []

with open('testData.csv', mode = 'r') as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',') #, dialect)
    line_count = 0

    for line in reader:
        if line_count == 0:
            columns = ", ".join(line)
            line_count += 1
        else:
            dateArray = line["ConnectionDate"].split('/')
            date_time_str = "20"+dateArray[2]+'-'+dateArray[0]+'-'+dateArray[1] + " " + line["ConnectionTime(GMT)"]
            date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S')
            accurStr = filter(str.isdigit, line["LocationAccuracy"])
            accuracy = -1 if accurStr == "" else float(accurStr)
            pointAttributes =	{
                "gmtDateTime": int(date_time_obj.strftime('%s')),
                "longitude": float(line["Longitude"]),
                "latitude": float(line["Latitude"]),
                "accuracy": accuracy,
                "estDate": line["ConnectionDate"],
                "estTime": line["ConnectionTime(GMT)"],
            }

            line_count += 1
            arrayList.append(pointAttributes)

    arrayList.sort(key=lambda item:item['gmtDateTime'], reverse=False)
    # print arrayList
    line_count = 0
    for i in arrayList:
        if line_count == 0:
            lastPoint = i
        # else:
        #Assign latitude and longitude as origin/departure points
        LatOrigin = float(lastPoint['latitude'])
        LongOrigin = float(lastPoint['longitude'])
        origins = (LatOrigin,LongOrigin)

        #Assign latitude and longitude from the next row as the destination point
        LatDest = float(i['latitude'])   # Save value as lat
        LongDest = float(i['longitude']) # Save value as lat
        destination = (LatDest,LongDest)

        #pass origin and destination variables to distance_matrix function# output in meters
        result = gmaps.distance_matrix(origins, destination, mode="driving", departure_time = 'now', traffic_model="optimistic")
        line_count += 1
        lastPoint = i
        i["distance"] = result["rows"][0]["elements"][0]["distance"]["value"]
        i["duration"] = result["rows"][0]["elements"][0]["duration"]["value"]
        i["locationText"] = result["destination_addresses"][0]
        

    with open('allPoints.json', 'w') as outfile:
        json.dump(arrayList, outfile)
