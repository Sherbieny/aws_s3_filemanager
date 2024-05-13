// /server/controllers/s3Controller.js
const s3Service = require('../services/s3Service');

/**
 * Test controller
 */
exports.test = async (req, res) => {
    console.log('Test successful 3');
    const data = await s3Service.listBuckets();

    console.log(data);

    res.json({ message: 'Test successful 3' });
};

/**
 * Get all folders in a bucket's path
 */
exports.getFolders = async (req, res) => {
    try {
        console.log('getFolders');
        const path = req.query.path || process.env.S3_BASE_PATH;
        console.log(path);
        const data = await s3Service.getFolders(path);

        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};

/**
 * Get all files in a bucket's path
 */
exports.getFiles = async (req, res) => {
    try {
        const path = req.query.path || process.env.S3_BASE_PATH;
        const data = await s3Service.getFiles(path);

        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};

/**
 * Upload a file to a bucket
 */
exports.uploadFile = async (req, res) => {
    try {
        const file = req.file;
        const path = req.body.path;
        const data = await s3Service.uploadFile(path, file);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};

/**
 * Create new folder in a bucket
 */
exports.createFolder = async (req, res) => {
    try {
        const path = req.body.path;
        const data = await s3Service.createFolder(path);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};

/**
 * Delete a file from a bucket
 */
exports.deleteFile = async (req, res) => {
    try {
        const path = req.body.path;
        const data = await s3Service.deleteFile(path);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};

/**
 * Get sort_order tag data from a file in the S3 bucket.
 */
exports.getSortOrder = async (req, res) => {
    try {
        const path = req.query.path;
        const sortOrder = await s3Service.getSortOrder(path);

        res.json(sortOrder);

    }
    catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};

/**
 * Set sort_order tag data to a file in the S3 bucket.
 */
exports.setSortOrderTag = async (req, res) => {
    try {
        const path = req.body.path;
        const sortOrder = req.body.sortOrder;

        const data = await s3Service.setSortOrderTag(path, sortOrder);

        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};
