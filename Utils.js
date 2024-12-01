const {
    GoogleGenerativeAI
} = require("@google/generative-ai");

import {
    aiConfig
} from "../config/aiConfig.js";
import axios from "axios";
import mime from "mime-types";

const urlToGenerativePart = async (url) => {
    try {
        // Make a GET request to the image URL
        const response = await axios.get(url, {
            responseType: "arraybuffer"
        });

        // Determine the MIME type based on the response headers
        const mimeType = response.headers["content-type"] || mime.lookup(url);

        if (!mimeType || !mimeType.startsWith("image/")) {
            console.error("processImages | Unsupported image MIME type:", mimeType);
            return {
                Error: "Unsupported image MIME type"
            };
        }

        // Convert the binary data to base64
        const base64Data = Buffer.from(response.data, "binary").toString("base64");

        // Return an object with inlineData
        return {
            inlineData: {
                data: base64Data,
                mimeType,
            },
        };
    } catch (error) {
        console.error(
            "processImages | Error fetching image from URL:",
            error.message
        );
        return {
            Error: "Error fetching image from URL"
        };
    }
};

export const processImages = async (images) => {
    try {
        const imageParts = await Promise.all(
            images.map(async (img) => await urlToGenerativePart(img))
        );

        return imageParts;
    } catch (error) {
        console.error("processImages | Error:", error);
        return [];
    }
};



const genAI = new GoogleGenerativeAI(aiConfig.gemini.apiKey);

// This function is used for a text only model of Gemini AI
export const textAndImage = async (prompt, images) => {
    const model = genAI.getGenerativeModel({
        model: aiConfig.gemini.textAndImageModel,
        safetySettings: aiConfig.gemini.safetySettings,
    });

    // prompt is a single string
    // imageParts is an array containing base64 strings of images

    let imageParts = await processImages(images);

    try {
        const result = await model.generateContent([prompt, ...imageParts]);
        const chatResponse = result?.response?.text();

        return {
            result: chatResponse
        };
    } catch (error) {
        console.error("textAndImage | error", error);
        return {
            Error: "Uh oh! Caught error while fetching AI response"
        };
    }
};