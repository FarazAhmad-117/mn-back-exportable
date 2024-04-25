import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/pictures')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+file.originalname);
    }
})

const videoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+file.originalname);
    }
});

export const upload = multer({ storage });

export const uploadVideo = multer({ storage: videoStorage });



