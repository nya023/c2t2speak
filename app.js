const video = document.getElementById("camera");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

function stopCamera() {
  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null
  }
}

async function recognizeTextFromImage(image) {
    const result = await Tesseract.recognize(image, "eng", { logger: (m) => console.log(m) });
    return result.data.text;
}

async function translateText(text, targetLanguage) {
    const response = await fetch("YOUR_API_ENDPOINT_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, targetLanguage })
    });
  
    if (response.ok) {
      const translation = await response.json();
      return translation;
    } else {
      throw new Error("Translation failed.");
    }
 }

 function speakText(text, lang) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = lang;
    window.speechSynthesis.speak(speech);
}  

async function processImage(image) {
    const text = await recognizeTextFromImage(image);
    const translation = await translateText(text, "ja");
    speakText(translation.translatedText, translation.detectedSourceLanguage);
 }

 const speakButton = document.getElementById("speak");
const translationResult = document.getElementById("translation-result");

// カメラ映像が停止されたときに画像をキャプチャし、処理を開始する
stopButton.addEventListener("click", async () => {
  const image = captureImageFromVideo(video);
  try {
    const text = await recognizeTextFromImage(image);
    const translation = await translateText(text, "ja");
    translationResult.textContent = translation.translatedText;
    speakButton.onclick = () => {
      speakText(translation.translatedText, translation.detectedSourceLanguage);
    };
  } catch (error) {
    console.error("Error processing image:", error);
  }
});

// カメラ映像から画像をキャプチャする関数
function captureImageFromVideo(video) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}


startButton.addEventListener("click", startCamera);
stopButton.addEventListener("click", stopCamera);
