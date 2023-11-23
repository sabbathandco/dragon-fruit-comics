const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.json());
app.use(express.static('public'));

// Endpoint to create dialogue using the OpenAI GPT model
app.post('/create-dialogue', async (req, res) => {
    const { panel, beginningDialogue, middleDialogue, userInput } = req.body;
    let prompt = `Create a dialogue for a comic strip with two characters: Dragon Fruit and Avocado.`;
    
    if (beginningDialogue && (panel === "middle" || panel === "end")) {
        prompt += ` It all started when ${beginningDialogue.split('\n')[0].replace('Dragon Fruit: ', '')}`;
    }

    if (middleDialogue && panel === "end") {
        prompt += ` Then, something happened... ${middleDialogue.split('\n')[0].replace('Dragon Fruit: ', '')}`;
    }

    // Ensure that userInput fits naturally into the flow of the prompt
    if (userInput) {
        prompt += ` ${userInput}.`;
    }
    
    // Ask the AI to continue based on the panel and user input
    prompt += ` Now, what do Dragon Fruit and Avocado say next?`;

    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003", // Make sure to replace with the latest model if necessary
            prompt: prompt,
            max_tokens: 60,
        });

        let dialogues = response.data.choices[0].text.trim().split('\n').filter(line => line.trim() !== '');
        let dialogue = dialogues.join('\n');

        res.json({ dialogue });
    } catch (error) {
        console.error('Error calling OpenAI:', error);
        res.status(500).send('Error generating dialogue.');
    }
});

// Endpoint to generate images using DALL-E 3
app.post('/generate-image', async (req, res) => {
  const { dialogue } = req.body;

  // Construct the prompt for image generation
  const prompt = `An illustration for the following dialogue: "${dialogue}"`;

  try {
    // Call the OpenAI DALL-E 3 API for image generation
    const imageResponse = await openai.createImage({
      model: "dall-e-3", // Use DALL-E 3 for image generation
      prompt: prompt,
      n: 1,
      size: "1024x1024", // Requested image resolution
      quality: "standard" // Can be "standard" or "hd" for high detail
    });
    // Extract the URL of the generated image
    const imageUrl = imageResponse.data.data[0].url;
    res.json({ imageUrl: imageUrl });
  } catch (error) {
    console.error('Failed to generate DALL-E image:', error);
    // Log the full error response if it's an API error for more details
    if (error.response) {
      console.error('API response error:', error.response.data);
    }
    res.status(500).send('Error in image generation');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});