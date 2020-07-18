Possible Install needed for CV2:
https://www.pyimagesearch.com/2015/02/23/install-opencv-and-python-on-your-raspberry-pi-2-and-b/

Realstically seems to have only needed 'sudo apt install python-opencv' to be run


#Code used to flip camera
Due to the camera being upsidedown when installed the following code was needed to flip the frame
''frame = cv2.flip(frame, -1)''


Streaming server resource: https://www.pyimagesearch.com/2015/03/30/accessing-the-raspberry-pi-camera-with-opencv-and-python/

boostrap toggle:
http://www.bootstraptoggle.com/

Animate CSS:
https://animate.style/

Python WebSocket using Flask Socket IO
https://www.includehelp.com/python/implementation-of-websocket-using-flask-socket-io-in-python.aspx
** socketio = SocketIO(app, async_mode='threading') 
Above code needed to prevent lagging of AJAX calls while polling happens. Found solution here: https://stackoverflow.com/questions/34581255/python-flask-socketio-send-message-from-thread-not-always-working
also an older version CDN used for socket.io https://cdnjs.com/libraries/socket.io/1.7.4

pagination: https://www.thatsoftwaredude.com/content/6125/how-to-paginate-through-a-collection-in-javascript

python 3 install issues: https://stackoverflow.com/questions/53137197/importing-opencv-in-python-idle-error-shared-object-file

**Hey, this is because the latest version of openCV doesn't work with RPi. Instead of pip3 install opencv-python try pip3 install opencv-python==3.4.6.27
You will need to uninstall the latest version first. pip3 uninstall opencv-python