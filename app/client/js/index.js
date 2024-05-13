class FileManager {
    constructor(db) {
        // Initialize any variables or state here
        this.db = db;
        this.foldersDBKey = 'folders';
        this.baseURL = window.location.origin;
        this.createFolderBtn = document.querySelector('#create-folder-btn');
        this.uploadFileBtn = document.querySelector('#upload-file-btn');
        this.saveBtn = document.querySelector('#save-btn');
        this.deleteBtns = document.querySelectorAll('.delete-btn');
        this.foldersListSelector = '#folders-list';
        this.foldersHtml = '';

        this.createEvents();
        this.init();
    }

    // On page load, get all folders in the bucket
    async init() {
        await this.db.init();
        await this.getFolders();
    }

    // Method to create events for user clicks and other actions
    createEvents() {
        // Add event listeners and handle user actions here
        this.createFolderBtn.addEventListener('click', this.createFolder);
    }

    // Method to get all folders in the bucket
    getFoldersFromDB = async () => {
        let data;
        try {
            data = await this.db.getClientData(this.foldersDBKey);
        } catch (error) {
            console.log(error);
        }

        return data;
    }

    // router.get('/folder', s3Controller.getFolderContents);
    // router.post('/upload', s3Controller.uploadFile);
    // router.post('/folder', s3Controller.createFolder);
    // router.delete('/file', s3Controller.deleteFile);
    // router.get('/sort_order', s3Controller.getSortOrder);
    // router.post('/sort_order', s3Controller.setSortOrderTag);

    // Method to create a folder
    createFolder = async () => {
        // Add logic to create a folder
        try {
            const response = await fetch(`${this.baseURL}/test`);
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    // Method to get all folders in the bucket
    getFolders = async () => {
        // Add logic to get all folders
        try {
            let data = await this.getFoldersFromDB();
            if (!data) {
                const response = await fetch(`${this.baseURL}/folder`);
                data = await response.json();
                console.log('no data in indexedDB');
                // Save the data to IndexedDB
                this.db.saveClientData(this.foldersDBKey, data);
            }

            if (data) {
                console.log('Data:', data);
                this.renderFoldersTree(data, true);
            }

        } catch (error) {
            console.log(error);
        }
    }

    // Method to render the folders tree using Treejs
    renderFoldersTree = (folders) => {
        let root = new TreeNode('root');
        let view = new TreeView(root, this.foldersListSelector);
        view.changeOption("leaf_icon", '<i class="fas fa-file"></i>');
        view.changeOption("parent_icon", '<i class="fas fa-folder"></i>');

        TreeConfig.open_icon = '<i class="fas fa-angle-down"></i>';
        TreeConfig.close_icon = '<i class="fas fa-angle-right"></i>';

        this.buildTree(folders, root);

        view.collapseAllNodes();
    }

    // Method to build the tree structure
    buildTree = (folders, parent) => {
        for (const folder of Object.values(folders)) {
            let node = new TreeNode(folder.name);
            parent.addChild(node, {
                expanded: false
            });

            if (folder.nodes) {
                this.buildTree(folder.nodes, node);
            }
        }
    }
}

const clientDB = new ClientDB();
const fileManager = new FileManager(clientDB);