$(document).ready(function() {

    // Add event listener to id snapBtn and trigger a snapshot
    $(function() { $("#snapBtn").click(function (event) { 
        $.getJSON('/PhotoSnap', { },
        function(data) { });
        
        // trigger snap button animation
        // select and grab snap photo button by id tag
        const element = document.querySelector('#snapBtn');
        // add animation class to snap button via stored id element
        element.classList.add('animate__animated', 'animate__rubberBand');
        // Add detection to remove animation class
        element.addEventListener('animationend', () => {
            element.classList.remove('animate__animated', 'animate__rubberBand');
        });
        grabGalleryData();
    });
    });

    // gallery creation
    populateGallery = (photosObj) => {
        console.log(photosObj);
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