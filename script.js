let d;
let key;
let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
let eventer = window[eventMethod];
let messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
let submitted = false;
let fW;


eventer(messageEvent, function (e) {
    if (e.data.api_key) {
        key = e.data.api_key;
    }
});


window.onload = function() {
    var height = document.body.scrollHeight;
    window.parent.postMessage({ frameHeight: height }, '*');
};


document.getElementById('enterButton').addEventListener('click', function() {


    document.querySelectorAll('.placeholder').forEach(function(placeholder) {
            placeholder.innerHTML = '';
    });


    key = "B4Lp6vxGz7jNmWb5QwlsK9Tt";
    const numReq = 5;
    const projectName = 'empathy_regulation';
    const userPrompt = document.getElementById('textInput').value;
    let responseURL = '';
    let gptPrompt = '';
    let serverURLImage = '';
    let currentPlaceholderIndex = 1;



    //*****************************************
    const serverURLChat = `https://macresear.ch/envision-xr-server/generate_text?key=${key}&text_prompt=${encodeURIComponent(userPrompt)}&modify_text_prompt=1`;

    const enterButton = document.getElementById('enterButton');
    let loadingInterval;

    function startLoading() {
        enterButton.disabled = true;
        enterButton.innerHTML = "<strong>Please wait...</strong>";
        enterButton.classList.add('loading');
    }

    function stopLoading() {
        enterButton.classList.remove('loading');
        enterButton.style.display = "none";
    }

    function fetchDataChat(url) {
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                return data.prompt_text_modified;
            });
    }

    function fetchDataImages(url) {
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                responseURL = `https://macresear.ch/envision-xr-server/item/${data.uid}?key=${key}`;
                return pollForStatus(responseURL);
            });
    }

    function pollForStatus(url) {
        const interval = 2000;

        function checkStatus(resolve, reject) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 1) {
                        resolve(data);
                    }
                    else if (data.status === 0) {
                        setTimeout(() => checkStatus(resolve, reject), interval);
                    }
                    else if (data.status === -1) {
                        console.log('image not retrieved');
                        console.log(data);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        }
        return new Promise(checkStatus);
    }


    if (!userPrompt) {
        alert('Please enter some text before generating images.');
        return;
    }

    startLoading();

    const fetchPromisesText = [];
    const fetchPromisesImages = [];

    for (let i = 0; i < numReq; i++) {
        fetchPromisesText.push(
            fetch(serverURLChat)
                .then(response => response.json())
                .then(data => {
                    serverURLImage = `https://macresear.ch/envision-xr-server/generate_item?key=${key}&model=dall-e&text_prompt=${encodeURIComponent(data.prompt_text_modified)}&n=1&project=${projectName}`;
                    fetchPromisesImages.push(
                        fetchDataImages(serverURLImage)
                            .then(result => {
                                const imageUrl = result.file.slice(2, -2);
                                displayImage(imageUrl);
                            })
                    );
                })
        );
    }


    Promise.all(fetchPromisesText)
        .then(() => Promise.all(fetchPromisesImages))
        .then(() => {
            stopLoading();
        });
    //*****************************************







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


    // displayImage('https://talhakhantri.github.io/1.png')
    // displayImage('https://talhakhantri.github.io/2.png')
    // displayImage('https://talhakhantri.github.io/3.png')
    // displayImage('https://talhakhantri.github.io/4.png')
    // displayImage('https://talhakhantri.github.io/5.png')

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


// function setPlaceholderWidth() {
//     const placeholders = document.querySelectorAll('.placeholder');
//     let w = fW * 0.90;
//     w -= fW * 0.1;

//     placeholders.forEach(placeholder => {
//         placeholder.style.width = `${w/5}px`;
//         placeholder.style.height = `${w/5}px`;
//     });
// }