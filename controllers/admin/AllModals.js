import handleResponse from "../../config/http-response.js";
import mongoose from "mongoose";

class AllModalsController {
    static GetAllModals = async (req, resp) => {
        try {
            const allModals = Object.keys(mongoose.connection.models)

            return handleResponse(200, "All Models fetched successfully.", allModals, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }
}

export default AllModalsController;