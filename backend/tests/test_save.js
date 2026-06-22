const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/cleanstreet').then(async () => {
    const User = require('./models/user');
    const user = await User.findOne();
    if(user) {
        console.log('Found user:', user._id);
        try {
            user.password = 'test1234';
            await user.save();
            console.log('Saved successfully');
        } catch (e) {
            console.error('Save error:', e.message);
        }
    }
    mongoose.disconnect();
});
