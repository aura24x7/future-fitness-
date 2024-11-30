Get started with the Gemini API
Get a Gemini API Key
The Gemini API and Google AI Studio help you start working with Google's latest models and turn your ideas into applications that scale.

Python
Node.js
REST

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Explain how AI works";

const result = await model.generateContent(prompt);
console.log(result.response.text());