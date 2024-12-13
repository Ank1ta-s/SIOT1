// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000; // You can choose any available port

app.use(bodyParser.json());
app.use(cors());

// Endpoint to update data.json
app.post('/update-data', (req, res) => {
  const newData = req.body; // Get the new data from the request
  const filePath = path.join(__dirname, 'data.json');

  // Read the existing data
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading data file');
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      return res.status(500).send('Error parsing data file');
    }

    // Update the data with the new data
    jsonData.data[newData.date] = {
      emotion: newData.emotion,
      steps: newData.steps,
      deep_sleep: newData.deep_sleep,
      rem_sleep: newData.rem_sleep,
      light_sleep: newData.light_sleep,
    };

    // Write the updated data back to the file
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (writeError) => {
      if (writeError) {
        return res.status(500).send('Error writing to data file');
      }
      res.status(200).send('Data updated successfully');
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});