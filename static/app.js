$(document).ready(function() {

    // Global variables
    let currentPage = 1;
    let numPerPage = 32;
    let numOfPages = 0;
    let pageListArr = [];


    // --------------------- Flask WebSocketIO Start -------------------------------
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/razData');

    // Temp/Humidity Sensor Data
    $(function() { $("#sensorTempHumButton").click(function (e) { 
        e.preventDefault();
        console.log('button clicked');
        let = clickedStatus = $('#sensorTempHumButton').attr("data-clicked");
        // trigger button animation
        // select and grab sensorTempHumButton button by id tag
        const element = document.querySelector('#sensorTempHumButton');
        // add animation class to sensorTempHumButton button via stored id element
        element.classList.add('animate__animated', 'animate__rubberBand');
        // Add detection to remove animation class
        element.addEventListener('animationend', () => {
            element.classList.remove('animate__animated', 'animate__rubberBand');
        });

        // clear container div
        $('#sensorDataArea').empty();

        // conditional to establish which message to send
        if(clickedStatus == 'true'){
            // change button click state
            $('#sensorTempHumButton').attr("data-clicked", "false");
            $('#sensorTempHumButton').text("Click to activate sensors!");

            // clear GIF area
            $('#sensorGifArea').empty();

            // if checked ignore duplicate request action
            console.log('already checked');
            socket.emit('sensorUpdateRequest', {
                msg: 'requesting sensor data',
                sensorStatus: 'False'
            });
        }
        else {
            // change button click state
            $('#sensorTempHumButton').attr("data-clicked", "true");
            $('#sensorTempHumButton').text("Click to stop");
            $('#sensorBtnLabel').text("Sensors active!");

            // build img for sensor connecting gif
            let sensorgifImg = $('<img>');
            $(sensorgifImg).attr("src", "./static/imgs/connect.gif");
            $(sensorgifImg).attr("alt", "sensor data loading");
            $(sensorgifImg).addClass("sensorgifImg")
            $('#sensorGifArea').append(sensorgifImg);

            // unchecked request sensor data
            socket.emit('sensorUpdateRequest', {
                msg: 'requesting sensor data',
                sensorStatus: 'True'
            }); 
        }

    // socket sensor data 
    socket.on('tempHumSensorUpdate', function(sensorData) {
        console.log('tempHumSensorUpdate returned: ', sensorData);
        // convert object data to array
        let sensorDataArr = Object.entries(sensorData);
        // clear container div
        $('#sensorDataArea').empty();

        // perform for loop creating sensor data section
        for (let num = 0; num < sensorDataArr.length; num++){
            // create row div wrapper
            let rowWrapper = $('<div>');
            $(rowWrapper).addClass("row d-flex dataArea justify-content-between mt-3 mb-3");
            // -- create sensor title section --
            let sensorTitleCol = $('<div>');
            $(sensorTitleCol).addClass("p-3 col-12 col-sm-12 col-md-2 col-lg-2 col-xl-2 sensorArea");
            // create img for group
            let sensorTitleImg = $('<img>');
            $(sensorTitleImg).addClass("sensorIcon m-1");
            $(sensorTitleImg).attr("src", "../static/imgs/sensor.png");
            $(sensorTitleImg).attr("alt", "sensor");
            // create text parts for sensor title group
            let sensorTitleP1 = $('<p>');
            $(sensorTitleP1).addClass("font-weight-bolder m-0");
            $(sensorTitleP1).text("Sensor:");
            let sensorTitleP2 = $('<p>');
            $(sensorTitleP2).attr("id", "sensor" + (parseInt(num) + 1));
            $(sensorTitleP2).addClass("m-0");
            $(sensorTitleP2).text((parseInt(num) + 1));
            // append parts to sensorTitleCol
            $(sensorTitleCol).append(sensorTitleImg, sensorTitleP1, sensorTitleP2);

            // -- create humidity data section--
            let sensorHumCol = $('<div>');
            $(sensorHumCol).addClass("p-3 col-4 col-sm-4 col-md-3 col-lg-3 col-xl-3");
            // create img for group
            let sensorHumImg = $('<img>');
            $(sensorHumImg).addClass("dataIcons m-3");
            $(sensorHumImg).attr("src", "../static/imgs/humidity.png");
            $(sensorHumImg).attr("alt", "humidity");
            // create text for humidity sensor
            let sensorHumP = $('<p>');
            $(sensorHumP).attr("id", "humData");
            $(sensorHumP).text(sensorDataArr[num][1].humidity + '%');
            // append parts to sensorHumCol
            $(sensorHumCol).append(sensorHumImg, sensorHumP);

            // -- create temp data section --
            let sensorTempCol = $('<div>');
            $(sensorTempCol).addClass("p-3 col-4 col-sm-4 col-md-3 col-lg-3 col-xl-3");
            // create img for group
            let sensorTempImg = $('<img>');
            $(sensorTempImg).addClass("dataIcons m-3");
            $(sensorTempImg).attr("src", "../static/imgs/thermometer.png");
            $(sensorTempImg).attr("alt", "temperature");
            // create text for temperature sensor
            let sensorTempP = $('<p>');
            $(sensorTempP).attr("id", "tempData");
            $(sensorTempP).html(sensorDataArr[num][1].tempInF + '&#8457;')
            // append parts to sensorTempCol
            $(sensorTempCol).append(sensorTempImg, sensorTempP);

            // -- create battery data section --
            let sensorBattCol = $('<div>');
            $(sensorBattCol).addClass("p-3 col-4 col-sm-4 col-md-3 col-lg-3 col-xl-3");
            // create img for group
            let sensorBattImg = $('<img>');
            $(sensorBattImg).addClass("dataIcons m-3");
            $(sensorBattImg).attr("src", "../static/imgs/battery.png");
            $(sensorBattImg).attr("alt", "battery");
            // create text for temperature sensor
            let sensorBattP = $('<p>');
            $(sensorBattP).attr("id", "battData");
            $(sensorBattP).text(sensorDataArr[num][1].battery + '%');
            // append parts to sensorBattCol
            $(sensorBattCol).append(sensorBattImg, sensorBattP);

            // -- append sections to div wrapper --
            $(rowWrapper).append(sensorTitleCol, sensorHumCol, sensorTempCol, sensorBattCol);
            $('#sensorDataArea').append(rowWrapper);
        }
    });
    });
    });

    // Connected status to console
    socket.on('my response', function(msg) {
        console.log('socket.io server connected');
    });

    // Timelapse update info
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
    });

    // function to detect click to start timelapse
    $(function() { $("#timelapseBtn").click(function (e) { 
        e.preventDefault();
        // gather values
        let daysVal = $('#daysInput').val();
        let hrsVal = $('#hrsInput').val();
        let minsVal = $('#minsInput').val();
        let secsVal = $('#secsInput').val();
        let delayVal = $('#delayInput').val();

        // no data string to integer catch
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

        // checks for no data or lack of enough timelapse data
        let sumInput = daysVal + hrsVal + minsVal + secsVal
        let divCheck = sumInput / delayVal
        console.log("sumInput", sumInput)
        console.log("divCheck", divCheck)
        console.log('infinite check: ', isFinite(divCheck), !isFinite(divCheck) )
        if((sumInput > 0) && (divCheck > 1) && (isFinite(divCheck))) {

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
        }
        else {
            console.log('deciding popover');
            // conditional to trigger needed popover feedback 
            if(sumInput == 0 && !isFinite(divCheck)){
                console.log('timelapse button popover')
                $('#timelapseBtn').popover("toggle");
                setTimeout(function(){ $('#timelapseBtn').popover("toggle"); }, 4000);
            } 
            else if((sumInput != 0) && (divCheck < 1) && (isFinite(divCheck))) {
                console.log('delay input field popover')
                $('#delayDiv').popover("toggle");
                setTimeout(function(){ $('#delayDiv').popover("toggle"); }, 4000);
            }
            // else if(isFinite(divCheck)) {
            //     console.log('infinity check')
            // }
        }
        });
    });
    // $('form#broadcast').submit(function(event) {
    //     socket.emit('my broadcast event', {data: $('#broadcast_data').val()});
    //     return false;
    // });

    // --------------------- Flask WebSocketIO END -------------------------------

    // Range Slider
    var slider = document.getElementById("focusRange");
    var output = document.getElementById("focusValue");
    output.innerHTML = slider.value; // Display the default slider value

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() {
    output.innerHTML = this.value;
    }

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

    // Event listener to update focus
    $(function() { $("#focusBtn").click(function (e) { 
        e.preventDefault();
        let focusVal = $('#focusRange').val();
            console.log('focus value', focusVal)
        $.post('/Focus', {focusValue: focusVal}, function(result) {
            console.log('JS focus adjusted!')
            console.log('result', result)
            });
        });    
    });

    // Add event listener to id snapBtn and trigger a snapshot
    $(function() { $("#snapBtn").click(function (e) { 
        e.preventDefault();
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

    // Grab photo data
    grabGalleryData = () => {
        $.getJSON('/photoGalleryBuild',
        function(data) {
            console.log('returned gallery data', data)
            if (data || data.imgArray) {
                storePhotoData(data.imgArray);
            }
            else {
                console.log('NoData');
            }
    })}

    // Store array locally
    storePhotoData = (photoArr) => {
        localStorage.setItem("photoArr", JSON.stringify(photoArr));
        getNumOfPages();
    }

    // Get variables and calculate range
    getNumOfPages = () => {
        lenOfArr = (JSON.parse(localStorage.getItem("photoArr"))).length;
        numOfPages = Math.ceil(lenOfArr / numPerPage);
        loadPageList();
    }

    // Slice array
    loadPageList = () => {
        let begin = ((currentPage - 1) * numPerPage);
        let end = begin + numPerPage;
        let bulkArr = JSON.parse(localStorage.getItem("photoArr"));
        pageListArr = bulkArr.slice(begin, end);
        populateGallery();
        check();
    }

    // Gallery creation
    populateGallery = () => {

        // Establish Current Page
        $('#currentPG').val(currentPage)

        // Clear and build image gallery
        $('#photoGallery').empty();
        for(i=0; i < pageListArr.length; i++) {
            let startDiv = $('<div>');
            $(startDiv).addClass('col-4');
            let startImg = $('<img>');
            $(startImg).addClass('galleryImg img-thumbnail img-fluid mb-3');
            $(startImg).attr('src', '../static/imgs/captures/' + pageListArr[i]);
            $(startImg).attr('alt', 'printer snapshot');
            $(startDiv).append(startImg);
            $('#photoGallery').append(startDiv);
        }

        // Populate pages index for nav 
    }

    // Check # of pages to disble button status
    check = () => {
        if(currentPage == numOfPages){
            $("#next").prop("disabled", true);
        }
        else {
            $("#next").prop("disabled", false);
        }

        if(currentPage == 1){
            $("#previous").prop("disabled", true);
            $("#first").prop("disabled", true)
        }
        else {
            $("#previous").prop("disabled", false);
            $("#first").prop("disabled", false);
        }

        if(currentPage == numOfPages){
            $("#last").prop("disabled", true);
        }
        else {
            $("#last").prop("disabled", false);
        }
    }

    // Gallery navigation buttons
    nextPage = () => {
        currentPage += 1;
        loadPageList();
    }
    
    previousPage = () => {
        currentPage -= 1;
        loadPageList();
    }
    
    firstPage = () => {
        currentPage = 1;
        loadPageList();
    }
    
    lastPage = () => {
        currentPage = numOfPages;
        loadPageList();
    }

    // Run at page load
    grabGalleryData();

});