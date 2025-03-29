
const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const { translateText, translateSingleDocument  } = require('./documentHandler');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/translated', express.static('translated'));

app.post('/translate-text', async (req, res) => {
  const { text, from, to } = req.body;
  try {
    const result = await translateText(text, from, to);
    res.json({ translatedText: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const upload = multer({ dest: 'uploads/' });
app.post('/translate-single-document', upload.single('file'), async (req, res) => {
  const { from, to } = req.body;
  try {
    const result = await translateSingleDocument(req.file.path, req.file.originalname, from, to);
    res.json({ downloadUrl: result.downloadLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
