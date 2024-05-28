import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import handleResponse from "../../config/http-response.js";


class  InventoryWithVarientController {

    static addVariant = async(req,res) => {
           try {

            console.log(req.body);
            // const variants = JSON.parse(req.body.variants); // Parsing the JSON array from the request body
            // const files = req.files.images; // Access the uploaded files
        
            // if (!Array.isArray(variants) || variants.length === 0) {
            //   return res.status(400).json({ message: 'No product variants provided' });
            // }
        
            // const savedVariants = [];
        
            // for (let i = 0; i < variants.length; i++) {
            //   const variant = variants[i];
            //   const imagePath = files[i] ? files[i].path : null;
        
            //   const productVariant = new InventoryWithVarient({
            //     variant: variant.variant,
            //     modelType: variant.modelType ,
            //     modelId : variant.modelId ,
            //     attribute : variant.attribute ,
            //     attribute_value : variant.attribute_value,
            //     image: imagePath,
            //     sku: variant.sku,
            //     stock_quantity: variant.stock_quantity,
            //     mrp: variant.mrp,
            //     selling_price: variant.selling_price
            //   });
        
            //   const savedVariant = await productVariant.save();
            //   savedVariants.push(savedVariant);
            // }
        
            // res.status(201).json({ message: 'Product variants stored successfully', variants: savedVariants });

           }
           catch(e){
            console.log(req.body);
            
            return handleResponse(500, e.message, {}, res);
           }
    } 

}

export default InventoryWithVarientController