import {createContact, getAllContacts, getContactByPhoneNo, 
        updateContactById, deleteContactById} from '../controllers/contactsController.js';
import { Router } from 'express';


const route = Router();

route.route('/').get(getAllContacts).post(createContact);
route.route('/:phone').get(getContactByPhoneNo)

route.route('/:id').patch(updateContactById).delete(deleteContactById);


export default route;       