$(document).ready(function() {

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
            console.log('result: ', filename)
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
            console.log('result: ', result)
            grabGalleryData();
            console.log('doing the .then');
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
    $(function() { $("#timelapseBtn").click(function (e) { 
        e.preventDefault();
        
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

        $.post('/TimelapseSubmit', {
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
    });
    });

    // gallery creation
    populateGallery = (photosObj) => {
        console.log('running populate gallery')
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
            console.log('entered grab gallery data after button click')
            if (data || data.imgArray) {
                populateGallery(data);
                console.log('triggered populate photoGallery function')
            }
            else {
                console.log('NoData');
            }
    })}
        

    grabGalleryData();


});