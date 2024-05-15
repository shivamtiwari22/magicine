import CustomFiled from "../../src/models/adminModel/CustomField.js";
import handleResponse from "../../config/http-response.js";


class CustomField {

    static addCustom = async (req,res) => {
                 try {

                    const { attribute_name , attribute_type , list_order , category_id} = req.body ;

                    if(attribute_name && attribute_type && list_order && category_id){
                        const doc = new CustomField({
                            attribute_type: attribute_type,
                            attribute_name: attribute_name,
                            list_order: list_order,
                            category_id: category_id,
                            created_by:  req.user._id ,
                          });
              
                          await doc.save();
                          handleResponse(201,"Crated Successfully", doc , res)
                    }
                    else {
                        handleResponse(400 , "All fields are required",{},res)
                    }
                      
                 }
                 catch (err) {
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

export default CustomField;
