require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./routes');
const app = express();
const port = process.env.PORT || 3000;

// Middleware for logging requests
app.use((req, res, next) => {
    console.log('Time:', Date.now());
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

// Middleware to set CORS headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Use your routes here
app.use('/', routes);

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Catchall handler for any request that doesn't match one above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
