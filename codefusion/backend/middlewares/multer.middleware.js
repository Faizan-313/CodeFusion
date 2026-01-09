import multer from "multer";

// for understanding
//disk storage fails in production use memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
});

export const multipartRequestHandlerMiddleware = (req, res, next) => {
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
            console.error("MULTER ERROR:", err);
            return res.status(500).json({ message: err.message });
        }

        next();
    });
};
