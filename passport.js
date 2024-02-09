import { config } from 'dotenv';
config({path: './config.env'});
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';


import { users } from './src/models/users.js';
import apiError from './src/utils/apiError.js';

try {
  
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
  
  
    async (accessToken, refreshToken, profile, next)=>{
  
      // const profileuser= profile;
      // console.log(profileuser);
      // console.log('here is the profile 1=> ' + Object.keys(profile));
      
      const user= await users.findOne({ email:profile._json.email })

      if(user){
        
      if(user.loginType!=='google'){
        
        const logintype= user.loginType

        next(new apiError(`You have previously used ${logintype} for login. Kindly login with the same`,400),null)

      }else{ 
        
        next(null,user);
        
      }
      return;
    }
      
  const createdUser= await users.create(
                                                  {
                username:profile._json.email.split('@')[0],
                firstname:profile._json.given_name,
                lastname:profile._json.family_name?profile._json.family_name:undefined,
                email:profile._json.email,
                password:profile._json.sub,
                confirmPassword:profile._json.sub,
                avatar: {  url:profile._json.picture,
                          localpath:""
                        },
                role:'user',
                loginType:'google'
                                                  })
  
       user?next(null, createdUser):next(new apiError('Error while registering the user',500), null);
      
}));
  
  
  passport.serializeUser((user, next)=>{
  
    next(null,user._id);
  
  });
  
  passport.deserializeUser(async (id, next)=>{
  // console.log(id);
    try {
      const user= await users.findById(id)

      if(!user){ next(new apiError('user does not exist', 404), null);
    }else{
      next(null,user);
    }
    } catch (error) {
      
      next(new apiError(`Something went wrong while deserializing the user. Error: ${error}`,500), null)
    }
  
  });
  
} catch (error) {
  console.log(`PASSPORT ERROR=> ${error}`)
}