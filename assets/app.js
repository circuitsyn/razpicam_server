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
    });
    });

    // gallery creation
    // populateGallery = (photos) => {
    //     console.log(photos)
    //     for(i=0; i < photos.length; i++) {
    //         let startDiv = $('<div>');
    //         $(startDiv).addClass('col-3');
    //         let startImg = $('<img>');
    //         $(startImg).addClass('galleryImg');
    //         $(startImg).attr('src', photos[i])
    //         $(startDiv).append(startImg);
    //     }
    // }

    // grab photo data
    grabGalleryData = () => {
        $.getJSON('/photoGalleryBuild',
        function(data) {console.log('data', data) });
    }

    grabGalleryData();


});