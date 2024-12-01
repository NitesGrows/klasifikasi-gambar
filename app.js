const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const Jimp = require('jimp');
const fetch = require('node-fetch'); // Use to call an external image classification API

const app = express();

// Setup multer storage and file filter
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Middleware for parsing
app.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '50mb',
    type: 'application/json'
}));

// Static file serving
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");

// Redirect root to dashboard
app.get('/', (req, res) => {
    res.redirect("/dashboard");
});

// Dashboard route
app.get("/dashboard", (req, res) => {
    render(req, res, './dashboard/dashboard.ejs', {});
});

app.get("/styles", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'CSS', 'style.css'));
});

app.get("/scripts", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SCRIPT', 'script.js'));
});

// Serve background image
app.get("/img/background", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'IMG', 'bgimage.jpg'));
});


// Upload image route
app.post("/upload", upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log(`File uploaded: ${req.file.path}`);
    res.status(200).send({
        success: true,
        message: 'File uploaded successfully',
        filePath: req.file.path
    });
});

// Classification route
app.post("/classify", async (req, res) => {
    try {
        const { filePath } = req.body;
        console.log(`Classifying image at: ${filePath}`);

        // Make an API call to a pre-trained model (use an external service, e.g., a free API for image classification)
        const apiEndpoint = ''; // Replace with actual API endpoint

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            body: JSON.stringify({ imagePath: filePath }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error in image classification');
        }

        console.log('Classification results:', data);

        res.status(200).json({
            success: true,
            label: data.label,
            confidence: data.confidence,
            description: data.description
        });
    } catch (error) {
        console.error('Error during image classification:', error);
        res.status(500).send({ success: false, message: 'Error during image classification' });
    }
});

const dataDir = path.resolve(`${process.cwd()}${path.sep}views`);
const templateDir = path.resolve(`${dataDir}${path.sep}${path.sep}`);
const render = async (req, res, template, data = {}) => {
    const baseData = {};
    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
};

app.listen(80, () => {
    console.log(`Example app listening on port 80!`);
});
