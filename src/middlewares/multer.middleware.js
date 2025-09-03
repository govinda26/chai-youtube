import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
    //or give this path "../../public/temp"
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// console.log(multer({ storage }));
// Multer {
//   storage: DiskStorage {
//     getFilename: [Function: filename],
//     getDestination: [Function: destination]
//   },
//   limits: undefined,
//   preservePath: undefined,
//   fileFilter: [Function: allowAll]
// }

export const upload = multer({ storage });
