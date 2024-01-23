import mongoose,{Schema} from 'mongoose';


const subTodosSchema = new Schema({

subtodotitle:{
    type:String,
    required:true,
    trim:true
},

subtodocontent:{
    type:String,
    default:"",
    trim:true
},

isCompleted:{
    type:Boolean,
    default:false
}

});

const todoSchema= new Schema({

title:{
    type:String,
    required:true,
    trim:true
},

content:{
    type:String,
    default:"",
    trim:true
},

duedate:{
    type:Date,
    required:true
},

priority:{
    type:String,
    enum:['low', 'medium', 'high'],
    default:'low'

},

isCompleted:{
    type:Boolean,
    default:false
},

createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users',
    required:true
},

subTodos:{
    type:[subTodosSchema]
}
    
}, {timestamps:true});

let preFindHookFunc= function(){};
export function initializePreFindHookFunc (requestObject) {

    preFindHookFunc=function(next){

            const req = requestObject;
            this.find({createdBy:req.user._id});
            next()
        }

}

todoSchema.pre(/^find/, preFindHookFunc);

todoSchema.statics.findbyAuthenticatedUser=function(user){

    return this.find({createdBy:user._id});
}

export const todos= mongoose.model('todos', todoSchema);