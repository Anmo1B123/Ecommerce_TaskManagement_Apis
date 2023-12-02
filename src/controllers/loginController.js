import apiError from "../utils/apiError.js";
import { users } from "../models/users.js";

const login= (req, res, next)=> {
    try {
        const propArr= [username, email, password]
        propArr.forEach((prop)=>{
            if(!req.body.prop===undefined){
            const {prop}= req.body}
        })
    
     const arr=[ username, email, password]
        if (arr.some((el)=> el==="")){ throw new apiError('all fields are required', 400)}
    else{
        users.findone({$or:[{username},{email}]})
    }
        
    } catch (error) {
        next(error);
    }
}

export {login};