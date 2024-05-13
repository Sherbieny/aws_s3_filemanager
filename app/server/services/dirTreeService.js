// Desc: Service to build a directory tree from a list of folders and files

const crypto = require('crypto');

/**
 * Build a directory tree from a list of folders and files
 */
const buildDirTree = (foldersPaths) => {
    const folders = {};

    foldersPaths.forEach((path) => {
        console.log('Path:', path);
        // Removing the root path to get the relative path
        const relativePath = path.replace(process.env.S3_BASE_PATH, '');

        // Exploding by "/"
        const parts = relativePath.split('/');

        // If the path has more than one parts, it's not a root level folder
        let cur;
        if (parts.length > 1) {
            const root = parts.shift(); // Take the root level folder name
            if (!folders[root]) {
                folders[root] = createFolder(root, process.env.S3_BASE_PATH + root);
            }
            cur = folders[root].nodes; // Add the rest under the root folder
        } else {
            cur = folders;
        }

        for (const part of parts) {
            if (part) {  // This will ensure we don't create a folder with an empty key
                if (!cur[part]) {
                    cur[part] = createFolder(part, path);
                }
                cur = cur[part].nodes;
            }
        }
    }
    );

    return folders;
}

const createFolder = (name, path) => {
    const uniqueId = 'a' + crypto.randomBytes(4).toString('hex'); // This will generate a unique ID not starting with a zero
    return { id: uniqueId, name, path, nodes: {} };
}

module.exports = {
    buildDirTree
};