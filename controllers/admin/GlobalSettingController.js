import handleResponse from "../../config/http-response.js";
import Global from "../../src/models/adminModel/GlobalModel.js";



class GlobalSetting {

      static addOrUpdateGlobal = async (req ,res) => {
                 try {

                    
                    const user = req.user;
                    if (!user) {
                      return handleResponse(401, "User not found.", {}, resp);
                    }
              
                    const images = req.files;
                    const { logo, ...globalSetting } = req.body;
              
                    const newShippingPolicy = new Global({
                      created_by: user.id,
                      ...globalSetting,
                    });
              
                    // if (images && images.banner_image) {
                    //   newShippingPolicy.banner_image = images.banner_image[0].path;
                    // }
              
                    await newShippingPolicy.save();
                    return handleResponse(
                      201,
                      "Global Settings Updated successfully.",
                      { newShippingPolicy },
                      res
                    );

                 }
                 catch(err){
                    if (err.name === "ValidationError") {
                        const validationErrors = Object.keys(err.errors).map((field) => ({
                          field: field,
                          message: err.errors[field].message,
                        }));
                        return handleResponse(
                          400,
                          "Validation error.",
                          { errors: validationErrors },
                          res
                        );
                      } else {
                        return handleResponse(500, err.message, {}, res);
                      }
                 }
      }


}


export default GlobalSetting