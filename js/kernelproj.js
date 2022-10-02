const canvasParent = document.getElementById('canvas-parent');
const gpuEnabled = document.getElementById('gpu-enabled');
const fpsNumber = document.getElementById('fps-number');
const blurFilter = document.getElementById('blur');
const edgeFilter = document.getElementById('sobel-filter');
const redColour = document.getElementById('red-colour');
const greenColour = document.getElementById('green-colour');
const blueColour = document.getElementById('blue-colour');

let lastCalledTime = Date.now();
let fps;
let delta;
let dispose = setup();

addEventListener("DOMContentLoaded", initialize);

function calcFPS() {
    delta = (Date.now() - lastCalledTime) / 1000;
    lastCalledTime = Date.now();
    fps = 1 / delta;
    fpsNumber.innerHTML = fps.toFixed(0);
}

gpuEnabled.onchange = () => {
    if (dispose) dispose();
    dispose = setup();
};

function setup() {

    let disposed = false;
    const gpu = new GPU({ mode: gpuEnabled.checked ? 'gpu' : 'cpu' });

    // Setting the Kernels
    var baseKernel = getBaseTexture(gpu);
    var sobelKernel = getSobelTexture(gpu);
    var redlessKernel = setRedLessTexture(gpu);
    var greenlessKernel = setGreenLessTexture(gpu);
    var bluelessKernel = setBlueLessTexture(gpu);
    var blurKernel = blurTexture(gpu);
    var kernel = setTextureToVideo(gpu);

    // Appending the video canvas to the HTML
    canvasParent.appendChild(kernel.canvas);
    const videoElement = document.querySelector('video');

    // Calling render function to update video frame
    render();

    // Removing the video canvas
    return () => {
        canvasParent.removeChild(kernel.canvas);
        gpu.destroy();
        disposed = true;
    };

    // Getting the texture to apply to video
    function getTexture() {
        var b = blurFilter.value;
        var blurMatrix = [1 / b, 1 / b, 1 / b, 1 / b, 1 / b, 1 / b, 1 / b, 1 / b, 1 / b];
        var xMatrix = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        var yMatrix = [1, 2, 1, 0, 0, 0, -1, -2, -1];

        var texture;

        texture = baseKernel(videoElement);
        if (!redColour.checked) {
            texture = redlessKernel(texture);
        }
        if (!greenColour.checked) {
            texture = greenlessKernel(texture);
        }
        if (!blueColour.checked) {
            texture = bluelessKernel(texture);
        }

        if (blurFilter.value > 1) {
            texture = blurKernel(texture, blurMatrix);
        }

        if (edgeFilter.checked) {
            texture = sobelKernel(texture, xMatrix, yMatrix);
        }
        return texture;
    }

    // Applying the Texture to the video & looping for new frames for video
    function render() {
        if (disposed) {
            return;
        }
        if (gpuEnabled.checked) {
            var texture = getTexture();
            kernel(texture);
        } else {
            kernel(videoElement);
        }
        window.requestAnimationFrame(render);
        calcFPS();
    }

}

function streamHandler(stream) {
    try {
        video.srcObject = stream;
    } catch (error) {
        video.src = URL.createObjectURL(stream);
    }
    video.play();
    console.log("In startStream");
    requestAnimationFrame(render);
}


