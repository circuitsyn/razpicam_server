$(document).ready(function() {

    $(function() { $("#snapBtn").click(function (event) { 
        $.getJSON('/PhotoSnap', { },
    function(data) { }); return false; }); 
    // trigger snap button animation
    animateCSS('#snapBtn', 'animate__rubberBand');
    });


    // const animateCSS = (element, animation, prefix = 'animate__') =>
    // // We create a Promise and return it
    // new Promise((resolve, reject) => {
    //     const animationName = `${prefix}${animation}`;
    //     const node = document.querySelector(element);

    //     node.classList.add(`${prefix}animated`, animationName);

    //     // When the animation ends, we clean the classes and resolve the Promise
    //     function handleAnimationEnd() {
    //     node.classList.remove(`${prefix}animated`, animationName);
    //     node.removeEventListener('animationend', handleAnimationEnd);

    //     resolve('Animation ended');
    //     }

    //     node.addEventListener('animationend', handleAnimationEnd);
    // });

    // annimate.css function
    animateCSS = (element, animationName, callback) => {
        const node = document.querySelector(element)
        node.classList.add('animated', animationName)

    function handleAnimationEnd() {
    node.classList.remove('animated', animationName)
    node.removeEventListener('animationend', handleAnimationEnd)

    if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
        }




});