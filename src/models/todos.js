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


// todoSchema.pre(/^find/, function(next){

//     // const req = this.req;
//     console.log(req)
//     this.find({createdBy:req.user._id});
//     // console.log(this)
//     next()
// });

todoSchema.statics.findbyAuthenticatedUser=function(user){

    return this.find({createdBy:user._id});
}

export const todos= mongoose.model('todos', todoSchema);