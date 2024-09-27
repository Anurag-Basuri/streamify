import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config({
    path: "./env",
});

const ConnectDB = async () => {
    try {
        const coninst = await mongoose.connect(
            `${process.env.MONGODB_URL}/${process.env.DB_NAME}`
        );
        console.log(
            `\n MongoDB connected !! DB HOST: ${coninst.connection.host}`
        );
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

export default ConnectDB;
