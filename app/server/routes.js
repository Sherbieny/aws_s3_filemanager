// /server/routes/routes.js
const express = require('express');
const router = express.Router();
const s3Controller = require('./controllers/s3Controller');

// Define your routes here
router.get('/test', s3Controller.test);
router.get('/folder', s3Controller.getFolders);
router.post('/upload', s3Controller.uploadFile);
router.post('/folder', s3Controller.createFolder);
router.delete('/file', s3Controller.deleteFile);
router.get('/sort_order', s3Controller.getSortOrder);
router.post('/sort_order', s3Controller.setSortOrderTag);

module.exports = router;