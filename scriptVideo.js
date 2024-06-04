window.onload = function() {
    var height = document.body.scrollHeight;
    window.parent.postMessage({ frameHeight: height }, '*');
};


let d;
let key;
let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
let eventer = window[eventMethod];
let messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";


eventer(messageEvent, function (e) {
    if (e.data.api_key) {
        key = e.data.api_key;
    }
});