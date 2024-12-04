const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple icon with gradient background
async function generateAssets() {
    const size = 1024;
    const backgroundColor = '#4c669f';
    const foregroundColor = '#ffffff';

    // Generate base icon
    await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: backgroundColor
        }
    })
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));

    // Generate adaptive icon
    await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: backgroundColor
        }
    })
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));

    // Generate splash screen
    await sharp({
        create: {
            width: size * 2,
            height: size * 2,
            channels: 4,
            background: backgroundColor
        }
    })
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));
}

generateAssets().catch(console.error);
