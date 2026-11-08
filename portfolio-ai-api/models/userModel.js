import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true,
        default: ''
    },
    // Admin logs in by username; regular (stocks dashboard) users log in by email.
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    preferences: {
        sectors: { type: [String], default: [] },
        onboarded: { type: Boolean, default: false }
    }
}, { timestamps: true });

userSchema.pre('validate', function (next) {
    if (!this.username && !this.email) {
        this.invalidate('email', 'Either username or email is required');
    }
    next();
});

userSchema.methods.toPublic = function () {
    return {
        id: this._id.toString(),
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        role: this.role,
        preferences: {
            sectors: this.preferences?.sectors || [],
            onboarded: Boolean(this.preferences?.onboarded)
        }
    };
};

const User = mongoose.model('User', userSchema);

export default User;
