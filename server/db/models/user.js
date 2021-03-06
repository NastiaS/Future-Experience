'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');


var addressSchema = new mongoose.Schema({
    line1: String,
    line2: String,
    city: String,
    country: String,
    postalCode: Number
});

var schemaOptions = {
    toJSON : {
        virtuals : true
    }
};

var userSchema = new mongoose.Schema({
    firstName : {type : String},
    lastName : {type : String},
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    //used in routes later to display or not display certain properties
        select : false
    },
    salt: {
        type: String,
        select: false
    },
    twitter: {
        id: String,
        username: String,
        token: String,
        tokenSecret: String
    },
    facebook: {
        id: String,
        token : { type : String, select : false}
    },
    google: {
        id: String
    },
    address: [addressSchema],
    userType: {
        type: Number,
        default : 1
    }
}, schemaOptions);


// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function (plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};

var USER_LEVEL = {
    admin : 2,
    superUser : 3
};

userSchema.virtual('admin').get(function() {
    return this.userType === USER_LEVEL.admin;
});

userSchema.pre('save', function (next) {

    if (this.isModified('password')) {
        this.salt = this.constructor.generateSalt();
        this.password = this.constructor.encryptPassword(this.password, this.salt);
    }

    next();

});

userSchema.plugin(findOrCreate);
userSchema.statics.generateSalt = generateSalt;
userSchema.statics.encryptPassword = encryptPassword;

userSchema.method('correctPassword', function (candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

mongoose.model('User', userSchema);