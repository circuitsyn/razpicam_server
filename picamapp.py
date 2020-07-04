from flask import Flask, render_template, Response, jsonify, request
from flask_socketio import SocketIO, emit
import picamera
import json
import cv2
import socket
import io
import os
import glob
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'include_help!'
socketio = SocketIO(app, async_mode='threading')
# os.urandom(12)

shotsTaken = 0

vc = cv2.VideoCapture(0)
vc.set(3, 1280)
vc.set(4, 720)

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

    if rval:
        # code to write frame to jpeg with timestamp as filename
        isWritten = cv2.imwrite('/home/pi/shared/3DPrinterCam/static/imgs/captures/'+ curTime +'.jpg', frame)
        if isWritten:
            print('image successfully written to ' + '/home/pi/shared/3DPrinterCam/static/imgs/captures/'+ curTime +'.jpg' )
        else:
            print('img write failed')
    else:
        print('rval - false - check photo snap else section of code', rval)
    # vc.release()
    return "Nothing"

# Delete Photo Function
@app.route('/PhotoDelete', methods=['GET', 'POST'])
def PhotoDelete():
    filenameVal = request.form['filenameVal']
    print('filename: ', filenameVal)
    os.remove(filenameVal)
    print("confirmed deletion")
    return "Nothing"

# Timelapse
@app.route('/TimelapseSubmit', methods=['POST'])
def TimelapseSubmit():
    daysValue = int(request.form['daysValue'])
    hrsValue = int(request.form['hrsValue'])
    minsValue = int(request.form['minsValue'])
    secsValue = int(request.form['secsValue'])
    delayValue = int(request.form['delayValue'])
    print(daysValue, hrsValue, minsValue, secsValue, delayValue)

    # Calculate sum number of seconds for timelapse
    sumTime = (daysValue * 24 * 60 * 60) + (hrsValue * 60 * 60) + (minsValue * 60) + (secsValue)
    # calculate total frames to be taken
    total = int(sumTime/delayValue, 0)
    remaining = total - shotsTaken

    dataUpdate = {
        'framesRemaining': remaining,
        'totalFrames': total
    }

    print(dataUpdate)
    
    return "Nada"

# Gallery Provide & Update
@app.route('/photoGalleryBuild', methods=['GET', 'POST'])
def photoGalleryBuild():
    path = "/home/pi/shared/3DPrinterCam/static/imgs/captures/"
    imgData = map(os.path.basename, sorted(glob.glob(path + "*jpg")))
    return jsonify({"imgArray": imgData})

# -------------------- SocketIO -----------------------------------
@socketio.on('my event', namespace='/razData')
def handle_json(json):
    print('received json: ' + str(json))

    daysValue = int(json['daysValue'])
    hrsValue = int(json['hrsValue'])
    minsValue = int(json['minsValue'])
    secsValue = int(json['secsValue'])
    delayValue = int(json['delayValue'])
    # print('values',daysValue, hrsValue, minsValue, secsValue, delayValue)

    # Calculate sum number of seconds for timelapse
    sumTime = (daysValue * 24 * 60 * 60) + (hrsValue * 60 * 60) + (minsValue * 60) + (secsValue)
    # calculate total frames to be taken
    total = int(sumTime/delayValue)
    remaining = total - shotsTaken

    dataUpdate = {
        'framesRemaining': remaining,
        'totalFrames': total
    }

    print(dataUpdate)


    emit('timelapseUpdate', dataUpdate)

# @socketio.on('my broadcast event', namespace='/razData')
# def test_message(message):
#     emit('my response', {'data': message['data']}, broadcast=True)

@socketio.on('connect', namespace='/razData')
def test_connect():
    emit('my response', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/razData')
def test_disconnect():
    print('Client disconnected')

# @socketio.on('timelapseUpdate', namespace='/razData')
# def timelapse_data_update(dataUpdate):
#     emit('my response', {'data': dataUpdate['data']})

if __name__ == '__main__':
    # app.run(debug=False, host='0.0.0.0')
    socketio.run(app, host='0.0.0.0')
    # socketio.run(app, host='0.0.0.0', policy_server=False)
    