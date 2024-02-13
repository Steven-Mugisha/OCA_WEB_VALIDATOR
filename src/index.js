import express from 'express';
import validatorRouter from './routes/validatorRoutes.js';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());


app.use("/validator", validatorRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
});
