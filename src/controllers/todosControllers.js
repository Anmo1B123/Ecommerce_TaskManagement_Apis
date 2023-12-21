import { asyncHandler } from "../middlewares/asyncHandler.js"
import { todos } from "../models/todos.js";
import apiError from '../utils/apiError.js'
import {apiFeatures} from '../utils/apiFeatures.js'
import apiResponse from '../utils/apiResponse.js'





const createTodo= asyncHandler(async (req, res)=>{

const {title=undefined, content="", duedate=undefined, priority=undefined} = req.body;
    
if([title,duedate].some((field)=>field===undefined || field.trim()==="")) throw new apiError('title and duedate is required',400);

const duedateStr= `${duedate}`
const datedue = new Date(duedateStr)

console.log(datedue)
            const todo= await todos.create({
                                            title,
                                            content,
                                            duedate:datedue,
                                            priority,
                                            createdBy:req.user._id
                                            })
    res.status(200).json(new apiResponse(200,'Success', {todo}));

});

const getAllTodos = asyncHandler(async (req,res)=>{

   if(Object.keys(req.query).length ===0)
   {

    console.log('hey')
        // todos.find()
        // const todos= await todos.find({createdBy: req.user._id}).sort('-createdAt');
       const allTodos= await todos.find({createdBy: req.user._id}).sort('-createdAt');
       
        res.status(200).json(new apiResponse(200, 'Success', {Length:allTodos.length,allTodos}));

   }
   else
   {

    const query= new apiFeatures(todos.find({createdBy: req.user._id}), req.query).filter().pagination().sort().fields();

    const   documentsCount  =     await query.docsCount;
    const   docsOnThisPage  =     await query.docsOnthisPage;
    const   data            =     await query.queryObj;

    apiFeatures.pageErrorfunc(documentsCount, req)

    res.status(200).json(new apiResponse(200, 'Success', {Length:documentsCount, page:query.page, 
                                                          limit:query.limit, docsOnThisPage, todos:data}))

   }



});


const updateTodoById = asyncHandler(async (req,res)=>{

    const {id} = req.params;

   let todo= await todos.find({createdBy: req.user._id}).where('_id').equals(id);
    // this todo is always an array act accordingly
//    console.log(todo)
   if(todo.length===0) throw new apiError('Could not find any todo by this id', 400); 

   //Handling update of Todos

   const {title=undefined, content=undefined, duedate=undefined, priority=undefined, isCompleted=undefined} = req.body;

   const datedue =Date(duedate)
   /* For-each does not work for undefined elements of an array */
    const propArr= [['title', title], ['content', content], 
                    ['duedate', datedue], ['priority', priority], 
                    ['isCompleted', isCompleted]]


let todoObj = todo[0];

   for (let i = 0; i < propArr.length; i++){
    
    if(propArr[i][1]===undefined) continue;
    if(typeof propArr[i][1]===typeof ""){ if(propArr[i][1].trim()==="") continue;}
    
    
    todoObj[propArr[i][0]]=propArr[i][1]
   
    }// by this user won't be able to saved empty strings, whitespaces or undefined.

    // await todo.save()
   await todo[0].save({validateBeforeSave:false});
    
   const updatedUser=  await todos.findOne({createdBy: req.user._id}).where('_id').equals(todoObj._id);

   res.status(200).json( new apiResponse(200, 'Success', updatedUser));


});

const deleteTodoById = asyncHandler(async (req,res)=>{

    const{id}= req.params

    const todo= await todos.find({createdBy: req.user._id}).where('_id').equals(id);

    if(!todo) throw new apiError('Could not find any todo by this id', 400); 

    const acknowledgement= await todos.findOneAndDelete({createdBy: req.user._id}).where('_id').equals(todo._id);
    
    if(!acknowledgement) throw new apiError('Could not complete the request', 500);

    res.status(200).json(new apiResponse(200, 'Success', acknowledgement));


});

const createSubTodo = asyncHandler(async (req,res)=>{

    const {id}= req.params;

    let todo= await todos.find({createdBy: req.user._id}).where('_id').equals(id);
    // console.log(todo)
    if(todo.length===0) throw new apiError('Could not find any todo with the provided id', 400);
     todo = todo[0];
    const {subtodotitle=undefined, subtodocontent=""}= req.body;

    console.log(subtodotitle);
    //Trimming the subtodotitle to check if was empty.
    if(!subtodotitle || subtodotitle.trim()==="") throw new apiError('Title is required for making a subtodo', 400);
    //

    //For removing whitespaces from whitespace only string.
    if(subtodocontent && subtodocontent.trim()==="") subtodocontent=subtodocontent.trim()
    //

    let subTodo; 
    
    if (subtodocontent==="") {
        subTodo={subtodotitle}
        
    } else {
        subTodo= {
            subtodotitle,
            subtodocontent
        }
        
    }
    // console.log(subTodo)

    // console.log(req.params)
    // console.log(todo)
    // console.log(todo.subTodos)
    todo.subTodos.push(subTodo)
    await todo.save({validateBeforeSave:false});

    let todoForSubTodoCreation; 
    
    todos.find({createdBy: req.user._id}).where('_id').equals(id).then((res)=> todoForSubTodoCreation=res)

    .then(()=>res.status(200).json(new apiResponse(200, 'Success', todoForSubTodoCreation)));


});






const updatesubTodo = asyncHandler(async (req,res)=>{

    const {id, subTodoId}= req.params;
    console.log(req.params);
    let todo= await todos.find({createdBy:req.user._id}).where('_id').equals(id);

    if(!todo) throw new apiError('Could not find any todo with the provided id', 400);

    todo=todo[0];
    let todowithSubtodoid = await todos.find({createdBy:req.user._id, $and:[{_id:id}, {'subTodos._id':subTodoId}]})
    todowithSubtodoid=todowithSubtodoid[0] 
    if(!todowithSubtodoid) throw new apiError('Could not find any subtodo in the todo with the provided id', 400)

    ; /*Using the filtered method of array to get the subtodo by subtodoid - it will return an array.
    */

// if(filteredSubTodoArrayBySubTodoId.length === 0) throw new apiError('Could not find the subtodo with provided id in the todo', 400)

//     const filteredSubTodo=filteredSubTodoArrayBySubTodoId[0]

//UPDATING THE SUBTODO

    const {subtodotitle=undefined, subtodocontent="", isCompleted=undefined} = req.body;

    if(subtodotitle && subtodotitle.trim()==="") throw new apiError('Title for subtodo cannot be empty', 400);
    if(subtodocontent && subtodocontent.trim()==="") subtodocontent=subtodocontent.trim()

    // console.log(todowithSubtodoid)
console.log(isCompleted)


todowithSubtodoid.subTodos.forEach((subtodoObj)=>{

    let id = subtodoObj._id
    id=id+' '
    id=id.split(" ")[0]

    if(id=== subTodoId)
    {

        if(subtodotitle && subtodotitle.trim() !== "" ) subtodoObj.subtodotitle=subtodotitle;
        if(isCompleted !== undefined)                subtodoObj.isCompleted=isCompleted;
        console.log('working')
        subtodoObj.subtodocontent=subtodocontent;
        return
    }

})

let str = 'anmol'
str.substring

let  strId= todowithSubtodoid.subTodos[9]._id


// .split(" ")[1].substring(9, -2)
  strId = strId + ' hi'
  console.log(strId)
  strId = strId.split(" ")[0]

  console.log(strId)

const lastele= todowithSubtodoid.subTodos.length -1
console.log(lastele)
   console.log(strId== `${subTodoId}`? 'yes':'no') 



    await todowithSubtodoid.save({validateBeforeSave:false})

    const todowithUpdatedSubtodo = await todos.find({createdBy:req.user._id, $and:[{_id:id}, {'subTodos._id':subTodoId}]})

    res.status(200).json(new apiResponse(200, 'Success', todowithUpdatedSubtodo));

});

const deleteSubTodo = asyncHandler(async (req,res)=>{


    const {id, subTodoId}= req.params;

    const todo= await todos.find({createdBy:req.user._id}).where('_id').equals(id);

    if(!todo) throw new apiError('Could not find any todo with the provided id', 400);

    const todowithSubtodoid = await todos.find({createdBy:req.user._id, $and:[{_id:id}, {'subTodos._id':subTodoId}]})

    if(!todowithSubtodoid) throw new apiError('Could not find any subtodo in the todo with the provided id', 400)

    ; /*Using the filtered method of array to get the subtodo by subtodoid - it will return an array.
    */

// if(filteredSubTodoArrayBySubTodoId.length === 0) throw new apiError('Could not find the subtodo with provided id in the todo', 400)

//     const filteredSubTodo=filteredSubTodoArrayBySubTodoId[0]


    todowithSubtodoid.subTodos.forEach((subtodoObj)=>{

            if(subtodoObj._id===subTodoId)
            Object.keys(subtodoObj).forEach((key)=> delete subtodoObj[key])

    });

    await todowithSubtodoid.save({validateBeforeSave:false})

    const todowithDeletedSubtodo = await todos.find({createdBy:req.user._id, $and:[{_id:id}, {'subTodos._id':subTodoId}]})

    if(!todowithDeletedSubtodo)
    res.status(200).json(new apiResponse(200, 'Success'));

});


export {createTodo, getAllTodos, updateTodoById, deleteTodoById, createSubTodo, updatesubTodo, deleteSubTodo}