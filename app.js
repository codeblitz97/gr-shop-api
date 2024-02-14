const express = require('express');
const cors = require('cors');
const { default: Parser, waitFor } = require('gerena-scraping');
const fs = require('fs');

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Success',
  });
});

app.post('/purchase', async (req, res) => {
  try {
    const startTime = performance.now();
    const { playerId, amount, serial, pin } = req.body;

    if (!playerId || !serial || !pin || !amount) {
      return res.status(400).json({
        message: 'Invalid form body',
        required: ['playerId', 'serial', 'pin', 'amount'],
      });
    }

    await Parser.purchase(playerId, Number(amount), 'voucher', serial, pin);

    await waitFor(5000);
    const filePath = './success.png';
    if (fs.existsSync(filePath)) {
      const { base64, binary, hash } = await Parser.successScreenshot(
        './success.png'
      );

      const endTime = performance.now();
      const totalTimeTaken = endTime - startTime;
      res.status(200).json({
        message: 'Success',
        playerId,
        amount,
        totalTimeTaken: totalTimeTaken.toFixed(2),
        images: [
          {
            type: 'hash',
            string: hash,
          },
          {
            type: 'base64',
            string: base64,
          },
          {
            type: 'binary',
            content: binary,
          },
        ],
      });
    } else {
      res.status(404).json({
        message: 'File not found: success.png',
      });
    }
  } catch (error) {
    console.error('Error', error);

    return res.status(500).json({
      message: 'Internal Server Error',
      hint: error.message,
    });
  }
});

module.exports = app;
