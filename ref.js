// https://kylemcdonald.github.io/cv-examples/

var capture;
var motionHistoryImage;
var w = 640,
    h = 480;

function setup() {
    capture = createCapture({
        audio: false,
        video: {
            width: w,
            height: h
        }
    }, function() {
        console.log('capture ready.')
    });
    capture.elt.setAttribute('playsinline', '');
    createCanvas(w, h);
    capture.size(w, h);
    capture.hide();
}

var backgroundPixels;

function resetBackground() {
    backgroundPixels = undefined;
}

function copyImage(src, dst) {
    var n = src.length;
    if (!dst || dst.length != n) dst = new src.constructor(n);
    while (n--) dst[n] = src[n];
    return dst;
}

function draw() {
    image(capture, 0, 0);
    capture.loadPixels();
    if (capture.pixels.length > 0) { // don't forget this!
        if (!backgroundPixels) {
            // copy the camera pixels for storing the background
            backgroundPixels = copyImage(capture.pixels, backgroundPixels);
            // make a grayscale image for storing the motion history
            motionHistoryImage = new Uint8ClampedArray(w * h);
        }
        var pixels = capture.pixels;
        var thresholdAmount = 0.2
        var sumSquaredThreshold = thresholdAmount * (255 * 255) * 3;
        var iRgb = 0,
            iGray = 0;
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var rdiff = pixels[iRgb + 0] - backgroundPixels[iRgb + 0];
                var gdiff = pixels[iRgb + 1] - backgroundPixels[iRgb + 1];
                var bdiff = pixels[iRgb + 2] - backgroundPixels[iRgb + 2];
                var sumSquaredDiff = rdiff * rdiff + gdiff * gdiff + bdiff * bdiff;
                // if this is a foreground pixel
                if (sumSquaredDiff > sumSquaredThreshold) {
                    // set the motion history image to white
                    motionHistoryImage[iGray] = 255;
                } else {
                    // otherwise make it fade towards black
                    motionHistoryImage[iGray]--;
                }
                var output = motionHistoryImage[iGray];
                pixels[iRgb++] = output;
                pixels[iRgb++] = output;
                pixels[iRgb++] = output;
                iRgb++; // skip alpha in rgbindex
                iGray++; // next grayscale index
            }
        }

        // some parameters for calculating the motion vectors
        var stepSize = 16;
        var radius = 8;
        var maximumDiff = 8; // ignore big "motion edges"
        var minimumValue = 245; // ignore very old values
        var arrowWidth = .25;
        stroke(255);
        noFill();

        // pre-calculate some values outside the loop
        var upOffset = -radius * w;
        var downOffset = +radius * w;
        var leftOffset = -radius;
        var rightOffset = +radius;
        var maximumLength = Math.sqrt(maximumDiff * maximumDiff * 2);
        for (var y = radius; y + radius < h; y += stepSize) {
            for (var x = radius; x + radius < w; x += stepSize) {
                var i = y * w + x;
                var center = motionHistoryImage[i];
                var dx = 0,
                    dy = 0;
                if (center > minimumValue) {
                    var up = motionHistoryImage[i + upOffset];
                    var down = motionHistoryImage[i + downOffset];
                    var left = motionHistoryImage[i + leftOffset];
                    var right = motionHistoryImage[i + rightOffset];
                    dx = right - left;
                    dy = down - up;
                    // ignore big "motion edges"
                    if (dx > maximumDiff || dy > maximumDiff ||
                        -dx > maximumDiff || -dy > maximumDiff) {
                        dx = 0, dy = 0;
                    } else {
                        // big changes are slow motion, small changes are fast motion
                        var length = Math.sqrt(dx * dx + dy * dy);
                        var rescale = (maximumLength - length) / length;
                        dx *= rescale;
                        dy *= rescale;
                    }

                    if (dx || dy) {
                        let motion_magnitude = Math.sqrt(dx * dx + dy * dy)
                        console.log(motion_magnitude)
                        console.log(dx,dy)
                    }
                }
                line(x + dx, y + dy, x - arrowWidth * dy, y + arrowWidth * dx);
                line(x + dx, y + dy, x + arrowWidth * dy, y - arrowWidth * dx);
            }
        }
    }
}

// // https://kylemcdonald.github.io/cv-examples/

// var capture;
// var previousPixels;
// var w = 640;
// var h = 480;

// function setup() {
//     capture = createCapture({
//         audio: false,
//         video: {
//             width: w,
//             height: h
//         }
//     }, function() {
//         console.log('capture ready.')
//     });
//     capture.elt.setAttribute('playsinline', '');
//     capture.size(w, h);
//     createCanvas(w, h);
//     capture.hide();
// }

// function copyImage(src, dst) {
//     var n = src.length;
//     if (!dst || dst.length != n) dst = new src.constructor(n);
//     while (n--) dst[n] = src[n];
//     return dst;
// }

// function draw() {
//     capture.loadPixels();
//     var total = 0;
//     if (capture.pixels.length > 0) { // don't forget this!
//         if (!previousPixels) {
//             previousPixels = copyImage(capture.pixels, previousPixels);
//         } else {
//             var w = capture.width,
//                 h = capture.height;
//             var i = 0;
//             var pixels = capture.pixels;
//             var thresholdAmount = 20
//             // var thresholdAmount = select('#thresholdAmount').value() * 255. / 100.;
//             thresholdAmount *= 3; // 3 for r, g, b
//             for (var y = 0; y < h; y++) {
//                 for (var x = 0; x < w; x++) {
//                     // calculate the differences
//                     var rdiff = Math.abs(pixels[i + 0] - previousPixels[i + 0]);
//                     var gdiff = Math.abs(pixels[i + 1] - previousPixels[i + 1]);
//                     var bdiff = Math.abs(pixels[i + 2] - previousPixels[i + 2]);
//                     // copy the current pixels to previousPixels
//                     previousPixels[i + 0] = pixels[i + 0];
//                     previousPixels[i + 1] = pixels[i + 1];
//                     previousPixels[i + 2] = pixels[i + 2];
//                     var diffs = rdiff + gdiff + bdiff;
//                     var output = 0;
//                     if (diffs > thresholdAmount) {
//                         output = 255;
//                         total += diffs;

//                         // add x,y to something
//                     }
//                     pixels[i++] = output;
//                     pixels[i++] = output;
//                     pixels[i++] = output;
//                     // also try this:
//                     // pixels[i++] = rdiff;
//                     // pixels[i++] = gdiff;
//                     // pixels[i++] = bdiff;
//                     i++; // skip alpha
//                 }
//             }
//         }
//     }
//     // need this because sometimes the frames are repeated
//     if (total > 0) {
//         // select('#motion').elt.innerText = total;
//         capture.updatePixels();
//         image(capture, 0, 0, 640, 480);
//     }
// }

// function copyImage(src, dst) {
//     var n = src.length;
//     if (!dst || dst.length != n) dst = new src.constructor(n);
//     while (n--) dst[n] = src[n];
//     return dst;
// }