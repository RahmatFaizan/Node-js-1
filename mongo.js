import mongoose from "mongoose";
const url = 'mongodb+srv://test6661:IyUr0PZIGR7hSkcE@cluster0.yc7tc.mongodb.net/mern'
function connect() {
    mongoose.connect(url).then(() => console.log('Connect Successfully')).catch(err => console.log(err));
}

export default connect;