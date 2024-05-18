import handleResponse from "../../config/http-response.js";
import Global from "../../src/models/adminModel/GlobalModel.js";



class GlobalSetting {

      static addOrUpdateGlobal = async (req ,res) => {
                 try {

                    
                    const user = req.user;
                
                    const images = req.files;
                    const { logo,icon_image , ...globalSetting } = req.body;

                    console.log(req.file);

                    let existingGlobal = await Global.findOne({
                        created_by: user.id,
                      });

              
                      if(existingGlobal){
                        const base_url = `${req.protocol}://${req.get("host")}/api`;


                        if (images && images.logo) {
                            existingGlobal.logo = `${base_url}/${images.logo[0].path.replace(
                              /\\/g,
                              "/"
                            )}`;
                          }

                          if(images && images.icon_image){
                            existingGlobal.icon_image = `${base_url}/${images.icon_image[0].path.replace(
                                /\\/g,
                                "/"
                              )}`;
                          }

                          Object.assign(existingGlobal, globalSetting);
                          await existingGlobal.save();
                          return handleResponse(
                            200,
                            "Privacy Policy updated successfully.",
                            existingGlobal,
                            res
                          );
                       
                      }
                      else {
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
                            "Global Settings Created successfully.",
                            { newShippingPolicy },
                            res
                          );
                      }

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