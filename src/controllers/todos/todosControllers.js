import moment from "moment";
import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js"
import { initializePreFindHookFunc, todos } from "../../models/todos.js";
import apiError from '../../utils/apiError.js'
import {apiFeatures} from '../../utils/apiFeatures.js'
import apiResponse from '../../utils/apiResponse.js'





const createTodo= asyncHandler(async (req, res)=>{

const {title=undefined, content="", duedate=undefined, priority=undefined} = req.body;
    
if([title,duedate].some((field)=>field===undefined || field.trim()==="")) throw new apiError('title and duedate is required',400);

    const duedateStr= `${duedate}`
    const modifiedDate = moment(duedateStr, 'DD/MM/YY').startOf('day')
    const isoDate = modifiedDate.toISOString()

// console.log(datedue)
            const todo= await todos.create({
                                            title,
                                            content,
                                            duedate:isoDate,
                                            priority,
                                            createdBy:req.user._id
                                            })
    res.status(200).json(new apiResponse(200,'Success', {todo}));

});

const getAllTodos = asyncHandler(async (req,res)=>{

    initializePreFindHookFunc(req);

   if(Object.keys(req.query).length ===0)
   {

    console.log('hey')
        // todos.find()
        // const todos= await todos.find({createdBy: req.user._id}).sort('-createdAt');

       
    //    const allTodos= await todos.findbyAuthenticatedUser(req.user).sort('-createdAt');
       const allTodos= await todos.find().sort('-createdAt');
       
        res.status(200).json(new apiResponse(200, 'Success', {Length:allTodos.length,allTodos}));

   }
   else
   {

    const query= new apiFeatures(todos.findbyAuthenticatedUser(req.user), req.query).search().pagination().sort().fields();

    const   documentsCount  =     await query.docsCount;
    const   docsOnThisPage  =     await query.docsOnthisPage;
    const   data            =     await query.queryObj;

    apiFeatures.pageErrorfunc(documentsCount, req)

    res.status(200).json(new apiResponse(200, 'Success', {Length:documentsCount, page:query.page, 
                                                          limit:query.limit, docsOnThisPage, todos:data}))

   }



});


const updateTodoById = asyncHandler(async (req,res,next)=>{

    const {id} = req.params;

   let todo= await todos.find({createdBy: req.user._id}).where('_id').equals(id);
    // this todo is always an array act accordingly
//    console.log(todo)
   if(todo.length===0) throw new apiError('Could not find any todo by this id', 400); 

   //Handling update of Todos

   const {title=undefined, content=undefined, duedate=undefined, priority=undefined} = req.body;
    //In frontend html form these fields will always exist in the req.body even if any field is empty.
   if(title){
    console.log('true')
   }else{
console.log('false')
   }

   if(!(duedate==="" || duedate?.trim()==="") && (title==="" || title?.trim()==="") ){
    throw new apiError('Title cannot be empty for todo', 400);}
   if(!(title==="" || title?.trim()==="") && (duedate==="" || duedate?.trim()==="")) {
    throw new apiError('Duedate cannot be empty for todo', 400);}
   if((title===""||title.trim()==="") && (duedate===""||duedate.trim()==="")){
    throw new apiError('title and duedate cannot be empty for todo', 400);}

   const datedue = new Date(duedate)
   console.log(datedue)
   /* For-each does not work for undefined elements of an array */
    const propArr= [['title', title], ['content', content], 
                    ['duedate', datedue], ['priority', priority]
                    ]


let todoObj = todo[0];

   for (let i = 0; i < propArr.length; i++){
    
    if(propArr[i][1]===undefined) continue;
    todoObj[propArr[i][0]]=propArr[i][1]
   
    }// by this user won't be able to saved empty strings, whitespaces or undefined.

    // await todo.save()
   await todoObj.save({validateBeforeSave:false});
    
   const updatedUser=  await todos.findOne({createdBy: req.user._id}).where('_id').equals(id);

   res.status(200).json( new apiResponse(200, 'Success', updatedUser));


});

const toggleIsCompleted = asyncHandler(async (req,res)=>{

    const {id}= req.params;

    let todo = await todos.findbyAuthenticatedUser(req.user).find({_id:id}); 
    todo=todo[0]
    // console.log(todo)
    if(!todo) throw new apiError('Todo not found', 400);

    const changedCompleteStatus= !todo.isCompleted;

    todo.isCompleted= changedCompleteStatus;

    await todo.save({validateBeforeSave:false})

    const updatedTodo = await todos.findbyAuthenticatedUser(req.user).find({_id:id}); 

    res.status(200).json(new apiResponse(200, 'changed status of todo to '+changedCompleteStatus, updatedTodo));


})

const deleteTodoById = asyncHandler(async (req,res)=>{

    const{id}= req.params

    const todo= await todos.find({createdBy: req.user._id}).where('_id').equals(id);

    if(!todo) throw new apiError('Could not find any todo by this id', 400); 

    let acknowledgement= await todos.findOneAndDelete({createdBy: req.user._id}).where('_id').equals(id);
    
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

    const {subtodotitle=undefined, subtodocontent=undefined} = req.body;

if(subtodotitle !==undefined && subtodotitle.trim()==="") throw new apiError('Sub-Todo Title cannot be empty', 400);

    // if(subtodotitle && subtodotitle.trim()==="") throw new apiError('Title for subtodo cannot be empty', 400);
    // if(subtodocontent && subtodocontent.trim()==="") subtodocontent=subtodocontent.trim()

    // console.log(todowithSubtodoid)


todowithSubtodoid.subTodos.forEach((subtodoObj)=>{

    // let id = subtodoObj._id
    // id=id+' '
    // id=id.split(" ")[0]

    if(subtodoObj._id.equals(subTodoId))
    {
        subtodoObj.subtodotitle=subtodotitle;
        subtodoObj.subtodocontent=subtodocontent;
        
    }

})

    await todowithSubtodoid.save()

    const todowithUpdatedSubtodo = await todos.find({createdBy:req.user._id, $and:[{_id:id}, {'subTodos._id':subTodoId}]})

    res.status(200).json(new apiResponse(200, 'Success', todowithUpdatedSubtodo));

});

const toggleIsCompletedSubTodo = asyncHandler(async (req,res)=>{

    const {id, subTodoId} = req.params;

    let todo = await todos.findbyAuthenticatedUser(req.user).find({_id:id});
    todo=todo[0];
    if(!todo) throw new apiError(`Could not find todo with this id`, 400);

    let subtodo = todo.subTodos.filter((subtodos)=>{

        return subtodos._id.equals(subTodoId)
    });

//    const subtodo = await todos.findOne({$and:[{_id:id},{'subTodos._id':subTodoId}]});

    if(subtodo.length === 0) throw new apiError('subtodo does not exist by this id', 400);

    subtodo= subtodo[0]
    const changedCompleteStatus = !subtodo.isCompleted

    
    const todowithUpdatedSubTodoStatus= await todos.findOneAndUpdate({
                            $and:[{_id:id},{subTodos:{$elemMatch:{_id:subTodoId}}}]
                         },
                         {
                            $set:{'subTodos.$.isCompleted':changedCompleteStatus}

                         },
                         {new:true, runValidators:true});

    if(!todowithUpdatedSubTodoStatus) throw new apiError('Could not update the status of subtodo', 500);
      
    res.status(200).json(new apiResponse(200, 'changed status of subtodo to '+changedCompleteStatus, 
                                        todowithUpdatedSubTodoStatus));
                        

});

const deleteSubTodo = asyncHandler(async (req,res)=>{


    const {id, subTodoId}= req.params;

    const todo= await todos.find({createdBy:req.user._id}).where('_id').equals(id);

    if(!todo) throw new apiError('Could not find any todo with the provided id', 400);

let todowithSubtodoid = await todos.findOneAndUpdate({createdBy:req.user._id,
                                                        _id:id,
                                                        'subTodos._id':subTodoId
                                                    },
                                                    {
                                                      $pull:{subTodos:{_id:subTodoId}}
                                                    },
                                                    {
                                                    new:true
                                                    });
    
    todowithSubtodoid=todowithSubtodoid
    if(!todowithSubtodoid) throw new apiError('Could not find any subtodo in the todo with the provided id', 400)
// console.log(todowithSubtodoid);



    ; /*Using the filtered method of array to get the subtodo by subtodoid - it will return an array.
    */

// if(filteredSubTodoArrayBySubTodoId.length === 0) throw new apiError('Could not find the subtodo with provided id in the todo', 400)

//     const filteredSubTodo=filteredSubTodoArrayBySubTodoId[0]


//     todowithSubtodoid.subTodos.forEach((subtodoObj)=>{

//     if(subtodoObj._id.equals(subTodoId)){
        

   
//     console.log(keys)
//     // .forEach((key)=> delete subtodoObj[key])
// }
//     });

    await todowithSubtodoid.save()

    const todowithDeletedSubtodo = await todos.find({createdBy:req.user._id, $and:[{_id:id}, {'subTodos._id':subTodoId}]})
    console.log(todowithDeletedSubtodo)
    if(todowithDeletedSubtodo.length===0) res.status(200).json(new apiResponse(200, 'Success'));

});


export {createTodo, getAllTodos, updateTodoById, toggleIsCompleted, 
        deleteTodoById, createSubTodo, updatesubTodo,toggleIsCompletedSubTodo, deleteSubTodo}