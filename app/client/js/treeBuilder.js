class TreeBuilder {
    constructor() {
        this.foldersHtml = '';
        this.foldersListSelector = '#folders-list';
    }
    /**
     * Method to render the folders tree
     */
    renderFoldersTree = (folders) => {
        // Add logic to render the folders tree
        let foldersList = document.querySelector(this.foldersListSelector);
        foldersList.innerHTML = '';
        this.foldersHtml = '';
        this.buildTree(folders, foldersList);
        foldersList.innerHTML = this.foldersHtml;
    }

    /**
     * Method to build the tree structure
     */
    renderFoldersTree = (folders) => {
        // Add logic to render the folders tree
        let foldersList = document.querySelector(this.foldersListSelector);
        foldersList.innerHTML = '';
        this.foldersHtml = '';
        this.buildTree(folders, foldersList);
        foldersList.innerHTML = this.foldersHtml;
    }

    /**
     * Method to build the tree structure
     */
    buildTree = (folders, parent) => {
        for (const folder of Object.values(folders)) {
            let folderClass = Object.keys(folder.nodes || {}).length > 0 ? 'folder' : 'folder leaf';
            this.foldersHtml += `<li class="${folderClass}" data-path="${folder.path}"><i class="fas fa-folder"></i>${folder.name}`;
            if (folder.nodes && Object.keys(folder.nodes).length > 0) {
                this.foldersHtml += '<ul>';
                this.buildTree(folder.nodes, parent);
                this.foldersHtml += '</ul>';
            }
            this.foldersHtml += '</li>';
        }
    }

    /**
     * Method to render files in a folder in a 5 col grid
     */
    renderFilesList = (files) => {
        if (files.length === 0) {
            document.querySelector('#files-list').innerHTML = '<p>No files found</p>';
            return;
        }


        // sort by sort_order
        files.sort((a, b) => a.sort_order - b.sort_order);

        let filesList = document.querySelector('#files-list');
        filesList.innerHTML = '';
        let filesHtml = '';
        //new approach, put all items in same container with d-flex flex-wrap
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filename = file.Key.split('/').pop();
            filesHtml += `
            <div class="file sortable-elem" data-path="${file.Key}" data-sort="${file.sort_order}">
                ${this.renderFileContent(file.url)}
                <p><i class="fa-solid fa-trash delete-btn"></i> ${filename}</p>
            </div>`;
        }


        filesList.innerHTML = filesHtml;
    };

    /**
     * Method to render the file content based on the file type
     */
    renderFileContent = (url) => {
        let fileContent = '';
        if (url.endsWith('.pdf')) {
            fileContent = `<embed src="${url}" type="application/pdf" width="100%" height="100%" />`;
        } else if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.gif') || url.endsWith('.svg')) {
            fileContent = `<img src="${url}" alt="file" width="100%" height="100%" />`;
        } else if (url.endsWith('.mp4')) {
            fileContent = `<video width="100%" height="100%" controls>
                <source src="${url}" type="video/mp4">
                Your browser does not support the video tag.
            </video>`;
        } else if (url.endsWith('.mp3')) {
            fileContent = `<audio controls>
                <source src="${url}" type="audio/mpeg">
                Your browser does not support the audio tag.
            </audio>`;
        } else {
            fileContent = `<a href="${url}" target="_blank">View</a>`;
        }

        return fileContent;
    }

}