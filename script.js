document.getElementById('enterButton').addEventListener('click', function() {


    document.querySelectorAll('.placeholder').forEach(function(placeholder) {
            placeholder.innerHTML = '';
    });

    const numReq = 5;
    const projectName = 'empathy_regulation';
    const userPrompt = document.getElementById('textInput').value;
    let responseURL = '';
    let gptPrompt = '';
    let serverURLImage = '';
    let currentPlaceholderIndex = 1;

    function displayImage(url) {
        const resultContainer = document.getElementById('resultContainer');
        const img = document.createElement('img');
        img.src = url;
        img.style.width = '100%';
        img.draggable = true;
        img.addEventListener('dragstart', dragStart);

        const placeholder = document.getElementById(`placeholder${currentPlaceholderIndex}`);
        if (placeholder) {
            placeholder.appendChild(img);
            currentPlaceholderIndex++;
        }
    }


    function dragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.src);
        event.dataTransfer.setData('source-id', event.target.parentElement.id);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const imgSrc = event.dataTransfer.getData('text/plain');
        const sourceId = event.dataTransfer.getData('source-id');
        const img = document.createElement('img');
        img.src = imgSrc;
        img.style.width = '100%';
        img.draggable = true;
        img.addEventListener('dragstart', dragStart);

        const sourcePlaceholder = document.getElementById(sourceId);
        if (sourcePlaceholder && sourcePlaceholder !== event.target && event.target.classList.contains('placeholder')) {
            sourcePlaceholder.innerHTML = '';
        }

        event.target.innerHTML = '';
        event.target.appendChild(img);
    }


    const placeholders = document.querySelectorAll('.placeholder');
    placeholders.forEach(placeholder => {
        placeholder.addEventListener('dragover', dragOver);
        placeholder.addEventListener('drop', drop);
    });


    displayImage('https://talhakhantri.github.io/1.png')
    displayImage('https://talhakhantri.github.io/2.png')
    displayImage('https://talhakhantri.github.io/3.png')
    displayImage('https://talhakhantri.github.io/4.png')
    displayImage('https://talhakhantri.github.io/5.png')

});




document.getElementById('SubmitRanksButton').addEventListener('click', function() {
    let countImages = 0;
    let imageMap = new Map();
    function checkImagesInPlaceholders() {
        const placeholders = document.querySelectorAll('#rankContainer .placeholder');
        placeholders.forEach((placeholder, index) => {
            const hasImage = placeholder.querySelector('img') !== null;
            if (hasImage) {
                countImages += 1;
            }
        });
        if (countImages == 5) {
            placeholders.forEach((placeholder, index) => {
                imageMap.set(placeholder.id, placeholder.querySelector('img').src)
            });
            if (submitted == false) {
                console.log('here');
                imageMap.set("description", document.getElementById("textInput").value);
                send(Object.fromEntries(imageMap));
                document.getElementById('SubmitRanksButton').style.display = 'none';
                document.getElementById('enterButton').style.display = 'none';
            }
        } else {
            alert('Please rank all the images.');
        }
    }
    checkImagesInPlaceholders();
});




function send(m) {
    if (window.self !== window.top) {
        parent.postMessage(m, "*");
    }
}


let d;
let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
let eventer = window[eventMethod];
let messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
let submitted = false;



eventer(messageEvent, function (e) {
    let data;
    if (e.data) {
        data = e.data
    } else if (e.message) {
        data = e.data
    }
    console.log("Message received", data);
});





