    window.onload = function(){
        var video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        var canvas = document.querySelector('#canvas');
        var buf = document.createElement('canvas');
        //document.body.append(buf);
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment'
            },
            audio: false
        })
        .then(function(stream){
            video.srcObject = stream;
            video.play();
            var isRecognizing = false;
            setInterval(function(){
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height);
    
                var box = {
                    x: 50,
                    h: 100
                };
                box.y = (canvas.height - box.h) / 2;
                box.w = (canvas.width - box.x * 2);
        
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.rect(
                    box.x, box.y, box.w, box.h
                );
                ctx.stroke();

                buf.width = box.w;
                buf.height = box.h;

                buf.getContext('2d').drawImage(canvas, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);

                if (isRecognizing) return;
                isRecognizing = true;

                Tesseract.recognize(
                    buf,
                    'eng',
                    { 
                        tessedit_pageseg_mode: "RAW_LINE",
                        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
                        logger: function(e) {
                            //document.querySelector('#progress').textContent = e.status;
                            isRecognizing = false;
                        }
                    }
                )
                .then(function(result){
                    document.querySelector('#result').textContent = result.data.text + "(" +  result.data.confidence + ")";
                    if( result.data.text.trim().length > 2 && result.data.confidence > 70){
                        speak(result.data.text, "en-US")
                    }
                });
            }, 1000);
        })
        .catch(function(e){
            document.querySelector('#result').textContent = JSON.stringify(e);
        });
    };

    function speak(text, lang) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
      
        // 音声合成の設定（オプション）
        utterance.rate = 1; // 読み上げ速度（0.1から10まで）
        utterance.volume = 1; // 音量（0から1まで）
        utterance.pitch = 1; // 音程（0から2まで）
      
        speechSynthesis.speak(utterance);
    }

    // 音声読み上げON/OFFフラグ
let speakCommentFlg = 0;

// 音声読み上げスイッチ
function speakSwitch() {
  let speakMsg = new SpeechSynthesisUtterance('Start to speak');
  speakMsg.lang = 'en-us';
  speakMsg.rate = 1.0;
  if ( speakCommentFlg == 1 ) {
    speakCommentFlg = 0;
    speakMsg.text = 'stop to speak';
    window.speechSynthesis.speak(speakMsg);
    return;
  }
  speakCommentFlg = 1;
  speakMsg.text = 'start to speak';
  window.speechSynthesis.speak(speakMsg);
}