class S3Manager {
    constructor() {
        this.s3 = new AWS.S3();
    }

    uploadFile(file, bucketName, key) {
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: file,
        };

        return this.s3.upload(params).promise();
    }
}