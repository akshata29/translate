
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const createClient = require("@azure-rest/ai-translation-document").default;
const { isUnexpected } = require("@azure-rest/ai-translation-document");


const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
const documentEndpoint = process.env.AZURE_DOC_TRANSLATOR_ENDPOINT;
const key = process.env.AZURE_TRANSLATOR_KEY;
const region = process.env.AZURE_REGION;
const credentials = { key };


async function translateText(text, from, to) {
  const response = await axios.post(`${endpoint}/translate?api-version=3.0&from=${from}&to=${to}`,
    [{ Text: text }],
    {
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': region,
        'Content-type': 'application/json'
      }
    }
  );
  return response.data[0].translations[0].text;
}


// async function translateSingleDocument(filePath, filename, from, to) {
//   const client = createClient(documentEndpoint, credentials);

//   const ext = path.extname(filename).toLowerCase();
//   const mimeType = {
//     '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     '.pdf': 'application/pdf',
//     '.txt': 'text/plain',
//     '.html': 'text/html'
//   }[ext];

//   if (!mimeType) {
//     throw new Error(`Unsupported file type: ${ext}`);
//   }

//   const documentBody = fs.createReadStream(filePath);

//   const options = {
//     queryParameters: {
//       sourceLanguage: from,
//       targetLanguage: to,
//     },
//     body: [
//       {
//         name: "document",
//         body: documentBody, // ✅ must be a stream!
//         filename: filename,
//         contentType: mimeType,
//       }
//     ],
//   };
  
  

//   const response = await client.path("/document:translate").post(options);
//   console.log(response);
//   if (isUnexpected(response)) {
//     throw new Error(`Translation failed: ${response.body?.error?.message}`);
//   }

//   const outputFilename = `${path.parse(filename).name}_${to}${ext}`;
//   const outputPath = path.join("translated", outputFilename);
//   fs.writeFileSync(outputPath, Buffer.from(await response.body.arrayBuffer()));

//   return {
//     translatedFilePath: outputPath,
//     downloadLink: `http://localhost:5000/translated/${outputFilename}`,
//   };
// }

async function translateSingleDocument(filePath, filename, from, to) {
  const ext = path.extname(filename).toLowerCase();
  const mimeType = {
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.html': 'text/html'
  }[ext];

  if (!mimeType) throw new Error(`Unsupported file type: ${ext}`);
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

  const form = new FormData();
  form.append('document', fs.createReadStream(filePath), {
    filename: path.basename(filename),
    //contentType: mimeType
  });

  const headers = {
    ...form.getHeaders(),
    'Ocp-Apim-Subscription-Key': key,
    'Ocp-Apim-Subscription-Region': region,
    'Content-Type': mimeType
  };

  const url = `${documentEndpoint}/translator/document:translate?api-version=2024-05-01&sourceLanguage=${from}&targetLanguage=${to}`;

  try {
    const response = await axios.post(url, form, {
      headers,
      responseType: 'stream',
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // 🔍 Let's check if Azure returned an error *in the stream* (as JSON)
    const chunks = [];
    for await (const chunk of response.data) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const text = buffer.toString('utf8');

    if (text.startsWith('{') && text.includes('"error"')) {
      // Azure returned JSON error instead of file
      const errJson = JSON.parse(text);
      console.error('💥 Azure Error:', errJson);
      throw new Error(`Azure returned error in stream: ${errJson.error?.message}`);
    }

    // 🟢 OK to save as translated file
    const translatedFilename = `${path.parse(filename).name}_${to}${ext}`;
    const translatedPath = path.join(__dirname, 'translated', translatedFilename);
    fs.writeFileSync(translatedPath, buffer);
    console.log(`✅ Translated file saved to: ${translatedPath}`);
    return { downloadLink: `http://localhost:5000/translated/${translatedFilename}` };

  } catch (err) {
    console.error('❌ Error during translation:', err);
    console.error('❌ Unexpected Error:', err.message);
    throw new Error('Translation failed.');
  }
}

module.exports = { translateText, translateSingleDocument  };
