import multer from "multer";
import path from "path";

//Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// Create multer instance with limit upto 2MB
const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, 
    },
});

// Error-handling wrapper
export const uploadMiddleware = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                    message: "Image size must be less than 2MB",
                });
            }
            return res.status(400).json({ message: err.message });
        } 
        
        if (err) {
            return res.status(500).json({ message: "Upload failed" });
        }

        next();
    });
};
