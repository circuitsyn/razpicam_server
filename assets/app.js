$(document).ready(function() {

    // --------------------- Flask WebSocketIO Start -------------------------------
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/razData');

    // Connected status to console
    socket.on('my response', function(msg) {
        console.log('socket.io server connected');
    });

    socket.on('timelapseUpdate', function(timeData) {
        console.log('timeData returned: ', timeData);

        // Disable fields and submit button until finished
        if (timeData.loadStatus === "True") {
            $('#daysInput').attr('disabled', true);
            $('#hrsInput').attr('disabled', true);
            $('#minsInput').attr('disabled', true);
            $('#secsInput').attr('disabled', true);
            $('#delayInput').attr('disabled', true);
            $('#timelapseBtn').attr('disabled', true);
        }
        else {
            $('#daysInput').attr('disabled', false);
            $('#hrsInput').attr('disabled', false);
            $('#minsInput').attr('disabled', false);
            $('#secsInput').attr('disabled', false);
            $('#delayInput').attr('disabled', false);
            $('#timelapseBtn').attr('disabled', false);
        }
        
        // create total frame section
        if (timeData.loadStatus === "True") {
            $('#totalFrameSec').empty();
            let frameCount = $('<p>');
            $(frameCount).addClass('frameText');
            $(frameCount).text("Total Frames: " + timeData.totalFrames);
            $('#totalFrameSec').append(frameCount);
        }
        else {
            $('#totalFrameSec').empty();
        }

        
        // create remaining frame section
        if (timeData.loadStatus === "True") {
            $('#remainingFrameSec').empty();
            let remaingFrames = $('<p>');
            $(remaingFrames).addClass('frameText');
            $(remaingFrames).text("Remaining Frames: " + timeData.framesRemaining);
            $('#remainingFrameSec').append(remaingFrames);
        }
        else {
            $('#remainingFrameSec').empty();
        }

        // create loading image section
        if (timeData.loadStatus === "True") {
            $('#timeImgSec').empty();
            let loadingImg = $('<img>');
            $(loadingImg).attr("id","timelapseLoadingGif");
            loadingImg.attr('src', './static/imgs/loadingcat.gif');
            loadingImg.attr('alt', 'loading toaster cat');
            $('#timeImgSec').append(loadingImg);
        }
        else {
            $('#timeImgSec').empty();
        }
        
        
        // $('#timelapseData').append(frameCount, remaingFrames, loadingImg);
    });

    $(function() { $("#timelapseBtn").click(function (e) { 

        // gather values
        let daysVal = $('#daysInput').val();
        let hrsVal = $('#hrsInput').val();
        let minsVal = $('#minsInput').val();
        let secsVal = $('#secsInput').val();
        let delayVal = $('#delayInput').val();

        // no data catch
        if (!daysVal || daysVal == "") {
            daysVal = 0;
        }

        if (!hrsVal || hrsVal == "") {
            hrsVal = 0;
        }

        if (!minsVal || minsVal == "") {
            minsVal = 0;
        }

        if (!secsVal || secsVal == "") {
            secsVal = 0;
        }

        if (!delayVal || delayVal == "") {
            delayVal = 0;
        }

        console.log('Days: ', daysVal, 'hrs: ', hrsVal, 'mins: ', minsVal, 'secs: ', secsVal, 'delayInput: ', delayVal);

        socket.emit('my event', {
            daysValue: daysVal,
            hrsValue: hrsVal,
            minsValue: minsVal,
            secsValue: secsVal,
            delayValue: delayVal  
        });

        // trigger snap button animation
        // select and grab snap photo button by id tag
        const element = document.querySelector('#timelapseBtn');
        // add animation class to snap button via stored id element
        element.classList.add('animate__animated', 'animate__rubberBand');
        // Add detection to remove animation class
        element.addEventListener('animationend', () => {
            element.classList.remove('animate__animated', 'animate__rubberBand');
        });

        return false;
        });
    });
    // $('form#broadcast').submit(function(event) {
    //     socket.emit('my broadcast event', {data: $('#broadcast_data').val()});
    //     return false;
    // });

    // --------------------- Flask WebSocketIO END -------------------------------

    // Add listener to gallery images to launch modal
    $(document).on('click', ".galleryImg", function(e){ 
        e.preventDefault();
        let filename = $(this).attr("src");
        $(loadingGif).attr("src", filename);
        $('#photoModal').modal('show');
    });    

    // Event listener to delete photo
    $(function() { $("#deleteBtn").click(function (e) { 
        e.preventDefault();
        let filename = $('#loadingGif').attr('src');
            filename = filename.slice(2);
            filename = '/home/pi/shared/3DPrinterCam/' + filename;
        $.post('/PhotoDelete', {filenameVal: filename}, function(result) {
            grabGalleryData();
            });
        });    
    });

    // Add event listener to id snapBtn and trigger a snapshot
    $(function() { $("#snapBtn").click(function (e) { 
        e.preventDefault();
    // $("#snapBtn").on('click', function (e) { 
        console.log('event triggered');
        $.post('/PhotoSnap', {}, function(result) {
            grabGalleryData();
            // trigger snap button animation
            // select and grab snap photo button by id tag
            const element = document.querySelector('#snapBtn');
            // add animation class to snap button via stored id element
            element.classList.add('animate__animated', 'animate__rubberBand');
            // Add detection to remove animation class
            element.addEventListener('animationend', () => {
            element.classList.remove('animate__animated', 'animate__rubberBand');
            });
        });    
    });
    });

    // Add event listener to id #timelapseBtn and trigger a snapshot
    // $(function() { $("#timelapseBtn").click(function (e) { 
    //     e.preventDefault();
        
    //     // gather values
    //     let daysVal = $('#daysInput').val();
    //     let hrsVal = $('#hrsInput').val();
    //     let minsVal = $('#minsInput').val();
    //     let secsVal = $('#secsInput').val();
    //     let delayVal = $('#delayInput').val();

    //     // no data catch
    //     if (!daysVal || daysVal == "") {
    //         daysVal = 0;
    //     }

    //     if (!hrsVal || hrsVal == "") {
    //         hrsVal = 0;
    //     }

    //     if (!minsVal || minsVal == "") {
    //         minsVal = 0;
    //     }

    //     if (!secsVal || secsVal == "") {
    //         secsVal = 0;
    //     }

    //     if (!delayVal || delayVal == "") {
    //         delayVal = 0;
    //     }

    //     console.log('Days: ', daysVal, 'hrs: ', hrsVal, 'mins: ', minsVal, 'secs: ', secsVal, 'delayInput: ', delayVal);

    //     $.post('/TimelapseSubmit', {
    //         daysValue: daysVal,
    //         hrsValue: hrsVal,
    //         minsValue: minsVal,
    //         secsValue: secsVal,
    //         delayValue: delayVal  
    //     });

    //     // trigger snap button animation
    //     // select and grab snap photo button by id tag
    //     const element = document.querySelector('#timelapseBtn');
    //     // add animation class to snap button via stored id element
    //     element.classList.add('animate__animated', 'animate__rubberBand');
    //     // Add detection to remove animation class
    //     element.addEventListener('animationend', () => {
    //         element.classList.remove('animate__animated', 'animate__rubberBand');
    //     });
    // });
    // });

    // gallery creation
    populateGallery = (photosObj) => {
        $('#photoGallery').empty();
        let filenameARR = photosObj.imgArray;
        for(i=0; i < filenameARR.length; i++) {
            let startDiv = $('<div>');
            $(startDiv).addClass('col-3');
            let startImg = $('<img>');
            $(startImg).addClass('galleryImg img-thumbnail img-fluid mb-3');
            $(startImg).attr('src', '../static/imgs/captures/' + filenameARR[i]);
            $(startImg).attr('alt', 'printer snapshot');
            $(startDiv).append(startImg);
            $('#photoGallery').append(startDiv);
        }
    }

    // grab photo data
    grabGalleryData = () => {
        $.getJSON('/photoGalleryBuild',
        function(data) {
            if (data || data.imgArray) {
                populateGallery(data);
            }
            else {
                console.log('NoData');
            }
    })}
        

    grabGalleryData();


});