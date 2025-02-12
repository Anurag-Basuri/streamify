import { api } from "./api.js";
import ConnectDB from "./database/index.js";

ConnectDB()
    .then(() => {
        api.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
