// /server/index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./routes');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

// Use your routes here
app.use(process.env.S3_BASE_PATH, routes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});