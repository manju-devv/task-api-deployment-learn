import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";


import {
    getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION;
const bucketName = process.env.S3_BUCKET_NAME;

if (!region || !bucketName) {
    throw new Error(
        "AWS_REGION and S3_BUCKET_NAME must be configured"
    );
}

export const s3Client = new S3Client({
    region,
});

export { bucketName };

export async function uploadProfilePhoto({
    fileBuffer, contentType, key
}) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType
    });
    await s3Client.send(command);
    return { key };
}

export async function getProfilePhotoUrl(key) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    return getSignedUrl(s3Client, command, {
        expiresIn: 900,
    });
}

export async function deleteProfilePhoto(key) {
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    await s3Client.send(command);
};