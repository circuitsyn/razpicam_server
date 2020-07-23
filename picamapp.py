#!/usr/bin/env python3

from flask import Flask, render_template, Response, jsonify, request
from flask_socketio import SocketIO, emit
import picamera
# import SensorCode
from bleson import get_provider, Observer, UUID16
from bleson.logger import log, set_level, ERROR, DEBUG
import json
import cv2
import socket
import io
import os
import sys
import glob
import time

# Disable warnings for sensor gathering
set_level(ERROR)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'include_help!'
socketio = SocketIO(app, async_mode='threading')
# os.urandom(12)

vc = cv2.VideoCapture(0)
vc.set(3, 1280)
vc.set(4, 720)

# -------------------- @app Routes Start -----------------------------------
@app.route('/')
def index():
    """Video streaming"""
    return render_template('index.html')

def gen():
    """Video streaming generator function."""
    while True:
        rval, frame = vc.read()
        # frame = cv2.flip(frame, -1)
        # cv2.imwrite('t.jpg', frame)
        # yield (b'--frame\r\n'
        #        b'Content-Type: image/jpeg\r\n\r\n' + open('t.jpg', 'rb').read() + b'\r\n')
        byteArray = cv2.imencode('.jpg', frame)[1].tobytes()
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + byteArray + b'\r\n')

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# Photo Snap Function
@app.route('/PhotoSnap', methods=['GET', 'POST'])
def PhotoSnap():
    print("snap snap")
    #set a variable with the current time to use as image file name
    curTime = (time.strftime("%m%j%y"+"_"+"%H%M_%S"))
    #take a photo, give it a name, and resize it to fit into Parse
    rval, frame = vc.read()
    # frame = cv2.flip(frame, -1)
    width = vc.get(3)
    height = vc.get(4)
    print("width: ", width, "height: ", height)

    snapPath = '/home/pi/shared/3DPrinterCam/static/imgs/captures/'

    # check if capture path exists, create if not
    if not os.path.exists(snapPath):
        os.mkdir(snapPath)
    
    else:
        if rval:
            # code to write frame to jpeg with timestamp as filename
            isWritten = cv2.imwrite(snapPath + curTime +'.jpg', frame)
            if isWritten:
                print('image successfully written to ' + '/home/pi/shared/3DPrinterCam/static/imgs/captures/'+ curTime +'.jpg' )
            else:
                print('img write failed')
        else:
            print('rval - false - check photo snap else section of code', rval)

    return "Nothing"

# Delete Photo Function
@app.route('/PhotoDelete', methods=['GET', 'POST'])
def PhotoDelete():
    filenameVal = request.form['filenameVal']
    print('filename: ', filenameVal)
    os.remove(filenameVal)
    print("confirmed deletion")
    return "Nothing"

# Gallery Provide & Update
@app.route('/photoGalleryBuild', methods=['GET', 'POST'])
def photoGalleryBuild():
    path = "/home/pi/shared/3DPrinterCam/static/imgs/captures/"
    imgData = map(os.path.basename, sorted(glob.glob(path + "*jpg"), reverse=True))
    # print('imgdata: ', list(imgData))
    
    return jsonify({"imgArray": list(imgData)})

# -------------------- @app Routes End-----------------------------------
# -------------------- Govee Sensor Start-----------------------------------
# # Uncomment for debug log level
# set_level(DEBUG)

# https://macaddresschanger.com/bluetooth-mac-lookup/A4%3AC1%3A38
# OUI Prefix	Company
# A4:C1:38	Telink Semiconductor (Taipei) Co. Ltd.
GOVEE_BT_mac_OUI_PREFIX = "A4:C1:38"
H5075_UPDATE_UUID16 = UUID16(0xEC88)
govee_devices = {}
FORMAT_PRECISION = ".2f"

### Govee Sensor Data Conversion Functions ###
# Decode H5075 Temperature into degrees Celcius
def decode_temp_in_c(encoded_data):
    return format((encoded_data / 10000), FORMAT_PRECISION)


# Decode H5075 Temperature into degrees Fahrenheit
def decode_temp_in_f(encoded_data):
    return format((((encoded_data / 10000) * 1.8) + 32), FORMAT_PRECISION)


# Decode H5075 percent humidity
def decode_humidity(encoded_data):
    return format(((encoded_data % 1000) / 10), FORMAT_PRECISION)
  

def print_values(mac):
    govee_device = govee_devices[mac]
    # print(govee_device)
    print(
        f"{govee_device['name']} ({govee_device['address']}) - \
Temperature {govee_device['tempInC']}C / {govee_device['tempInF']}F  - \
Humidity: {govee_device['humidity']}% - \
Battery:  {govee_device['battery']}%"
    )

# On BLE advertisement callback
def on_advertisement(advertisement):
    # log.debug(advertisement)

    if advertisement.address.address.startswith(GOVEE_BT_mac_OUI_PREFIX):
        mac = advertisement.address.address

        if mac not in govee_devices:
            govee_devices[mac] = {}
        if H5075_UPDATE_UUID16 in advertisement.uuid16s:
            # HACK:  Proper decoding is done in bleson > 0.10
            # print(advertisement.name)
            name = advertisement.name

            encoded_data = int(advertisement.mfg_data.hex()[6:12], 16)
            battery = int(advertisement.mfg_data.hex()[12:14], 16)
            govee_devices[mac]["address"] = mac
            govee_devices[mac]["name"] = name
            govee_devices[mac]["mfg_data"] = advertisement.mfg_data
            govee_devices[mac]["data"] = encoded_data

            govee_devices[mac]["tempInC"] = decode_temp_in_c(encoded_data)
            govee_devices[mac]["tempInF"] = decode_temp_in_f(encoded_data)
            govee_devices[mac]["humidity"] = decode_humidity(encoded_data)

            govee_devices[mac]["battery"] = battery
            print('govee_devices_end', govee_devices)  
        print_values(mac)

# -------------------- Govee Sensor End-----------------------------------
# -------------------- functions ----------------------------------
def timelapse_func(numFrames, delay):

    timelapseSnapPath = '/home/pi/shared/3DPrinterCam/static/imgs/timelapse/'

    # check if capture path exists, create if not
    if not os.path.exists(timelapseSnapPath):
        os.mkdir(timelapseSnapPath)
    
    else:

        for i in range(numFrames):
            #set a variable with the current time to use as image file name
            curTime = (time.strftime('timelapse' + "%m%j%y" + "_" + "%H%M_%S"))
            #take a photo, give it a name, and resize it to fit into Parse
            rval, frame = vc.read()

            if rval:
                # code to write frame to jpeg with timestamp as filename
                isWritten = cv2.imwrite('/home/pi/shared/3DPrinterCam/static/imgs/timelapse/'+ curTime +'.jpg', frame)
                if isWritten:
                    print('image successfully written to ' + '/home/pi/shared/3DPrinterCam/static/imgs/timelapse/'+ curTime +'.jpg' )
                else:
                    print('img write failed')
            else:
                print('rval - false - check photo snap else section of code', rval)
            print("timelapse snap")
            # wait 5 seconds
            time.sleep(delay)

# -------------------- SocketIO Start -----------------------------------
@socketio.on('my event', namespace='/razData')
def handle_json(json):

    print('received json: ' + str(json))
    shotsTaken = 0
    daysValue = int(json['daysValue'])
    hrsValue = int(json['hrsValue'])
    minsValue = int(json['minsValue'])
    secsValue = int(json['secsValue'])
    delayValue = int(json['delayValue'])

    # calculate sum number of seconds for timelapse
    sumTime = (daysValue * 24 * 60 * 60) + (hrsValue * 60 * 60) + (minsValue * 60) + (secsValue)

    # calculate total frames to be taken
    totalFrames = int(sumTime/delayValue)

    timelapseSnapPath = '/home/pi/shared/3DPrinterCam/static/imgs/timelapse'

    # check if capture path exists, create if not
    if not os.path.exists(timelapseSnapPath):
        os.mkdir(timelapseSnapPath)
    

    # >> looping timelapse functionality <<
    for i in range(totalFrames):
        #set a variable with the current time to use as image file name
        curTimelapseTime = (time.strftime('timelapse' + "%m%j%y" + "_" + "%H%M_%S"))
        #take a photo, give it a name, and resize it to fit into Parse
        rval, frame = vc.read()

        if rval:
            # code to write frame to jpeg with timestamp as filename
            isWritten = cv2.imwrite('/home/pi/shared/3DPrinterCam/static/imgs/timelapse/'+ curTimelapseTime +'.jpg', frame)
            shotsTaken += 1
            remainingFrames = totalFrames - shotsTaken
            if isWritten:
                print('image successfully written to ' + '/home/pi/shared/3DPrinterCam/static/imgs/timelapse/'+ curTimelapseTime +'.jpg' )
            else:
                print('img write failed')
        else:
            print('rval - false - check photo snap else section of code', rval)
        print("timelapse snap")
        
        # control boolean status of loading gif by tracking remaining frames
        if(remainingFrames > 0):
            loadStatus = 'True'
        else:
            loadStatus = 'False'
            print("Finished Timelapse!")

        # build data json object
        dataUpdate = {
            'framesRemaining': remainingFrames,
            'totalFrames': totalFrames,
            'loadStatus': loadStatus
        }
        emit('timelapseUpdate', dataUpdate)

        # wait 5 seconds
        time.sleep(delayValue)    

# @socketio.on('my broadcast event', namespace='/razData')
# def test_message(message):
#     emit('my response', {'data': message['data']}, broadcast=True)

@socketio.on('connect', namespace='/razData')
def test_connect():
    emit('my response', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/razData')
def test_disconnect():
    print('Client disconnected')

@socketio.on('sensorUpdateRequest', namespace='/razData')
def sensor_data(json):

    print('sensor message:', json)
    if(json['sensorStatus'] == 'True'):
        adapter = get_provider().get_adapter()

        observer = Observer(adapter)
        observer.on_advertising_data = on_advertisement
        observer.start()
        time.sleep(5)
        observer.stop()
        emit('tempHumSensorUpdate', govee_devices)
    else:
        emit('tempHumSensorUpdate', {'data': 'data disabled'})

# -------------------- SocketIO End -----------------------------------

if __name__ == '__main__':
    # app.run(debug=False, host='0.0.0.0')
    socketio.run(app, host='0.0.0.0')
    