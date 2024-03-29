import { products } from "../models/Ecom/product.js";
import { users } from "../models/users.js";
import apiError from "./apiError.js";
import _ from "lodash";

export class apiFeatures{
constructor(queryObj, queryString, modelVal){

this.queryObj=queryObj;
this.queryString=queryString;
this.modelVal = modelVal;

}

static  pageErrorfunc(documentCount, req){
    if(documentCount===0) throw new apiError('No document Found', 404);
    const page= parseInt(req.query.page) || 1;
    
    const limit= parseInt(req.query.limit) || 5;
    
    const skip= (page-1)*limit

    let count=  documentCount
if (skip >= count) throw new apiError('Page not found', 400)

}

search(){

    let exclusions= ['sort', 'page', 'limit', 'fields', 'filters']
    const querystrobj= _.cloneDeep(this.queryString);

    exclusions.forEach((el)=>{

        delete querystrobj[el]
        
    });

    let querystr =JSON.stringify(querystrobj)

    querystr= querystr.replace(/\b(gt|gte|lt|lte|in)\b/ig, (match)=>'$'+match);

    querystr=JSON.parse(querystr)

    let regexQuery={};

    Object.entries(querystr).forEach((key_Values)=>{
        const key= key_Values[0]
        const value= key_Values[1]

        regexQuery[key]= {$regex: new RegExp(`^${value}$`, 'i')}

    })
    // console.log(regexQuery)

    this.queryObj= this.queryObj.find(regexQuery);
   
    const queryObjForDocsOnthisPage= _.cloneDeep(this.queryObj)

    this.docsCount=queryObjForDocsOnthisPage.count();

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

   const queryObjForDocsOnthisPage= _.cloneDeep(this.queryObj);

   this.docsOnthisPage= queryObjForDocsOnthisPage.count()
   

return this;
}
}


export class productApiFeatures extends apiFeatures{

constructor(queryObj, queryString, modelVal){
super(queryObj, queryString, modelVal);
} 

static pageErrorfunc(documentCount, req){

    super.pageErrorfunc(documentCount, req)
}

search(){

   super.search()
    
};

filters(){

    const {minPrice=undefined, maxPrice=undefined, category=undefined} = this.queryString.filters

    const categoyArr = category?.split(',');

    let tempQueryObj = this.queryObj.where('price').gte(minPrice?minPrice:0).lte(maxPrice?maxPrice:1000000000)


    if(categoyArr.length > 0){

        tempQueryObj=tempQueryObj.where('preDefinedCategories').in(categoyArr)
    }

    this.queryObj= tempQueryObj
//    this.queryObj= this.queryObj.find({price:{$gte:minPrice?minPrice:0, $lte: maxPrice?maxPrice:1000000000}, 
//                                     preDefinedCategories:{$in:categoyArr}})

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


export class couponApiFeatures extends productApiFeatures{

constructor(queryObj, queryString, modelVal){
        
        super(queryObj, queryString, modelVal);
} 
        
    
static pageErrorfunc(documentCount, req){
        
            super.pageErrorfunc(documentCount, req)
}

search(){

    super.search()
     
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