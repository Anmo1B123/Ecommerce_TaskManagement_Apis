import apiError from "../utils/apiError.js"
import { fileDeleteFunction } from "../utils/fsFileDelete.js"

export const emailSymbolChecker=(req,res,next)=>{
const {email=undefined} = req.body
if(email)
{
    if(/\S+\@\S+\.\S+/.test(email))
    {
        next()
    }
    else
    {
        if(req.files)
        {
        const avatarfilepath=req.files?.avatar? req.files.avatar[0].path : "";
        const coverimagefilepath=req.files?.coverimage? req.files.coverimage[0].path : "";

        if(avatarfilepath || coverimagefilepath){fileDeleteFunction(avatarfilepath,coverimagefilepath);}
        }
        throw new apiError('This is not a valid email-id', 400);
    }
}
else
{
    next();
}
}

/* DATE-08/12/2023

Decided to Create a middleware to throw errors in advance only if user enters email to update
and email doesn't contain @ or . symbol, but if user hasn't opted for updating email or email does contain
all symbols calling next() */