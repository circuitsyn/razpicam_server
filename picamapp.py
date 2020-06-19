from flask import Flask, render_template, Response, jsonify, request
import picamera
import cv2
import socket
import io
import os
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
@app.route('/PhotoSnap')
def PhotoSnap():
    print('In PhotoSnap')
    # command = "raspistill -o \shared\img.jpg"
    # os.system(command)

    #set a variable with the current time to use as image file name
    curTime = (time.strftime("%I%M%S"))
    print(curTime)
    #take a photo, give it a name, and resize it to fit into Parse
    # cam.capture(curTime, resize=(320,240))
    rval, frame = vc.read()
    frame = cv2.flip(frame, -1)
    # code to write frame to jpeg with timestamp as filename
    cv2.imwrite('/home/pi/shared/3DPrinterCam/photos/'+ curTime  +'.jpg', frame)
    return "Nothing"

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')