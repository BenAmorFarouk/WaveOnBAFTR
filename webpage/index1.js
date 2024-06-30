let image = null;
let contours = new cv.MatVector(); // Initialize contours as a cv.MatVector
let selectedContour = null;
var newSelectedContour = null;
let drawnContour = [];
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let statusLabel = document.getElementById('status-label');
let messageContainer = document.getElementById('message-container');

document.getElementById('show-contours-button').addEventListener('click', detectAndDisplayContours);
document.getElementById('select-contour-button').addEventListener('click', selectContour);
document.getElementById('draw-contour-button').addEventListener('click', drawContour);
document.getElementById('end-draw-button').addEventListener('click', endDraw);
document.getElementById('calculate-distance-button').addEventListener('click', calculateDistance);
document.getElementById('save-button').addEventListener('click', saveImageAndText);
document.getElementById('clear-draw-button').addEventListener('click', clearDraw);

let thresholdSlider = document.getElementById('threshold-slider');
let thresholdValueLabel = document.getElementById('threshold-value');

let selectImageBtn = document.getElementById('selectImageBtn');
let getImageModal = document.getElementById('getImageModal');
let allImages = [];
const directoryUrl = 'http://192.168.14.14:5000/get_images';
let modelSelectImageSrc = "";
let folders = document.querySelectorAll('.folder');

/**
 * Render folder with image buttons
 * @param {Object} folder - Folder object with image URLs
 * @returns {HTMLElement} - Folder HTML element
 */
function renderFolder(folder) {
    let imageBtnsHtml = folder.image_urls.map(image => `
        <button class="image-btn" data-image-btn>
            <img src="http://192.168.14.14:5000/view_folder/main/${image.substring(image.indexOf('DATA/'))}" alt="">
        </button>
    `).join('');
    let folderHtml = document.createElement('div');
    folderHtml.classList.add('folder');
    folderHtml.innerHTML = `
        <button class="folder-name" data-folder-toggler>
            <span class="folder-name-label">${folder.folder_name}</span>
            <span class="folder-toggler" data-folder-toggler-icon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </span>
        </button>
        <div class="folder-images" data-folder-images>${imageBtnsHtml}</div>
    `;
    return folderHtml;
}

/**
 * Fetch images from server and render folders
 */
function getImagesFromServer() {
    fetch(directoryUrl)
        .then(response => response.json())
        .then(data => {
            data.forEach(folder => {
                getImageModal.querySelector('.modal__container').querySelector('.folders').appendChild(renderFolder(folder));
            });
            setupFolderButtons();
        })
        .catch(error => console.error('Error fetching directory:', error));
}

/**
 * Close modal
 */
function closeModal() {
    getImageModal.classList.remove('c-block');
}

/**
 * Setup folder toggle buttons
 */
function setupFolderButtons() {
    let foldersBtns = document.querySelectorAll('[data-folder-toggler]');
    foldersBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.nextElementSibling.classList.toggle('c-grid');
            btn.querySelector('[data-folder-toggler-icon]').classList.toggle('c-rotate-90');
        });
    });

    let imageBtns = document.querySelectorAll('[data-image-btn]');
    imageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            imageBtns.forEach(rbtn => rbtn.classList.remove('image-btn--active'));
            btn.classList.add('image-btn--active');
            modelSelectImageSrc = btn.querySelector('img').getAttribute('src');
        });
    });

    document.querySelector('[data-confirm-selection-btn]').addEventListener('click', (e) => {
        e.preventDefault();
        let finalSelectedImage = new Image();
        finalSelectedImage.src = modelSelectImageSrc;
        finalSelectedImage.crossOrigin = 'anonymous';
        closeModal();
        finalSelectedImage.onload = () => {
            canvas.width = finalSelectedImage.width;
            canvas.height = finalSelectedImage.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(finalSelectedImage, 0, 0);
            image = cv.imread(finalSelectedImage);
        };
    });

    document.querySelector('[data-cancel-btn]').addEventListener('click', closeModal);
}

// Initialize image fetching and event listeners
(function init() {
    getImagesFromServer();
    setTimeout(() => {
        if (selectImageBtn) {
            selectImageBtn.addEventListener('click', () => {
                getImageModal.classList.toggle('c-block');
            });
        }
    }, 4000);
})();

/**
 * Apply threshold and display contours
 */
function applyThresholdAndDisplay() {
    let gray = new cv.Mat();
    cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
    let thresholdValue = parseInt(thresholdSlider.value);
    let maxValue = 255;
    let thresh = new cv.Mat();
    cv.threshold(gray, thresh, thresholdValue, maxValue, cv.THRESH_BINARY);

    let hierarchy = new cv.Mat();
    cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    let imageCopy = image.clone();
    for (let i = 0; i < contours.size(); ++i) {
        cv.drawContours(imageCopy, contours, i, new cv.Scalar(0, 255, 0, 255), 2);
    }
    cv.imshow('canvas', imageCopy);
    gray.delete();
    thresh.delete();
    hierarchy.delete();
    imageCopy.delete();
}

/**
 * Detect and display contours
 */
function detectAndDisplayContours() {
    thresholdSlider.value = 127;
    thresholdValueLabel.textContent = 127;
    applyThresholdAndDisplay();
}

/**
 * Show a message to the user
 * @param {string} message - The message to display
 */
function showMessage(message) {
    let p = document.createElement('p');
    p.textContent = message;
    console.log(p);
    messageContainer.appendChild(p);

    setTimeout(() => {
        if (p.parentNode === messageContainer) {
            messageContainer.removeChild(p);
        }
    }, 15000);
}

/**
 * Handle canvas click to select a contour
 * @param {MouseEvent} event - The click event
 */
/**
 * Handle click event to select a contour
 */
function onClick(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let point = new cv.Point(x, y);
    console.log(contours.size());

    for (let i = 0; i < contours.size(); ++i) {
        let contour = contours.get(i);
        if (cv.pointPolygonTest(contour, point, false) >= 0) {
            if (newSelectedContour) {
                if (selectedContour) {
                    let imageCopy = image.clone();
                    for (let j = 0; j < contours.size(); ++j) {
                        if (contours.get(j) !== selectedContour) {
                            cv.drawContours(imageCopy, contours, j, new cv.Scalar(0, 255, 0, 255), 2);
                        }
                    }
                    cv.imshow('canvas', imageCopy);
                    imageCopy.delete();
                }
            }
            newSelectedContour = contour;
            selectedContour = newSelectedContour;
            let imageCopy = image.clone();
            cv.drawContours(imageCopy, contours, i, new cv.Scalar(255, 0, 0, 255), 2);
            cv.imshow('canvas', imageCopy);
            imageCopy.delete();
            canvas.removeEventListener('click', onClick);

            let pixelsInside = cv.contourArea(selectedContour);
            let scale = 0.3148829373947; // Update this scale factor as needed
            let areaInMm2 = pixelsInside / (scale * scale); // You need to define `scale`
            let statusMessage = `Contour selected. Area: ${areaInMm2.toFixed(2)} mm²`;
            showMessage(statusMessage);
            break;
        }
    }
}


/**
 * Select a contour by clicking on it
 */
function selectContour() {
    canvas.addEventListener('click', onClick);
    showMessage("Click on a contour to select it.");
}

/**
 * Handle canvas click to draw a contour
 * @param {MouseEvent} event - The click event
 */
function onDrawClick(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    drawnContour.push({ x: x, y: y });

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    if (drawnContour.length > 1) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(drawnContour[drawnContour.length - 2].x, drawnContour[drawnContour.length - 2].y);
        ctx.lineTo(drawnContour[drawnContour.length - 1].x, drawnContour[drawnContour.length - 1].y);
        ctx.stroke();
        ctx.closePath();
    }
}

/**
 * Draw a custom contour by clicking on canvas
 */
function drawContour() {
    canvas.addEventListener('click', onDrawClick);
    showMessage("Click to draw a custom contour. Click 'End Draw' to finish.");
}

/**
 * End drawing contour
 */
function endDraw() {
    console.log("End Draw function called.");
    canvas.removeEventListener('click', onDrawClick);

    if (drawnContour.length > 1) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(drawnContour[drawnContour.length - 1].x, drawnContour[drawnContour.length - 1].y);
        ctx.lineTo(drawnContour[0].x, drawnContour[0].y);
        ctx.stroke();
        ctx.closePath();

        let pixelsInside = calculatePixelsInsideDrawnContour();
        let scale = 0.3148829373947; // Update this scale factor as needed
        let areaInMm2 = pixelsInside * scale; // Convert pixels squared to millimeters squared
        let statusMessage = `Contour drawn. Area: ${areaInMm2.toFixed(2)} mm²`;
        showMessage(statusMessage);

    } else {
        console.log("No contour drawn.");
        showMessage("No contour drawn.");
    }
}
function calculatePixelsInsideDrawnContour() {
    // Create a mask canvas
    let maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    let maskCtx = maskCanvas.getContext('2d');

    // Draw the drawnContour on the mask canvas
    maskCtx.beginPath();
    maskCtx.moveTo(drawnContour[0].x, drawnContour[0].y);
    for (let i = 1; i < drawnContour.length; i++) {
        maskCtx.lineTo(drawnContour[i].x, drawnContour[i].y);
    }
    maskCtx.closePath();
    maskCtx.fillStyle = '#ffffff'; // fill the contour with white
    maskCtx.fill();

    // Create an ImageData object from the mask canvas
    let maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    // Create a new Mat from the mask data
    let maskMat = cv.matFromImageData(maskData);

    // Convert the mask to a single-channel grayscale image
    let maskGray = new cv.Mat();
    cv.cvtColor(maskMat, maskGray, cv.COLOR_RGBA2GRAY);

    // Use the mask to calculate pixels inside drawn contour
    let pixelsInside = cv.countNonZero(maskGray);

    // Release memory
    maskCanvas.remove();
    maskMat.delete();
    maskGray.delete();

    return pixelsInside;
}


/**
 * Clear the drawn contour from canvas
 */
function clearDraw() {
    drawnContour = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cv.imshow('canvas', image);
    showMessage("Drawn contour cleared.");
}

/**
 * Calculate and display distance of drawn contour
 */
function calculateDistance() {
    points = [];
    canvas.addEventListener('click', selectPointForDistance);
    showMessage("Click two points to calculate the distance.");
}

function selectPointForDistance(event) {
    let rect = canvas.getBoundingClientRect();
    let x = (event.clientX - rect.left) * (canvas.width / rect.width);
    let y = (event.clientY - rect.top) * (canvas.height / rect.height);
    points.push([x, y]);

    // Draw the selected points
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();

    if (points.length === 2) {
        canvas.removeEventListener('click', selectPointForDistance);

        // Draw the line between the two points
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        ctx.lineTo(points[1][0], points[1][1]);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Calculate the distance
        let dx = points[1][0] - points[0][0];
        let dy = points[1][1] - points[0][1];
        let distance = Math.sqrt(dx * dx + dy * dy);
        let distanceInMm = calculatePixelsToMm(distance);
        showMessage(`Distance: ${distance.toFixed(2)} pixels, ${distanceInMm.toFixed(2)} mm`);
    }
}

function calculatePixelsToMm(pixels) {
    return pixels * 0.5739228841645; 
}

/**
 * Save image and text as JSON file
 */
function saveImageAndText() {
    let title = document.getElementById('title-input').value;
    let paragraph = document.getElementById('paragraph-input').value;

    // Check if a contour is selected or drawn
    let areaOrDistance = "";
    if (selectedContour) {
        // If a contour is selected, use its area
        let pixelsInside = cv.contourArea(selectedContour);
        let areaInMm2 = pixelsInside * 0.3148829373947;
        areaOrDistance = `Area: ${areaInMm2.toFixed(2)} mm²`;
    } else if (drawnContour.length > 1) {
        // If a contour is drawn, calculate its area
        let pixelsInside = calculatePixelsInsideDrawnContour();
        let areaInMm2 = pixelsInside * 0.3148829373947; // Convert pixels squared to millimeters squared
        areaOrDistance = `Area: ${areaInMm2.toFixed(2)} mm²`;
    } else if (points.length === 2) {
        // If two points are selected, use the distance between them
        let dx = points[1][0] - points[0][0];
        let dy = points[1][1] - points[0][1];
        let distance = Math.sqrt(dx * dx + dy * dy);
        let distanceInMm = calculatePixelsToMm(distance);
        areaOrDistance = `Distance: ${distance.toFixed(2)} pixels, ${distanceInMm.toFixed(2)} mm`;
    } else {
        // Otherwise, use a default message
        areaOrDistance = "No measurement available";
    }

    // Draw the area/distance text at the bottom right corner of the image
    ctx.font = '16px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'right';
    ctx.fillText(areaOrDistance, canvas.width - 10, canvas.height - 10);

    // Save the image file
    canvas.toBlob(function(blob) {
        saveAs(blob, `${title}.png`);
    });

    // Save the text file
    let textContent = `Title: ${title}\n\n${paragraph}`;
    let textBlob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    saveAs(textBlob, `${title}.txt`);
}