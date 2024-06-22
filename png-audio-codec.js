function encodeAudioAsPNG(audioData, height) {
    // Calculate the width based on the length of the audio data
    const width = Math.ceil(audioData.length / height);

    // Create a canvas and context
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Create an ImageData object
    const imageData = ctx.createImageData(width, height);

    // Encode audio data into the ImageData (RGB channels)
    for (let i = 0; i < audioData.length; i++) {
        const x = Math.floor(i / height);
        const y = i % height;

        // Normalize audio sample to the range [0, 1]
        const normalizedSample = (audioData[i] + 8) / 16; // [-8, 8] -> [0, 1]

        // Encode 24 bits into RGB channels (8 bits per channel)
        const encodedValue = Math.floor(normalizedSample * (2 ** 24)); // [0, 2^24]
        const red = encodedValue >> 16; // Most significant 8 bits
        const green = (encodedValue >> 8) & 0xFF; // Middle 8 bits
        const blue = encodedValue & 0xFF; // Least significant 8 bits

        // Set the pixel color
        imageData.data[4 * (y * width + x)] = red;     // Red
        imageData.data[4 * (y * width + x) + 1] = green; // Green
        imageData.data[4 * (y * width + x) + 2] = blue;  // Blue
        imageData.data[4 * (y * width + x) + 3] = 255;  // Alpha (fully opaque)
    }

    // Put the ImageData back onto the canvas
    ctx.putImageData(imageData, 0, 0);

    // Convert the canvas to a PNG data URL
    return canvas.toDataURL('image/png');
}

function decodePNGToAudio(pngDataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const audioData = new Float32Array(img.width * img.height);

            for (let i = 0; i < audioData.length; i++) {
                const x = Math.floor(i / height);
                const y = i % height;

                const red = imageData.data[4 * (y * img.width + x)];
                const green = imageData.data[4 * (y * img.width + x) + 1];
                const blue = imageData.data[4 * (y * img.width + x) + 2];

                const encodedValue = (red << 16) | (green << 8) | blue;
                const normalizedSample = encodedValue / (2 ** 24);
                audioData[i] = (normalizedSample * 16) - 8; // [0, 1] -> [-8, 8]
            }
            resolve(audioData);
        };
        img.onerror = reject;
        img.src = pngDataUrl;
    });
}
