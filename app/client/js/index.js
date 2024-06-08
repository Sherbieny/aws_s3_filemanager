class FileManager {
    constructor(db, treeBuilder) {
        // Initialize any variables or state here
        this.db = db;
        this.treeBuilder = treeBuilder;
        this.sortingData = {};
        this.foldersDBKey = 'folders';
        this.baseURL = window.location.origin;
        this.createFolderBtn = document.querySelector('#create-folder-btn');
        this.uploadFileBtn = document.querySelector('#upload-file-btn');
        this.saveBtn = document.querySelector('#save-btn');
        this.deleteBtns = document.querySelectorAll('.delete-btn');
        this.foldersListSelector = '#folders-list';
        this.foldersHtml = '';
        this.uploadFileModalElement = document.querySelector('#upload-file-modal');
        this.createFolderModalElement = document.querySelector('#create-folder-modal');
        this.uploadFileModal = new bootstrap.Modal(this.uploadFileModalElement);
        this.createFolderModal = new bootstrap.Modal(this.createFolderModalElement);
        this.mainLoadingSpinner = document.querySelector('#main-loading-spinner');
        this.sidebarLoadingSpinner = document.querySelector('#sidebar-loading-spinner');

        this.currentFolder = '';

        this.createEvents();
        this.init();
    }

    // On page load, get all folders in the bucket
    async init() {
        await this.db.init();
        await this.getFolders();
    }

    initSortable = () => {
        const sortableContainers = document.querySelectorAll('#files-list');
        sortableContainers.forEach((container) => {
            new Sortable(container, {
                animation: 150,
                onEnd: (evt) => {
                    //console.log(evt);
                    // This event is triggered when the user stops dragging an item
                    // evt.item: the element that was moved
                    // evt.newIndex: the new index of the item
                    // evt.oldIndex: the old index of the item
                    // all indexes are 0-based so you will need to add 1 to get the actual sort_order
                    // You can use this event to update the sort_order of the images
                    this.saveBtn.classList.remove('d-none');
                    this.updateSortOrder(evt.item, evt.newIndex, evt.oldIndex);
                },
            });
        });
    }

    // Method to create events for user clicks and other actions
    createEvents() {
        // Add event listeners for the buttons
        // create folder modal open event
        this.createFolderModalElement.addEventListener('show.bs.modal', this.handleCreateFolderModalOpen);
        this.createFolderModalElement.querySelector('#create-folder-form').addEventListener('submit', this.createFolder);
        // upload file modal open event
        this.uploadFileModalElement.addEventListener('show.bs.modal', this.handleUploadFileModalOpen);
        // upload file form submit event
        this.uploadFileModalElement.querySelector('#upload-file-form').addEventListener('submit', this.uploadFile);
        // save button click event
        this.saveBtn.addEventListener('click', this.setSortOrder);
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

    updateSortOrder = (item, newIndex, oldIndex) => {
        const dataPath = item.dataset.path || item.querySelector('[data-path]')?.dataset.path;

        if (!dataPath) {
            return;
        }

        // advance the indexes by 1
        newIndex++;
        oldIndex++;

        const filesInFolder = Array.from(document.querySelectorAll('#files-list .sortable-elem'));

        // Update the sorting data
        this.sortingData = {};
        filesInFolder.forEach((file, index) => {
            this.sortingData[file.dataset.path] = index + 1;
        });
    }

    showMainLoadingSpinner = () => {
        this.mainLoadingSpinner.classList.remove('d-none');
    }

    hideMainLoadingSpinner = () => {
        this.mainLoadingSpinner.classList.add('d-none');
    }

    showSidebarLoadingSpinner = () => {
        this.sidebarLoadingSpinner.classList.remove('d-none');
    }

    hideSidebarLoadingSpinner = () => {
        this.sidebarLoadingSpinner.classList.add('d-none');
    }

    //APIs

    /**
     * Method to get all folders in the bucket
     * Api: GET /folder
     * @param {boolean} force - Force to get the folders from the server
     */
    getFolders = async (force = false) => {
        // Add logic to get all folders
        try {
            this.showSidebarLoadingSpinner();
            let data = force ? null : await this.getFoldersFromDB();
            if (!data) {
                const response = await fetch(`${this.baseURL}/folder`);
                data = await response.json();
                console.log('no data in indexedDB');
                // Save the data to IndexedDB
                this.db.saveClientData(this.foldersDBKey, data);
            }

            if (data) {
                console.log('Data:', data);
                this.treeBuilder.renderFoldersTree(data, true);
                this.addFolderEvents();
            }

            this.hideSidebarLoadingSpinner();

        } catch (error) {
            console.log(error);
            this.hideSidebarLoadingSpinner();
        }
    }

    /**
     * Method to get all files in a folder
     * Api: GET /file
     */
    getFiles = async (path) => {
        // Add logic to get all files
        try {
            this.showMainLoadingSpinner();
            const response = await fetch(`${this.baseURL}/file?path=${path}`);
            const data = await response.json();
            console.log('Files:', data);
            this.treeBuilder.renderFilesList(data.Contents || []);
            this.initSortable();
            this.addDeleteBtnEvents();
            this.hideMainLoadingSpinner();
        } catch (error) {
            console.log(error);
            this.hideMainLoadingSpinner();
        }
    }

    /**
     * Method to create a folder
     * Api: POST /folder
     */
    createFolder = async (event) => {
        event.preventDefault();
        // Add logic to create a folder
        let folderName = document.querySelector('#folder-name').value;
        if (!folderName) {
            alert('Folder name is required');
            return;
        }
        let path = this.currentFolder || '/';

        let folder = {
            path: path.endsWith('/') ? path + folderName : path + '/' + folderName
        };
        try {
            const response = await fetch(`${this.baseURL}/folder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(folder)
            });
            const data = await response.json();
            console.log('Folder created:', data);
            this.createFolderModal.hide();
            this.getFolders(true);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Method to upload a file
     * Api: POST /upload
     */
    uploadFile = async (event) => {
        event.preventDefault();
        // Add logic to upload a file
        let fileInput = document.querySelector('#file');
        let file = fileInput.files[0];
        let formData = new FormData();
        formData.append('file', file);
        formData.append('path', this.currentFolder || '/');
        try {
            const response = await fetch(`${this.baseURL}/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            console.log('File uploaded:', data);
            this.uploadFileModal.hide();
            this.getFolders();
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Method to delete a file
     * Api: DELETE /file
     */
    deleteFile = async (path) => {
        // Add logic to delete a file
        try {
            const response = await fetch(`${this.baseURL}/file`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path })
            });

            const data = await response.json();
            console.log('File deleted:', data);
            await this.getFolders(true);
        } catch (error) {
            console.log(error);
        }

    }

    /**
     * Method to update the sort order of the files
     * Api: POST /sort_order
     */
    setSortOrder = async () => {

        this.showMainLoadingSpinner();
        const formData = new FormData();
        formData.append('sortingData', JSON.stringify(this.sortingData));
        try {
            const response = await fetch(`${this.baseURL}/sort_order`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            this.hideMainLoadingSpinner();
            this.saveBtn.classList.add('d-none');

            if (!data.success) {
                alert('Failed to update sort order');
                console.log(data);

                return;
            }

            alert('Sort order updated successfully');

        } catch (e) {
            console.log(e);
            this.hideMainLoadingSpinner();
        }

    }

    // Method to add events to the folders leaf nodes
    addFolderEvents = () => {
        let folderElements = document.querySelectorAll('.folder');
        folderElements.forEach(element => {
            element.addEventListener('click', this.handleFolderClick);
            element.addEventListener('dblclick', this.handleFolderDblClick);
        });
    }

    // Method to add events to the delete buttons
    addDeleteBtnEvents = () => {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', this.handleDeleteFile);
        });
    }

    handleFolderDblClick = (event) => {
        event.stopPropagation();
        let element = event.target;
        if (typeof element !== 'li') {
            element = element.closest('li');
            if (!element) {
                return;
            }
        }
        element.classList.toggle('open');
        let folderName = element.textContent;
        let path = element.dataset.path;
        this.currentFolder = path;
        if (!path) {
            return;
        }
        this.getFiles(path);
    }

    handleFolderClick = (event) => {
        event.stopPropagation();
        event.target.classList.toggle('open');
        event.target.classList.add('active');
        document.querySelectorAll('.folder').forEach(node => {
            if (node !== event.target) {
                node.classList.remove('active');
            } else {
                this.currentFolder = node.dataset.path;
            }
        });
    }

    handleDeleteFile = async (event) => {
        event.stopPropagation();
        let element = event.target;
        if (element.tagName !== 'I') {
            element = element.querySelector('i');
        }
        let path = element.closest('.file').dataset.path;
        if (!path) {
            return;
        }

        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        await this.deleteFile(path);

        element.closest('.file').remove();
    }


    handleCreateFolderModalOpen = () => {
        const message = `Enter the name of the folder you want to create in the current folder: ${this.currentFolder || '/'}`;
        document.querySelector('#create-folder-message').textContent = message;
    }

    handleUploadFileModalOpen = () => {
        const message = `Upload a file to the current folder: ${this.currentFolder || '/'}`;
        document.querySelector('#upload-file-message').textContent = message;
    }
}

const clientDB = new ClientDB();
const treeBuilder = new TreeBuilder();
const fileManager = new FileManager(clientDB, treeBuilder);