import apiError from "../../utils/apiError.js";
import { users } from "../../models/users.js";
import { asyncHandler } from "../../middlewares/Handlers/asyncHandler.js";
import apiResponse from "../../utils/apiResponse.js";
import bcrypt from 'bcrypt'
import { client } from "../../database/redis.js";

const login= asyncHandler(async (req, res)=> {

    const {username=undefined, email=undefined, password=undefined}=req.body;

    if(((username===undefined || username.trim()==="") && (email===undefined || email==="")) || password===undefined || password==="") throw new apiError('username or email and a password is required to login', 400);

    const userFound = await users.findOne({$or:[{username},{email}]});
    if (!userFound) throw new apiError('user does not exist by these credentials. Kindly register first', 404);
    
       
       
        if (! await userFound.isPasswordCorrect(password)){
                                         
        throw new apiError('wrong password', 400)
    };

       const accessTokenResult1 =await userFound.generateToken();
       const refreshTokenResult2=await userFound.generateRefreshToken();

       const {accessToken, uniqueV1}= accessTokenResult1;
       const {refreshToken, uniqueV2}= refreshTokenResult2;

       await userFound.save({validateBeforeSave:false});
        // console.log(userFound)
    //    req.session.access=uniqueV1;
    //    req.session.refresh=uniqueV2;
    //    console.log(req.session);
    //Saving the unique versions of both tokens in the req.session object.

    /* Saving the unique version in REDIS */

    // client.set('user:token:access', uniqueV1,).then(()=>console.log('Access Token Version is saved in Redis'))
    //                                         .catch((err)=>console.log(err));

    // client.set('user:token:refresh', uniqueV2).then(()=>console.log('Refresh Token Version is saved in Redis'))
    //                                         .catch((err)=>console.log(err));
       
    const oneDaySeconds= 24*60*60
    const thirtyDaysSeconds= 30*24*60*60

    //ACCESS-TOKEN COOKIE MAXAGE=1D, REFRESH-TOKEN COOKIE MAXAGE=30D;
    res.setHeader('Set-cookie', [`accessToken=${accessToken}; Max-Age=${oneDaySeconds}; Path=/; HttpOnly; Secure`, 
                                `refreshToken=${refreshToken}; Max-Age=${thirtyDaysSeconds};Path=/; HttpOnly; Secure`])
    
    res.status(200).json(new apiResponse(200, 'success-kindly check the Token', {accessToken, refreshToken}));

});

const handleSocialLogin = asyncHandler(async (req, res)=>{

    const user= await users.findById(req.user?._id);
    if(!user) throw new apiError('user does not exist', 404);

    const {accessToken}= await user.generateToken();
    const {refreshToken}= await user.generateRefreshToken();
    // console.log(accessToken, '     refresh----------   ' +  refreshToken)
    await user.save({validateBeforeSave:false});

    //ACCESS-TOKEN COOKIE MAXAGE=1D, REFRESH-TOKEN COOKIE MAXAGE=30D;
    const oneDaySeconds= 24*60*60
    const thirtyDaysSeconds= 30*24*60*60
    res.setHeader('Set-cookie', [`accessToken=${accessToken}; Max-Age=${oneDaySeconds}; Path=/; HttpOnly; Secure`, 
    `refreshToken=${refreshToken}; Max-Age=${thirtyDaysSeconds};Path=/; HttpOnly; Secure`])
    
    //WE CAN ALSO REDIRECT THE USER TO THE FRONTEND URL IF CLIENT IS NOT USING COOKIES WITH THE ACCESS & REFRESH TOKEN IN THE URL AS QUERY PARAMS
    //THAT URL WHICH FRONTEND WANTS.
    res.redirect(`http://localhost:4001/?accesstoken=${accessToken}&refreshToken=${refreshToken}`)
    //FOR NOW WE ARE SIMPLY SENDING A RESPONSE FROM THE BACKEND 
    // res.status(200).json(new apiResponse(200, 'access and refresh tokens have been sent', {accessToken, refreshToken}));


// console.log(req.user? req.user:null + 'here i am \n HERE');
// res.send('done');


})


const logout=asyncHandler(async (req,res)=>{

    const user = await users.findById(req.user._id)
    if(!user) throw new apiError('unauthorized request',401)

    // req.session.access=undefined;
    // req.session.refresh=undefined;

    // await client.del('user:token:access')
    // await client.del('user:token:refresh')

    
    user.refreshtoken=undefined;
    user.uniqueVersionAccess=undefined;
    user.uniqueVersionRefresh=undefined;
    await user.save({validateBeforeSave:false})

    req.logout()
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json(new apiResponse(200,'Successfully Logged-out'))

});

export {login,handleSocialLogin,logout};