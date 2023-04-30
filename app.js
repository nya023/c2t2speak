    window.onload = function(){
        var buf = document.querySelector('#target');
        Tesseract.recognize(
            buf,
            'eng',
            { 
                logger: function(m) {
                    document.querySelector('#progress').textContent = m.status;
                }
            }
        )
        .then(function(result){
            document.querySelector('#result').textContent = result.data.text;
        });
    };

    var video = document.createElement('video');
    var canvas = document.querySelector('#canvas');
    var buf = document.createElement('canvas');
    document.body.append(buf);
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'environment'
        },
        audio: false
    })
    .then(function(stream){
        video.srcObject = stream;
        video.play();
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
        }, 200);
    })
    .catch(function(e){
        document.querySelector('#result').textContent = JSON.stringify(e);
    });