import { users } from "../models/users.js";
import apiError from "./apiError.js";

export class apiFeatures{
constructor(queryObj, queryString){

this.queryObj=queryObj;
this.queryString=queryString

}

static  pageErrorfunc(documentCount, req){
    const page= parseInt(req.query.page) || 1;
    
    const limit= parseInt(req.query.limit) || 5;
    
    const skip= (page-1)*limit

    let count=  documentCount
if (skip >= count) throw new apiError('Page not found', 400)

}

filter(){

    let exclusions= ['sort', 'page', 'limit', 'fields']
    const querystrobj= {...this.queryString};
    console.log(querystrobj);
    exclusions.forEach((el)=>{

        delete querystrobj[el]
        
    });
    console.log(querystrobj);

    let querystr =JSON.stringify(querystrobj)

    querystr= querystr.replace(/\b(gt|gte|lt|lte|in)\b/ig, (match)=>'$'+match);

    querystr=JSON.parse(querystr)

    this.queryObj= users.find(querystr);
    this.docsCount=users.find(querystr).count();

    return this;
}

sort(){
    if(this.queryString.sort){
        
    const sortFields= this.queryString.sort.split(',').join(' ');
    this.queryObj=this.queryObj.sort(sortFields);
}else{

   this.queryObj= this.queryObj.sort('-createdAt');

}

    return this;
}

fields(){
        if(this.queryString.fields){
        
        const fields =this.queryString.fields.split(',').join(' ');
        console.log(fields, 'hi')
       this.queryObj= this.queryObj.select(fields);   
}

    return this;
}

pagination(){

    const page= parseInt(this.queryString.page) || 1;
    this.page=page;
    const limit= parseInt(this.queryString.limit) || 5;
    this.limit=limit;
    const skip= (page-1)*limit
console.log(this.docsCount + 'hey')


   this.queryObj= this.queryObj.skip(skip).limit(limit);

   const queryObjForDocsOnthisPage= Object.create(this.queryObj)
//Used Object.create to preserve the prototype of this.queryObj and queryObjForDocsOnthisPage

   this.docsOnthisPage= queryObjForDocsOnthisPage.count()
   

return this;
}
}