import {createTodo, getAllTodos, updateTodoById, deleteTodoById, 
        createSubTodo, updatesubTodo, deleteSubTodo} from '../controllers/todosControllers.js'
import { Router } from 'express';
import { protect } from '../middlewares/authorization.js';


const route = Router();

//FOR MAIN-TODOS
route.use(protect)
route.route('/').get(getAllTodos).post(createTodo);
route.route('/:id').patch(updateTodoById).delete(deleteTodoById);

//FOR SUB-TODOS
route.route('/:id/subtodo').post(createSubTodo);
route.route('/:id/subtodo/:subTodoId').patch(updatesubTodo).delete(deleteSubTodo);


export default route;