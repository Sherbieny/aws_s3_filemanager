// /server/routes/routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const s3Controller = require('./controllers/s3Controller');

// Define your routes here
router.get('/folder', s3Controller.getFolders);
router.get('/file', s3Controller.getFiles);
router.post('/upload', upload.single('file'), s3Controller.uploadFile);
router.post('/folder', s3Controller.createFolder);
router.delete('/file', s3Controller.deleteFile);
router.get('/sort_order', s3Controller.getSortOrder);
router.post('/sort_order', upload.none(), s3Controller.setSortOrderTag);

module.exports = router;