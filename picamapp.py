from flask import Flask, render_template, Response, jsonify, request
import picamera
import json
import cv2
import socket
import io
import os
import glob
import time

app = Flask(__name__)

vc = cv2.VideoCapture(0)

@app.route('/')
def index():
    """Video streaming"""
    return render_template('index.html')

def gen():
    """Video streaming generator function."""
    while True:
        rval, frame = vc.read()
        frame = cv2.flip(frame, -1)
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
    # os.system(command)
    print("snap snap")
    #set a variable with the current time to use as image file name
    curTime = (time.strftime("%m%j%y"+"_"+"%H%M"))
    #take a photo, give it a name, and resize it to fit into Parse
    rval, frame = vc.read()
    frame = cv2.flip(frame, -1)
    # code to write frame to jpeg with timestamp as filename
    cv2.imwrite('/home/pi/shared/3DPrinterCam/static/imgs/captures/'+ curTime +'.jpg', frame)
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
    print(int(delayValue) * 4)
    print(daysValue, hrsValue, minsValue, secsValue, delayValue)
    return "Nada"

# Gallery Provide & Update
@app.route('/photoGalleryBuild', methods=['GET', 'POST'])
def photoGalleryBuild():
    path = "/home/pi/shared/3DPrinterCam/static/imgs/captures/"
    imgData = map(os.path.basename, sorted(glob.glob(path + "*jpg")))
    return jsonify({"imgArray": imgData})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')