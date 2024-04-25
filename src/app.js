import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path'

const app = express();
// const INITIAL_PREFIX = "/.netlify/functions/api/v1";
const INITIAL_PREFIX = "/api/v1";



// Applying middlewares;
app.use(cors({
    origin:'*'
}));
app.use(express.json({
    limit:process.env.JSON_LIMIT
}));
app.use(express.urlencoded({
    extended:true,
    limit:process.env.URL_ENCODED_LIMIT
}))
app.use(express.static(path.join(process.cwd(), 'public')))
app.use(cookieParser());
// A temporary Route
app.get('/',(req,res)=>{
    res.json({
        message:'Hello Nova Home'
    })
})


// Importing Routers 
import productRouter from './routes/product.routes.js';
import userRouter from './routes/user.routes.js';
import categoryRouter from './routes/category.routes.js';
import subCategoryRouter from "./routes/subcategory.routes.js";
import imageRouter from "./routes/images.routes.js";


// Connecting Routers
app.use(`${INITIAL_PREFIX}/products`,productRouter);
app.use(`${INITIAL_PREFIX}/users`,userRouter);
app.use(`${INITIAL_PREFIX}/category`,categoryRouter);
app.use(`${INITIAL_PREFIX}/subcategory`,subCategoryRouter);
app.use(`${INITIAL_PREFIX}/images`,imageRouter);



// Just for build on netlify
export {
    app
};


