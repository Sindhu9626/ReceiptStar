// CommonJS version (works even if your RN app is TS)
const vision = require('@google-cloud/vision');

// allow: node scripts/test-ocr.js ./sample-receipt.jpg
const imgPath = process.argv[2] || 'receipt.jpg';

(async () => {
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.documentTextDetection(imgPath); // better for receipts
  console.log(result.fullTextAnnotation?.text || '(no text)');
})();