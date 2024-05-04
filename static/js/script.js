function processVoiceCommand() {
    const audioInput = document.getElementById('audio-input').files[0];
    const formData = new FormData();
    formData.append('audio', audioInput);

    fetch('/process_command', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const productListDiv = document.getElementById('product-list');
        productListDiv.innerHTML = ''; // Clear previous results
        data.products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.textContent = product.name + ' - ' + product.price;
            productDiv.classList.add('product-item');
            productListDiv.appendChild(productDiv);
        });
    })
    .catch(error => console.error('Error:', error));
}

function customVoiceSend(){
        const outputDiv = document.getElementById('output');
        const startButton = document.getElementById('startButton');
        const stopButton = document.getElementById('stopButton');

        let recognition = new webkitSpeechRecognition(); // Create a new instance of SpeechRecognition
        recognition.continuous = true; // Set continuous mode to keep listening

        // Event listener for when speech recognition starts
        recognition.onstart = function() {
            outputDiv.textContent = 'Listening...';
        };

        // Event listener for when speech recognition ends
        recognition.onend = function() {
            outputDiv.textContent = 'Speech recognition stopped.';
            startButton.disabled = false;
            stopButton.disabled = true;
        };

        // Event listener for when speech is recognized
        recognition.onresult = function(event) {
            const transcript = event.results[event.results.length - 1][0].transcript;
            outputDiv.innerText = 'You said: ' + transcript;
            // Send the recognized text to the Flask backend
            sendToFlask(transcript);
        };

        // Function to send the recognized text to the Flask backend
        function sendToFlask(text) {
            fetch('/process_voice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send data to Flask backend');
                }
                return response.json();
            })
            .then(data => {
                console.log('Response from Flask:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

        // Event listener for when start button is clicked
        startButton.onclick = function() {
            recognition.start(); // Start speech recognition
            startButton.disabled = true;
            stopButton.disabled = false;
        };

        // Event listener for when stop button is clicked
        stopButton.onclick = function() {
            recognition.stop(); // Stop speech recognition
            startButton.disabled = false;
            stopButton.disabled = true;
        };
}

function playAudio(){

    document.getElementById("default_audio").play();

}
function startRecognitionLoop() {
            console.log("Hello ishan")

            let recognition = new webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.start();

            // Event listener for speech recognition result
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log(transcript)
                // Send the recognized text to Flask backend
                fetch('/process_voice', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text: transcript })
                }).then(res=>res.json()).then(res=>{

                        if(res['message'].includes('stop')){

                            recognition.stop();
                        }
                })

                // Check if the user said "stop"
                if (transcript.includes('stop' || "that's all")) {
                    // Stop recognition loop
                    recognition.stop();
                }
            };

            // Event listener for recognition end
//            recognition.onend = function() {
//                // Start the recognition loop again
//                if (!recognition.aborted) {
//                    startRecognitionLoop();
//                }
//                  console.log("ENded")
//            };


            const stopListeningBtn = document.getElementById("stopButton");
            stopListeningBtn.addEventListener('click',()=>{

                recognition.stop();
                con

            })

        // Event listener for button click


}

//const startListeningBtn = document.getElementById("startButton");
//startListeningBtn.addEventListener('click', function() {
//            // Start recognition loop
//            startRecognitionLoop();
//
//            // Your logic for starting listening goes here
//            console.log("Listening started...");
// });
//customVoiceSend();
//playAudio();