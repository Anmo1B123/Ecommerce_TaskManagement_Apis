import { products } from "../models/Ecom/product.js";
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

search(){

    let exclusions= ['sort', 'page', 'limit', 'fields', 'filters']
    const querystrobj= {...this.queryString};
    console.log(querystrobj);
    exclusions.forEach((el)=>{

        delete querystrobj[el]
        
    });
    console.log(querystrobj);

    let querystr =JSON.stringify(querystrobj)

    // NO NEED FOR NOW -> querystr= querystr.replace(/\b(gt|gte|lt|lte|in)\b/ig, (match)=>'$'+match);

    querystr=JSON.parse(querystr)

    let regexQuery={};

    Object.entries(querystr).forEach((key_Values)=>{
        const key= key_Values[0]
        const value= key_Values[1]

        regexQuery[key]= {$regex: new RegExp(`^${value}`, 'i')}

    })


    this.queryObj= this.queryObj.find(regexQuery);
   

/* should use a dynamic variable for count in place of users model in the below code */
 this.docsCount=users.find(regexQuery).count();

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


export class productApiFeatures extends apiFeatures{

constructor(queryObj, queryString){
super(queryObj);
super(queryString);
}

static pageErrorfunc(documentCount, req){

    const page= parseInt(req.query.page) || 1;
    
    const limit= parseInt(req.query.limit) || 5;
    
    const skip= (page-1)*limit

    let count=  documentCount
if (skip >= count) throw new apiError('Page not found', 400)
    
}

search(){

   super.search()
    
};

filters(){

    const {minPrice=undefined} = this.queryString.filters
    const {maxPrice=undefined} = this.queryString.filters
    const {category=undefined} = this.queryString.filters

    const categoyArr = category.split(',');

   this.queryObj= this.queryObj.find({price:{$gte:minPrice?minPrice:0, $lte: maxPrice?maxPrice:1000000000}, 
                                    preDefinedCategories:{$in:categoyArr}})

   return this;

};

sort(){

    super.sort()
};

fields(){

    super.fields()
};

pagination(){

    super.pagination()
};


}