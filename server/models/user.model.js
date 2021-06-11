const mongoose = require('mongoose');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required:'Full name can\'t be empty'
    },
    number: {
        type: String,
        required:'Number can\'t be empty'
    },
    email: {
        type: String,
        required:'Email can\'t be empty',
        unique: true
    },
    organisation: {
        type: String,
        required:'Organisation name can\'t be empty'
    },
    password: {
        type: String,
        required:'Password can\'t be empty',
        minlength:[8,'Password must be atleast 4 characters long'],
        maxlength:[28,'Password must be atmost 28 characters long']
    },
    saltSecret: String
});

//custom validation for password
userSchema.path('password').validate((val)=>{
    passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,28}$/;
    return passwordRegex.test(val);
},'Invalid password.');

//custom validation for email
userSchema.path('email').validate((val)=>{
    emailRegex=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
},'Invalid e-mail.');

userSchema.pre('save',function(next){
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(this.password,salt,(err,hash)=>{
            this.password=hash;
            this.saltSecret=salt;
            next();
        });
    });
});


userSchema.methods.verifyPassword=function(password){
    return bcrypt.compareSync(password,this.password);
};


userSchema.methods.generateJwt = function(){
    return jwt.sign({_id:this._id},
        process.env.JWT_SECRET,
        {
            expiresIn:process.env.JWT_EXP
        });
}



mongoose.model('User',userSchema);