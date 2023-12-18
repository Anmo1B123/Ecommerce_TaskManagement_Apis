import fs from'fs'

export const fileDeleteFunction= (path1, path2)=>{
try{
if(path1 && !path2){  fs.unlinkSync(path1); return}
if(path2 && !path1){ fs.unlinkSync(path2); return}
if(path1 && path2){
fs.unlinkSync(path1);
fs.unlinkSync(path2);
return
}
}catch(error){
    console.log(error)
}
}
/****************************************/
/* DATE-08/12/2023

    Everything was working fine with this function until I decided to solve more potential corner cases-
    I noticed that this function was throwing errors 
    ERROR- path not correct/""this is not a path. etc. when null/undefined/emptystrings were being passed 
    in the arguments of this function.

    So, decided to add some if conditionals control inside the function to respond accordingly which stopped the
    errors.
    (OPTIONAL)Also added an additonal if condition to call the function only if one of the path exist
    and rest functionality is being handled here in function's body itself. (in userControllers.js). 
*/

