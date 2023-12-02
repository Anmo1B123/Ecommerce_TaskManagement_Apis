import {upload} from '../middlewares/multer.js';

const multerfileHandler=()=>upload.fields([
    {name: 'avatar', maxCount: 1},
    {name: 'coverimage', maxCount: 1}
]);

export default multerfileHandler