// /server/controllers/s3Controller.js
const s3 = require('../config/s3');

exports.listFiles = async (req, res) => {
    try {
        const data = await s3.listObjectsV2({
            Bucket: 'your-bucket-name',
        }).promise();

        res.json(data.Contents);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
};

// Define other controller functions here