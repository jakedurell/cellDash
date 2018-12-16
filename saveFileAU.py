# f = open('cellPoints2.js')

# out = open('foo.json', 'w')

# out.writelines(f.readlines())


import csv
import googlemaps
from datetime import datetime
import re
import datetime
import json
import pandas as pd
import math


gmaps = googlemaps.Client(key='AIzaSyCG1ezWA98toSwUGbVGyBXTQF1RssMGgP4')
arrayList = []

df = pd.read_csv("reportAU.csv")
# print (df.head(5))

# with open('reportAU.csv', mode = 'r') as csvfile:
# reader = csv.DictReader(csvfile, delimiter=',',quoting=csv.QUOTE_NONNUMERIC) #, dialect)

with open('reportAU.csv', mode = 'r') as csvfile:
    reader = csv.DictReader(csvfile, delimiter=',') #, dialect)
    line_count = 0

    for line in reader:
        if line_count == 0:
            columns = ", ".join(line)
            line_count += 1
        else:
            dateArray = line["utcDate"].split('/')
            date_time_str = "20"+dateArray[2]+'-'+dateArray[0]+'-'+dateArray[1] + " " + line["utcTime"]
            date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S')
        

            if line["CellLocation"] == '' or (isinstance(line["CellLocation"], float) and  math.isnan(line["CellLocation"])):
                # location1Array = ["",0,0,"",""]
                continue
            else:
                location1Array = line["CellLocation"].split(':')

            if line["IMEI"] == '' or (isinstance(line["IMEI"], float) and  math.isnan(line["IMEI"])):
                imei = 0
            else:
                imei = float(line["IMEI"])

            if line["IMSI"] == '' or (isinstance(line["IMSI"], float) and  math.isnan(line["IMSI"])):
                imsi = 0
            else:
                imsi = float(line["IMSI"])

            if location1Array[3] == '' or (isinstance(location1Array[3], float) and  math.isnan(location1Array[3])):
                sector = 0
            else:
                sector = float(location1Array[3])
                print sector

            if location1Array[4] == '' or (isinstance(location1Array[4], float) and  math.isnan(location1Array[4])):
                beamwidth = 0
            else:
                beamwidth = float(location1Array[4])

            item = str(line["Item"])


            pointAttributes =	{
                "gmtDateTime": int(date_time_obj.strftime('%s')),
                "item": item,
                "utcDate": line["utcDate"],
                "utcTime": line["utcTime"],
                "seizureTime": line["SeizureTime"],
                "elapsedTime": line["ET"],
                "imei": imei,
                "imsi": imsi,
                "firstNum": location1Array[0],
                "longitude": float(location1Array[1]),
                "latitude": float(location1Array[2]),
                "sector": sector,
                "beamwidth": beamwidth
            }
            line_count += 1
            arrayList.append(pointAttributes)


            if line["CellLocation2"]:

                if line["CellLocation2"] == '' or (isinstance(line["CellLocation2"], float) and  math.isnan(line["CellLocation2"])):
                    continue                
                else:
                    location2Array = line["CellLocation2"].split(':')

                    pointAttributes2 =	{
                        "gmtDateTime": int(date_time_obj.strftime('%s')),
                        "item": item + ".1",
                        "utcDate": line["utcDate"],
                        "utcTime": line["utcTime"],
                        "seizureTime": line["SeizureTime"],
                        "elapsedTime": line["ET"],
                        "imei": imei,
                        "imsi": imsi,
                        "firstNum": location2Array[0],
                        "longitude": float(location2Array[1]),
                        "latitude": float(location2Array[2]),
                        "sector": sector,
                        "beamwidth": beamwidth
                    }
                
                arrayList.append(pointAttributes2)

    # arrayList.sort(key=lambda item:item['gmtDateTime'], reverse=False)
    # # print arrayList
    # line_count = 0
    # for i in arrayList:
    #     if line_count == 0:
    #         lastPoint = i
    #     # else:
    #     #Assign latitude and longitude as origin/departure points
    #     LatOrigin = float(lastPoint['latitude'])
    #     LongOrigin = float(lastPoint['longitude'])
    #     origins = (LatOrigin,LongOrigin)

    #     #Assign latitude and longitude from the next row as the destination point
    #     LatDest = float(i['latitude'])   # Save value as lat
    #     LongDest = float(i['longitude']) # Save value as lat
    #     destination = (LatDest,LongDest)

    #     #pass origin and destination variables to distance_matrix function# output in meters
    #     result = gmaps.distance_matrix(origins, destination, mode="driving", departure_time = 'now', traffic_model="optimistic")
    #     line_count += 1
    #     lastPoint = i
    #     i["distance"] = result["rows"][0]["elements"][0]["distance"]["value"]
    #     i["duration"] = result["rows"][0]["elements"][0]["duration"]["value"]
    #     i["locationText"] = result["destination_addresses"][0]
        
    print len(arrayList)
    # with open('allAUPoints.json', 'w') as outfile:
    #     json.dump(arrayList, outfile)
