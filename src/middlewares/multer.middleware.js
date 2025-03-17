import multer from 'multer'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },

    filename: function (req, file, cb) {
     // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) genrating unique file name nano codes etc
      cb(null, file.originalname)//original name as uploaded by the user
    }
  })
  
  export  const  upload = multer({
     storage, 
    })
    