import handleResponse from "../../config/http-response.js";

const ImageRoutes = async (req, resp) => {
  try {
    const { main,folder, subfolder, filename } = req.params;
    const imagePath = path.join(__dirname, main, folder, subfolder, filename);
  
    resp.sendFile(imagePath, (err) => {
      if (err) {
        resp.status(404).send('Image not found');
      }
  })

  } catch (err) {
    return handleResponse(500, err.message, {}, resp);
  }
};


export default ImageRoutes