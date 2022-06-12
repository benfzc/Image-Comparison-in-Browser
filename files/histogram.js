(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.histogram = factory();
    }
}
    (this, function () {
        'use strict';

        var histogram = function (fileData) {
            function loadImageData(fileData, callback) {
                var fileReader;
                var hiddenImage = new Image();

                hiddenImage.onerror = function () {
                    hiddenImage.onerror = null; //fixes pollution between calls
                    // callback();
                };

                hiddenImage.onload = function () {
                    hiddenImage.onload = null; //fixes pollution between calls

                    var hiddenCanvas = document.createElement('canvas');
                    var imageData;
                    var width = hiddenImage.width;
                    var height = hiddenImage.height;

                    hiddenCanvas.width = width;
                    hiddenCanvas.height = height;

                    hiddenCanvas.getContext('2d').drawImage(hiddenImage, 0, 0, width, height);
                    imageData = hiddenCanvas.getContext('2d').getImageData(0, 0, width, height);

                    callback(imageData, width, height);
                };

                if (typeof fileData === 'string') {
                    hiddenImage.src = fileData;
                    if (hiddenImage.complete && hiddenImage.naturalWidth > 0) {
                        hiddenImage.onload();
                    }
                } else if (typeof fileData.data !== 'undefined'
                    && typeof fileData.width === 'number'
                    && typeof fileData.height === 'number') {
                    images.push(fileData);

                    callback(fileData, fileData.width, fileData.height);

                } else {
                    fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        hiddenImage.src = event.target.result;
                    };
                    fileReader.readAsDataURL(fileData);
                }
            }

            function calcHistogram(imageData, width, height) {
                var bins = new Array(256);
                bins.fill(0);
                console.log("width=" + width + ", height=" + height);

                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var offset = (y * width + x) * 4;
                        var red = imageData[offset];
                        var green = imageData[offset + 1];
                        var blue = imageData[offset + 2];
                        var luma = Math.floor(0.3 * red + 0.59 * green + 0.11 * blue);

                        bins[luma]++;
                    }
                }

                var max_bin = 0;
                bins.forEach(function (element) {
                    if (element > max_bin) {
                        max_bin = element;
                    }
                });

                for (var i = 0; i < 256; i++) {
                    bins[i] = Math.floor(bins[i] * 100 / max_bin);
                    console.log("bins[" + i + "]=" + bins[i]);
                }
                return bins;
            }

            return {
                onComplete: function (callback) {
                    loadImageData(fileData, function (imageData, width, height) {
                        var bins = calcHistogram(imageData.data, imageData.width, imageData.height);
                        callback(bins);
                    });
                }
            };
        };

        return histogram;
    }));