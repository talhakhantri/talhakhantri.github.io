window.onload = function() {
    let placeholders = document.querySelectorAll('.placeholder');
    let frameWidth = document.body.scrollWidth;
    placeholderWidth = (frameWidth * 0.85) / 5;
    placeholders.forEach(placeholder => {
        placeholder.style.width = `${placeholderWidth}px`;
        placeholder.style.height = `${placeholderWidth}px`;
     });
    placeholders = document.querySelectorAll('.hiddenPlaceholder');
    placeholderWidth = (frameWidth * 0.85) / 5;
    placeholders.forEach(placeholder => {
        placeholder.style.width = `${placeholderWidth}px`;
     });

    placeholders = document.querySelectorAll('.rank');
    placeholderWidth = (frameWidth * 0.85) / 5;
    placeholders.forEach(placeholder => {
        placeholder.style.width = `${placeholderWidth}px`;
     });


    // set the button sizes
    let leftButton = document.getElementById('leftArrow')
    let rightButton = document.getElementById('rightArrow')
    leftButton.style.width = placeholderWidth/7 + 'px';
    rightButton.style.width = placeholderWidth/7 + 'px';
    leftButton.style.height = placeholderWidth/7 + 'px';
    rightButton.style.height = placeholderWidth/7 + 'px';


    leftButton = document.getElementById('hiddenLeftArrow')
    rightButton = document.getElementById('hiddenRightArrow')
    leftButton.style.width = placeholderWidth/7 + 'px';
    rightButton.style.width = placeholderWidth/7 + 'px';
    leftButton = document.getElementById('hiddenTextLeftArrow')
    rightButton = document.getElementById('hiddenTextRightArrow')
    leftButton.style.width = placeholderWidth/7 + 'px';
    rightButton.style.width = placeholderWidth/7 + 'px';


    // send frame height to parent to disable scroll bar
    var height = document.body.scrollHeight;
    window.parent.postMessage({ frameHeight: height }, '*');

};



let d;
let key;
let eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
let eventer = window[eventMethod];
let messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
let submitted = false;
let imagesRetrieved = 0; // total number of images successfully retrieved
let imagesDisplayed = 0; // control the number of images displayed
let tryNumber = 1; // times user has entered text
let currentPlaceholderIndex = 1; // where the next image should be displayed
let userDescriptions = ['', '', ''];


eventer(messageEvent, function (e) {
    if (e.data.api_key) {
        key = e.data.api_key;
    }
});


document.getElementById('enterButton').addEventListener('click', function() {


    if (tryNumber > 1)
    {
        shiftPlaceholders(1);
    }


    const numReq = 8;
    const projectName = 'empathy_regulation';
    let userPrompt = document.getElementById('textInput').value;
    let responseURL = '';
    let gptPrompt = '';
    let serverURLImage = '';



    //*****************************************
    const serverURLChat = `https://macresear.ch/envision-xr-server/generate_text?key=${key}&prompt_text=${encodeURIComponent(userPrompt) + '.' + 'Just give one response.'}`;

    const enterButton = document.getElementById('enterButton');
    let loadingInterval;

    function startLoading() {
        enterButton.disabled = true;
        enterButton.innerHTML = "<strong>Please wait...</strong>";
        enterButton.classList.add('loading');
    }

    function stopLoading() {
        enterButton.disabled = false;
        enterButton.classList.remove('loading');
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
                    // if image is generated
                    if (data.status === 1) {
                        imagesRetrieved += 1;
                        resolve(data);
                    }
                    // if generation still in process
                    else if (data.status === 0) {
                        if (imagesDisplayed >= 5) {
                            stopLoading();
                            resolve(data);
                        }
                        setTimeout(() => checkStatus(resolve, reject), interval);
                    }
                    // if generation failed
                    else if (data.status === -1) {
                        resolve(data);
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


    userDescriptions[tryNumber - 1] = userPrompt;
    document.getElementById('user_prompt').innerHTML = `<strong>${userDescriptions[tryNumber - 1]}</strong>`;
    
    startLoading();

    const fetchPromisesText = [];
    const fetchPromisesImages = [];

    for (let i = 0; i < numReq; i++) {
        fetchPromisesText.push(
            fetch(serverURLChat)
                .then(response => response.json())
                .then(data => {
                    serverURLImage = `https://macresear.ch/envision-xr-server/generate_item?key=${key}&model=dall-e&text_prompt=${encodeURIComponent(data.prompt_text_modified)}&modify_text_prompt=1`;
                    fetchPromisesImages.push(
                        fetchDataImages(serverURLImage)
                            .then(result => {
                                if (result.status === 1) {
                                    const imageUrl = result.file.slice(2, -2);
                                    if (imagesDisplayed < 5) {
                                        displayImage(imageUrl);
                                        imagesDisplayed += 1;
                                    }
                                }
                            })
                    );
                })
        );
    }


    Promise.all(fetchPromisesText)
        .then(() => {
            return Promise.all(fetchPromisesImages);
        })
        .then(() => {
            tryNumber += 1;
            // imagesRetrieved = 0;
            imagesDisplayed = 0;
            // user gets a total of 3 tries
            if (tryNumber == 4) {
                enterButton.style.display = "none";
            }
            enterButton.innerHTML = `<strong>Generate Images (${tryNumber}/3)</strong>`;
        });
    //*****************************************



    function displayImage(url) {
        const resultContainer = document.getElementById('resultContainer');
        const img = document.createElement('img');
        img.src = url;
        img.alt = userPrompt;
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
        event.dataTransfer.setData('alt-text', event.target.alt);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const imgSrc = event.dataTransfer.getData('text/plain');
        const sourceId = event.dataTransfer.getData('source-id');
        const img = document.createElement('img');
        const altText = event.dataTransfer.getData('alt-text');
        img.src = imgSrc;
        img.alt = altText;
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


});



document.getElementById('SubmitRanksButton').addEventListener('click', function() {
    let imagesRanked = 0;
    let imageMap = new Map();
    function checkImagesInPlaceholders() {
        const placeholders = document.querySelectorAll('#rankContainer .placeholder');
        placeholders.forEach((placeholder, index) => {
            const hasImage = placeholder.querySelector('img') !== null;
            if (hasImage) {
                imagesRanked += 1;
            }
        });
        if ((imagesRetrieved >= 5 && imagesRanked == 5) || (imagesRetrieved < 5 && imagesRanked == imagesRetrieved)) {
            placeholders.forEach((placeholder, index) => {
                imageMap.set(placeholder.id, placeholder.querySelector('img').src + ' -- ' + placeholder.querySelector('img').alt);
            });
            if (submitted == false) {
                imageMap.set('all_ranks', 'submitted');
                send(Object.fromEntries(imageMap));
                document.getElementById('SubmitRanksButton').style.display = 'none';
                document.getElementById('enterButton').style.display = 'none';
                submitted = true;
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




document.getElementById('leftArrow').addEventListener('click', () => shiftPlaceholders(-1));
document.getElementById('rightArrow').addEventListener('click', () => shiftPlaceholders(1));

let currentStart = 0;
const maxVisible = 5;

function updateVisibility() {
    const placeholders = document.querySelectorAll('#resultContainer .placeholder');
    placeholders.forEach((placeholder, index) => {
        placeholder.style.display = index >= currentStart && index < currentStart + maxVisible ? 'block' : 'none';
    });
}

function shiftPlaceholders(direction) {
    const totalPlaceholders = document.querySelectorAll('#resultContainer .placeholder').length;
    currentStart += direction * maxVisible;
    if (currentStart >= totalPlaceholders) {
        currentStart = 0;
    } else if (currentStart < 0) {
        currentStart = totalPlaceholders - maxVisible;
        if (currentStart < 0) currentStart = 0;
    }

    if ((currentStart == 0 && userDescriptions[0] == '') || (currentStart == 5 && userDescriptions[1] == '') || (currentStart == 10 && userDescriptions[2] == '')) {
        document.getElementById('user_prompt').innerHTML = `The descriptions for the images generated below will appear here once generate images is clicked.`;
    } else {
        document.getElementById('user_prompt').innerHTML = `<strong>${userDescriptions[currentStart / 5]}</strong>`;
    }
    updateVisibility();
}

updateVisibility();