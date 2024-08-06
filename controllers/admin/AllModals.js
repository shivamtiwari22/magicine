import handleResponse from "../../config/http-response.js";
import mongoose from "mongoose";

class AllModalsController {
    static GetAllModals = async (req, resp) => {
        try {
            const allModels = Object.keys(mongoose.connection.models);

            const excludeModels = ['Counter_id', 'Sequence', 'Roles', 'RecentView', 'NotFoundSearch', 'Permission', 'ShippingCountry', 'CartItem', 'NeedHelpMessage'];

            const filteredModels = allModels.filter(model => !excludeModels.includes(model));

            return handleResponse(200, "All Models fetched successfully.", filteredModels, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }
}

export default AllModalsController;