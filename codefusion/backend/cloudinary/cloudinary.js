import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (localFilePath) => {
    if (!localFilePath) {
        throw new Error("No file path provided");
    }

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: "codefusion/questionImages", 
            resource_type: "auto",
        });

        // cleanup local file AFTER upload
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw error;
    }
};
