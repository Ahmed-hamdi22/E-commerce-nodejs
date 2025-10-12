const multer = require("multer");
const ApiError = require("../utils/apiError");

const uploadSingleImage = (fieldName) => {
  const memoryStorage = multer.memoryStorage();
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Not an image! please upload only images"), false);
    }
  };

  const upload = multer({ storage: memoryStorage, fileFilter: multerFilter });
  return upload.single(fieldName);
};

const uploadMixImages = (arrayOfFields) => {
  const memoryStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Not an image! please upload only images"), false);
    }
  };

  const upload = multer({ storage: memoryStorage, fileFilter: multerFilter });
  return upload.fields(arrayOfFields);
};

module.exports = { uploadSingleImage, uploadMixImages };
