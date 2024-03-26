import { Injectable } from '@nestjs/common';
import { Endpoint, S3 } from 'aws-sdk';

@Injectable()
export class StorageService {
    private endpoint: Endpoint;
    private s3: S3;

    constructor() {
        this.endpoint = new Endpoint(process.env.S3_ENDPOINT);

        this.s3 = new S3({
            endpoint: this.endpoint,
            credentials: {
                accessKeyId: process.env.S3_KEY_ID,
                secretAccessKey: process.env.S3_APP_KEY,
            },
        });
    }

    storageImage = async (
        meet_id: string,
        buffer: Buffer,
        mimetype: string,
    ) => {
        const file = await this.s3
            .upload({
                Bucket: process.env.S3_BUCKET,
                Key: `meets/${meet_id}/image`,
                Body: buffer,
                ContentType: mimetype,
            })
            .promise();

        return file;
    };

    // Verify images' address to delete
    deleteImage = async (path: string) => {
        await this.s3
            .deleteObject({
                Bucket: process.env.S3_BUCKET,
                Key: path,
            })
            .promise();
    };
}
