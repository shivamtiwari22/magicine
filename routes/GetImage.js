import express from "express";

const imageRoute = express.Router();

imageRoute.get("/:main/:folder/:subfolder/:filename"),
  (req, resp) => {
    const { folder, subfolder, filename } = req.params;
    const imagePath = path.join(__dirname, main, folder, subfolder, filename);

    resp.sendFile(imagePath, (err) => {
      if (err) {
        resp.status(404).send("Image not found");
      }
    });
  };

export default imageRoute;
