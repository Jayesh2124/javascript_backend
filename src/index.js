import dotenv from 'dotenv'

import connectDB from './db/index.js';

dotenv.config({
    path: './env'
});



connectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000), ()=>{
        console.log(`Server is running on port: ${process.env.PORT}`);
    };
})
.then((err)=>{
    console.log("MongoDB Connection FAILD !!", err);
})




/*
const app = express();
( async () =>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`);
        app.on("error", (error)=>{
            console.log("Error ", error)
            throw error;
        })
         app.listen(process.env.PORT, ()=>{
            console.log(`App is listining on port ${process.env.PORT}`);
         })
    } catch (error) {
        console.error("Error ",error)
        throw error;
    }
} )()

*/