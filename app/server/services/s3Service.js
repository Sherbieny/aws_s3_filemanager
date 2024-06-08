// /server/controllers/s3Controller.js
const s3 = require('../config/s3');
const dirTreeService = require('./dirTreeService');

/**
 * Get all folders in a bucket's path
 */
const getFolders = async (folderKey) => {
    const data = {};
    await getSubFolders(folderKey, data);

    return dirTreeService.buildDirTree(Object.values(data));
};

const getSubFolders = async (folderKey, data) => {
    const delimiter = '/';
    const result = await s3.listObjects({
        Bucket: process.env.AWS_BUCKET,
        Prefix: folderKey,
        Delimiter: delimiter,
    }).promise();

    if (result.CommonPrefixes) {
        const promises = result.CommonPrefixes.map(async (commonPrefix) => {
            const prefix = commonPrefix.Prefix;
            data[prefix] = prefix;
            await getSubFolders(prefix, data);
        });

        await Promise.all(promises);
    }
};


/**
 * Get all files in a bucket's path
 */
const getFiles = async (path, limit, token, allContents = []) => {
    try {
        const data = await s3.listObjectsV2({
            Bucket: process.env.AWS_BUCKET,
            Prefix: path,
            ContinuationToken: token,
            MaxKeys: limit,
        }).promise();

        //remove folders
        data.Contents = data.Contents.filter(content => !content.Key.endsWith('/'));

        allContents = allContents.concat(data.Contents);

        if (data.IsTruncated) {
            return getFiles(path, limit, data.NextContinuationToken, allContents);
        }

        const baseUrl = process.env.AWS_BASE_URL;
        allContents.forEach(content => {
            content.url = `${baseUrl}/${content.Key}`;
        });

        return getSortOrderData(data);
    } catch (error) {
        return { error: error.toString() };
    }
};


/**
 * Upload a file to a bucket
 */
const uploadFile = async (path, file, sortOrder) => {
    try {
        const data = await s3.upload({
            Bucket: process.env.AWS_BUCKET,
            Key: `${path}/${file.originalname}`,
            Body: file.buffer,
        }).promise();

        if (sortOrder) {
            await setSortOrderTag(data.Key, sortOrder);
        }

        return data;
    } catch (error) {
        return { error: error.toString() };
    }
};

/**
 * Create new folder in a bucket
 */
const createFolder = async (path) => {
    try {
        const data = await s3.putObject({
            Bucket: process.env.AWS_BUCKET,
            Key: `${path}/`,
            Body: '',
        }).promise();

        return data;
    } catch (error) {
        return { error: error.toString() };
    }
};

/**
 * Delete a file from a bucket
 */
const deleteFile = async (path) => {
    try {
        const data = await s3.deleteObject({
            Bucket: process.env.AWS_BUCKET,
            Key: path,
        }).promise();

        return data;
    } catch (error) {
        return { error: error.toString() };
    }
};

/**
 * Get sort_order tag data from a file in the S3 bucket.
 */
const getSortOrder = async (path) => {
    try {
        const data = await s3.getObjectTagging({
            Bucket: process.env.AWS_BUCKET,
            Key: path,
        }).promise();

        let sortOrder = 0;
        data.TagSet.forEach(tag => {
            if (tag.Key === 'sort_order') {
                sortOrder = parseInt(tag.Value);
            }
        });

        return sortOrder;

    }
    catch (error) {
        return { error: error.toString() };
    }
};

/**
 * Set sort_order tag data to a file in the S3 bucket.
 */
const setSortOrderTag = async (path, sortOrder) => {
    try {
        const data = await s3.putObjectTagging({
            Bucket: process.env.AWS_BUCKET,
            Key: path,
            Tagging: {
                TagSet: [
                    {
                        Key: 'sort_order',
                        Value: sortOrder.toString(),
                    },
                ],
            },
        }).promise();
        return data;
    }
    catch (error) {
        return { error: error.toString() };
    }
};

/**
 * Get sort_order tag data for files
 */
const getSortOrderData = async (data) => {
    let lastSortOrder = 0;
    if (data.Contents.length > 0) {
        for (let i = 0; i < data.Contents.length; i++) {
            let sortOrder = await getSortOrder(data.Contents[i].Key);
            if (!sortOrder) {
                sortOrder = lastSortOrder + 1;
            }
            data.Contents[i].sort_order = sortOrder;
            lastSortOrder = sortOrder;
        }
    }

    return data;
};

/**
 * Update sort_order tag data for files
 */
const updateSortOrderData = async (data) => {
    try {
        for (const [path, sortOrder] of Object.entries(data)) {
            await setSortOrderTag(path, sortOrder);
        }
    } catch (error) {
        return { error: error.toString() };
    }

    return { success: true };
}

const listBuckets = async () => {
    try {
        const data = await s3.listBuckets().promise();
        return data;
    } catch (error) {
        return { error: error.toString() };
    }
};


module.exports = {
    getFolders,
    getFiles,
    uploadFile,
    createFolder,
    deleteFile,
    updateSortOrderData,
    listBuckets,
};
