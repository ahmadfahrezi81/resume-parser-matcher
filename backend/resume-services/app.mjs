import express from "express";

const app = express();

app.get("/api", (req, res) => {
    res.send("Hello Worlds!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
