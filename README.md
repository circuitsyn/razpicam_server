Possible Install needed for CV2:
https://www.pyimagesearch.com/2015/02/23/install-opencv-and-python-on-your-raspberry-pi-2-and-b/

Realstically seems to have only needed 'sudo apt install python-opencv' to be run


#Code used to flip camera
Due to the camera being upsidedown when installed the following code was needed to flip the frame
''frame = cv2.flip(frame, -1)''


Streaming server resource: https://www.pyimagesearch.com/2015/03/30/accessing-the-raspberry-pi-camera-with-opencv-and-python/

boostrap toggle:
http://www.bootstraptoggle.com/

