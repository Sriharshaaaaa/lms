const express = require('express');
const dotenv= require('dotenv');
dotenv.config();

const app= express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.send('LMS api is working');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});