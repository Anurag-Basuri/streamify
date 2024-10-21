import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "./public/temp";

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }); // Create the directory recursively if it doesn't exist
        }

        cb(null, dir); // Pass the directory to multer
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original name of the file
    },
});

export const upload = multer({
    storage,
});
