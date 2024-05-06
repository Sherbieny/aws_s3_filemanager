// /server/controllers/s3Controller.js
const s3Service = require('../services/s3Service');

/**
 * Get all folder and files in a bucket's path
 */
exports.getFolderContents = async (req, res) => {
    try {
        const path = req.query.path;
        const data = await s3Service.getFolderContents(path);

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
