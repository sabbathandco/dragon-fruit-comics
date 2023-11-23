// Function to generate and display a DALL-E image
async function generateAndDisplayImage(panelId, dialogue) {
    try {
        const response = await fetch('/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dialogue }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const imageElement = document.getElementById(`${panelId}-image`);
        // Displaying the image on the webpage with a class 'generated-image'
        imageElement.innerHTML = `<img src="${data.imageUrl}" alt="Generated Image for ${panelId}" class="generated-image"/>`;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Function to generate dialogue for a comic panel
async function generateDialogue(panelId) {
    const inputElement = document.querySelector(`#${panelId} input`);
    const userInput = inputElement ? inputElement.value.trim() : '';

    // Check if the user has entered some text before proceeding
    if (panelId === 'beginning' && !userInput) {
        alert('Please enter some text to generate the dialogue.');
        return;
    }

    let beginningDialogue = panelId !== 'beginning' ? document.querySelector('#beginning .dialogue')?.textContent : '';
    let middleDialogue = panelId === 'end' ? document.querySelector('#middle .dialogue')?.textContent : '';

    const panel = document.getElementById(panelId);

    try {
        const response = await fetch('/create-dialogue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                panel: panelId,
                beginningDialogue,
                middleDialogue,
                userInput // Include the user input in the request body
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        const dialogueElement = panel.querySelector('.dialogue');
        if (dialogueElement) {
            dialogueElement.textContent = data.dialogue;
        } else {
            const newDialogue = document.createElement('p');
            newDialogue.classList.add('dialogue');
            newDialogue.textContent = data.dialogue;
            panel.appendChild(newDialogue);
        }

        // When the dialogue has been generated, generate the corresponding image
        generateAndDisplayImage(panelId, data.dialogue);
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }
}
