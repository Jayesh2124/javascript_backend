import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, db) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.round() * 1E9)
        cb(null, file.filename + '-' + uniqueSuffix);
    }
})

export const upload = multer(
    {
        storage: storage
    }
)