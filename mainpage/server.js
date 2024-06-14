const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Assuming your HTML and client-side scripts are in the "public" directory

// Handle POST request to save image and text
app.post('/save', (req, res) => {
    const title = req.body.title;
    const imageDataURL = req.body.imageDataURL;
    const paragraph = req.body.paragraph;

    saveImageAndText(title, imageDataURL, paragraph)
        .then(() => {
            res.send('Files saved successfully.');
        })
        .catch((error) => {
            res.status(500).send('Error saving files: ' + error.message);
        });
});

function saveImageAndText(title, imageDataURL, paragraph) {
    return new Promise((resolve, reject) => {
        const folderName = title.replace(/[^a-zA-Z0-9]/g, '_'); // Replace special characters in title with underscore
        const folderPath = `./public/${folderName}`;

        // Create folder if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        // Save image
        const imageFileName = `${folderPath}/image.png`;
        const imageStream = fs.createWriteStream(imageFileName);
        const imageBuffer = Buffer.from(imageDataURL.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        imageStream.write(imageBuffer, () => {
            // Save text
            const textFileName = `${folderPath}/text.txt`;
            fs.writeFileSync(textFileName, paragraph);
            resolve();
        });
    });
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
