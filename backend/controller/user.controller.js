import {User} from "../model/user.model.js"
import config from "../config.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

export const signup= async (req,res)=>{
 //destructuring js use here
    const {firstName,lastName,email,password}=req.body;
   // console.log(firstName,lastName,email,password);
    //isko parse karna padega nahi toh destructure property ko allow nahi karega
    try {
        const user=await User.findOne({email:email});
        if(user){
                        return res.status(409).json({
                            success: false,
                            error: { message: 'Email already registered' }
                        });
        }
        const hashpassword=await bcrypt.hash(password,10);

        const newuser=new User({
            firstName,
            lastName,
            email,
            password:hashpassword,
        });
        await newuser.save();
                return res.status(201).json({
                    success: true,
                    message: 'User signup successful'
                });
        
    } catch (error) {
        console.log("Error in signup: ",error);
                res.status(500).json({
                    success: false,
                    error: { message: 'Error creating user account' }
                });
    }
}

export const login=async (req,res) => {
    const {email,password}=req.body;
    try {
        const user=await User.findOne({email:email});
        if(!user){
                        return res.status(401).json({
                            success: false,
                            error: { message: 'Invalid email or password' }
                        });
        }
         const isPasswordCorrect=await bcrypt.compare(password,user.password);
          if(!isPasswordCorrect){
                        return res.status(401).json({
                            success: false,
                            error: { message: 'Invalid email or password' }
                        });
        }
        //jwt code
        const token=jwt.sign({id:user._id},config.JWT_USER_PASSWORD,{
            expiresIn:"1d"
        });
        const cookiesOptions={
            expires:new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
                        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax"
            //frontend mai use hoga cookie ka
        }
        res.cookie("jwt",token,cookiesOptions);
                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    },
                    token
                });
    } catch (error) {
         console.log("Error in login: ",error);
                res.status(500).json({
                    success: false,
                    error: { message: 'Login failed' }
                });
    }
}


export const logout=(req,res)=>{
    try {
        res.clearCookie("jwt")
                return res.status(200).json({
                    success: true,
                    message: 'Logout successful'
                });
    } catch (error) {
         console.log("Error in logout: ",error);
                res.status(500).json({
                    success: false,
                    error: { message: 'Logout failed' }
                });
    }
}

export const googleLogin = async (req, res) => {
    const googleToken = req.body.token || req.body.credential;
    try {
        if (!googleToken) {
            return res.status(400).json({
                success: false,
                error: { message: 'Google token is required' }
            });
        }

        // Verify Google token
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        // Split name into first and last name
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Find or create user
        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user for Google login
            user = new User({
                firstName,
                lastName,
                email,
                password: 'google_oauth_' + sub, // Password not used for Google login
                googleId: sub,
                profilePicture: picture
            });
            await user.save();
        } else if (!user.googleId) {
            // Update existing user with Google ID
            user.googleId = sub;
            if (picture) user.profilePicture = picture;
            await user.save();
        }

        // Generate JWT token
        const jwtToken = jwt.sign({ id: user._id }, config.JWT_USER_PASSWORD, {
            expiresIn: "1d"
        });

        const cookiesOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax"
        };

        res.cookie("jwt", jwtToken, cookiesOptions);

        const responsePayload = {
            success: true,
            message: 'Google login successful',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePicture: user.profilePicture
            },
            token: jwtToken
        };

        const wantsJson = req.is('application/json') || (req.headers.accept || '').includes('application/json');

        if (wantsJson) {
            return res.status(200).json(responsePayload);
        }

        const frontendUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:5173');
        frontendUrl.hash = `/login?authToken=${encodeURIComponent(jwtToken)}&authUser=${encodeURIComponent(JSON.stringify(responsePayload.user))}`;

        return res.redirect(302, frontendUrl.toString());

    } catch (error) {
        console.log("Error in Google login: ", error);
        
        let errorMessage = 'Google login failed';
        if (error.message.includes('Token used too late')) {
            errorMessage = 'Token has expired';
        } else if (error.message.includes('Invalid token')) {
            errorMessage = 'Invalid Google token';
        }

        res.status(401).json({
            success: false,
            error: { message: errorMessage }
        });
    }
}
