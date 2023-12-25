import {createTodo, getAllTodos, updateTodoById, deleteTodoById, 
        createSubTodo, updatesubTodo, deleteSubTodo, toggleIsCompleted, toggleIsCompletedSubTodo} from '../../controllers/todos/todosControllers.js'
import { Router } from 'express';
import { verifyJWT } from '../../middlewares/users/authorization.js';


const route = Router();

//FOR MAIN-TODOS
route.use(verifyJWT)
route.route('/').get(getAllTodos).post(createTodo);
route.route('/iscompleted/:id').patch(toggleIsCompleted);
route.route('/:id').patch(updateTodoById).delete(deleteTodoById);

//FOR SUB-TODOS
route.route('/:id/subtodo').post(createSubTodo);
route.route('/:id/subtodo/iscompleted/:subTodoId').patch(toggleIsCompletedSubTodo);
route.route('/:id/subtodo/:subTodoId').patch(updatesubTodo).delete(deleteSubTodo);


export default route;