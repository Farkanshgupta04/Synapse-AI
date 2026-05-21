import jwt from "jsonwebtoken"
import config from '../config.js'
function userMiddleware(req,res,next){
    const authHeader=req.headers.authorization
    if(!authHeader || !authHeader.startsWith("Bearer ")){
                return res.status(401).json({
                    success: false,
                    error: {
                        message: 'Authentication required',
                        code: 'NO_TOKEN'
                    }
                });
    }
    const token=authHeader.split(" ")[1]
    try {
        const decoded=jwt.verify(token,config.JWT_USER_PASSWORD)
        req.userId=decoded.id

        next();
    } catch (error) {
                const message = error.name === 'TokenExpiredError' 
                    ? 'Token has expired'
                    : 'Invalid token';
        
                return res.status(401).json({
                    success: false,
                    error: {
                        message,
                        code: 'INVALID_TOKEN'
                    }
                });
    }
}

export default userMiddleware;