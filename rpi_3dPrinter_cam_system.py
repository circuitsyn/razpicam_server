from flask import Flask, render_template, Response
import picamera
import cv2
import socket
import io

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
        #flip code to turn camera view upside down
        frame = cv2.flip(frame, -1)
        byteArray = cv2.imencode('.jpg', frame)[1].tobytes()
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + byteArray + b'\r\n')

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')