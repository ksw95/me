function getBaseTexture(processor) {
    return processor.createKernel(function (frame) {
        const pixel = frame[this.thread.y][this.thread.x];
        return pixel;
    }, {
        output: [1024, 768],
        pipeline: true
    });
}

function blurTexture(processor) {
    return processor.createKernel(function (frame, blurMatrix) {
        const pixel = frame[this.thread.y][this.thread.x];
        if (this.thread.y > 0 && this.thread.y < 768 - 2 && this.thread.x < 1024 - 2 && this.thread.x > 0) {

            var col = [0, 0, 0];
            const a0 = frame[this.thread.y + 1][this.thread.x - 1];
            const a1 = frame[this.thread.y + 1][this.thread.x];
            const a2 = frame[this.thread.y + 1][this.thread.x + 1];
            const a3 = frame[this.thread.y][this.thread.x - 1];
            const a4 = frame[this.thread.y][this.thread.x];
            const a5 = frame[this.thread.y][this.thread.x + 1];
            const a6 = frame[this.thread.y - 1][this.thread.x - 1];
            const a7 = frame[this.thread.y - 1][this.thread.x];
            const a8 = frame[this.thread.y - 1][this.thread.x + 1];

            for (var i = 0; i < 3; i++) { // Compute the convolution for each of red [0], green [1] and blue [2]
                col[i] =
                    a0[i] / blurMatrix[0] + a1[i] / blurMatrix[1] + a2[i] / blurMatrix[2] +
                    a3[i] / blurMatrix[3] + a4[i] / blurMatrix[4] + a5[i] / blurMatrix[5] +
                    a6[i] / blurMatrix[6] + a7[i] / blurMatrix[7] + a8[i] / blurMatrix[8];
            }   

            pixel.r = col[0];
            pixel.g = col[1];
            pixel.b = col[2];
        }
        return pixel;
    }, {
        output: [1024, 768],
        pipeline: true
    });
}

function getSobelTexture(processor) {
    return processor.createKernel(function (frame, xMatrix, yMatrix) {

        const pixel = frame[this.thread.y][this.thread.x];

        if (this.thread.y > 0 && this.thread.y < 768 - 2 && this.thread.x < 1024 - 2 && this.thread.x > 0) {

            const a0 = frame[this.thread.y + 1][this.thread.x - 1];
            const a1 = frame[this.thread.y + 1][this.thread.x];
            const a2 = frame[this.thread.y + 1][this.thread.x + 1];
            const a3 = frame[this.thread.y][this.thread.x - 1];
            const a4 = frame[this.thread.y][this.thread.x];
            const a5 = frame[this.thread.y][this.thread.x + 1];
            const a6 = frame[this.thread.y - 1][this.thread.x - 1];
            const a7 = frame[this.thread.y - 1][this.thread.x];
            const a8 = frame[this.thread.y - 1][this.thread.x + 1];

            var col = [0, 0, 0];
            var gx = [0, 0, 0];
            var gy = [0, 0, 0];

            for (var i = 0; i < 3; i++) {
                gx[i] =
                    a0[i] * xMatrix[0] + a2[i] * xMatrix[2] +
                    a3[i] * xMatrix[3] + a5[i] * xMatrix[5] +
                    a6[i] * xMatrix[6] + a8[i] * xMatrix[8];

                gy[i] =
                    a0[i] * yMatrix[0] + a1[i] * yMatrix[1] + a2[i] * yMatrix[2] +
                    a6[i] * yMatrix[6] + a7[i] * yMatrix[7] + a8[i] * yMatrix[8];

                col[i] = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]);
            }

            pixel.r = col[0];
            pixel.g = col[1];
            pixel.b = col[2];
        }

        return pixel;

    }, {
        output: [1024, 768],
        pipeline: true
    })
}

function setGreyScaleTexture(processor) {
    return processor.createKernel(function (frame) {
        const pixel = frame[this.thread.y][this.thread.x];

        const a0 = frame[this.thread.y + 1][this.thread.x - 1];
        const a1 = frame[this.thread.y + 1][this.thread.x];
        const a2 = frame[this.thread.y + 1][this.thread.x + 1];
        const a3 = frame[this.thread.y][this.thread.x - 1];
        const a4 = frame[this.thread.y][this.thread.x];
        const a5 = frame[this.thread.y][this.thread.x + 1];
        const a6 = frame[this.thread.y - 1][this.thread.x - 1];
        const a7 = frame[this.thread.y - 1][this.thread.x];
        const a8 = frame[this.thread.y - 1][this.thread.x + 1];

        var col = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
            col[i] =
                (a0[i] + a1[i] + a2[i] +
                    a3[i] + a4[i] + a5[i] +
                    a6[i] + a7[i] + a8[i]) / 9;
        }
        pixel.r = col[0];
        pixel.g = col[1];
        pixel.b = col[2];
        return pixel;

    }, {
        output: [1024, 768],
        pipeline: true
    })
}

function setRedLessTexture(processor) {
    return processor.createKernel(function (frame) {
        const pixel = frame[this.thread.y][this.thread.x];
        pixel.r = 0;
        return pixel;
    }, {
        output: [1024, 768],
        pipeline: true
    });
}

function setGreenLessTexture(processor) {
    return processor.createKernel(function (frame) {
        const pixel = frame[this.thread.y][this.thread.x];
        pixel.g = 0;
        return pixel;
    }, {
        output: [1024, 768],
        pipeline: true
    });
}

function setBlueLessTexture(processor) {
    return processor.createKernel(function (frame) {
        const pixel = frame[this.thread.y][this.thread.x];
        pixel.b = 0;
        return pixel;
    }, {
        output: [1024, 768],
        pipeline: true
    });
}

function setTextureToVideo(processor) {
    return processor.createKernel(function (frame) {
        const pixel = frame[this.thread.y][this.thread.x];
        this.color(pixel.r, pixel.g, pixel.b, pixel.a);
    }, {
        output: [1024, 768],
        graphical: true,
        tactic: 'precision'
    });
}