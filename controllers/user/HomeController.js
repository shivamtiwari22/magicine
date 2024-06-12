import Medicine from "../../src/models/adminModel/MedicineModel.js";
import handleResponse from "../../config/http-response.js";
import Brand from "../../src/models/adminModel/BrandModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import Tags from "../../src/models/adminModel/Tags.js";

class HomeController {
  static SingleMedicine = async (req, res) => {
    const { slug } = req.params;

    try {
      const medicine = await Medicine.findOne({ slug }).lean();
      if (!medicine) {
        return handleResponse(404, "Not Found", {}, res);
      }

      const variant = await InvertoryWithoutVarient.findOne(
        { "item.itemId": medicine.id, "item.itemType": medicine.type },
        "id item stock_quantity mrp selling_price discount_percent"
      ).lean();

      medicine.without_variant = variant;

      const withVariant = await InventoryWithVarient.find(
        { modelId: medicine.id, modelType: medicine.type },
        "id modelType modelId image mrp selling_price"
      ).lean();

      medicine.with_variant = withVariant;

      const tags = await Tags.find(
        {
          id: { $in: medicine.tags },
        },
        "id name"
      );

      medicine.tags = tags;

      const linked_items = await Medicine.find(
        {
          id: { $in: medicine.linked_items },
        },
        "id product_name featured_image slug hsn_code generic_name prescription_required type"
      ).lean();

      medicine.linked_items = linked_items;

      for (const item of linked_items) {
        const variant = await InvertoryWithoutVarient.findOne(
          { "item.itemId": item.id, "item.itemType": item.type },
          "id item stock_quantity mrp selling_price discount_percent"
        ).lean();
        item.without_variant = variant;

        const withVariant = await InventoryWithVarient.find(
          { modelId: item.id, modelType: item.type },
          "id modelType modelId image mrp selling_price"
        ).lean();
        item.with_variant = withVariant;
      }

      return handleResponse(200, "Single Medicine", medicine, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static allMedicine = async (req, res) => {
    try {
      const {searchName} = req.query 
      let medicine = await Medicine.find({ product_name: new RegExp(searchName, 'i') },"id product_name featured_image status slug gallery_image hsn_code has_varient prescription_required indication packOf minimum_order_quantity  short_description type").sort({ _id: -1 }).lean();

      for(const item of medicine){
        if(item.has_varient){
          const withVariant = await InventoryWithVarient.find(
            { modelId: item.id, modelType: item.type },
            "id modelType modelId image mrp selling_price"
          ).lean();
          item.with_variant = withVariant;
        }
        else {
          const variant = await InvertoryWithoutVarient.findOne(
            { "item.itemId": item.id, "item.itemType": item.type },
            "id item stock_quantity mrp selling_price discount_percent"
          ).lean();
          item.without_variant = variant;
        }
     

       
      }

      return handleResponse(200, "All Medicine", medicine, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };
}

export default HomeController;
