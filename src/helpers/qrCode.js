const QRCode = require('qrcode');
const { customError } = require('./customError');
// const http   = require('http');
const bwipjs = require('bwip-js');

exports.generateQRCode = async (text) => {
  try {
    if (!text) throw new customError('Text is required to generate QR code');
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.3,
      margin: 1,
      color: {
        dark: '#000000ff',
        light: '#ffffffff',
      },
    });
    return qrCodeDataUrl;
  } catch (err) {
    console.error(err);
    throw new customError('Failed to generate QR code');
  }
};

// bar code

exports.generateBarCode = async (text='hello') => {
  try {
    if (!text) throw new customError('Text is required to generate bar code');
    // generate bar code
    const svg = bwipjs.toSVG({
      bcid: 'code128', // Barcode type
      text: '0123456789', // Text to encode
      height: 12, // Bar height, in millimeters
      includetext: true, // Show human-readable text
      textxalign: 'center', // Always good to set this
      textcolor: 'ff0000', // Red text
    });
    return svg;
  } catch (err) {
    console.error(err);
    throw new customError('Failed to generate bar code');
  }
};
