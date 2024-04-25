import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'




const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique:true,
        lowercase:true
    },
    email:{
        type: String,
        required: true,
        unique:true,
        lowercase:true
    },
    password:{
        type: String,
        required: [true, 'Password is required!'],
    },
    phoneNumber: {
        type: String
    },
    avatar:{
        type:String,  // cloudnary
    },
    refreshToken:{
        type:String
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
},{timestamps:true});

userSchema.plugin(mongooseAggregatePaginate);

userSchema.pre('save', async function(next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(
            this.password,
            10
        );
    }
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            fullName:this.fullName,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('User', userSchema);