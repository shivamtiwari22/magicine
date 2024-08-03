import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import NeedHelp from "../../src/models/adminModel/NeedHelp.js";

class NeedHelpController {
    static GetAllDispute = async (req, resp) => {
        try {
            const user = req.user;
            if (!user) {
                return handleResponse(401, "unauthorized user", {}, resp)
            }
            const allDisputes = await NeedHelp.find().sort({ createdAt: -1 })
            if (!allDisputes) {
                return handleResponse(404, "No dispute found.", {}, resp)
            }

            for (const key of allDisputes) {
                const userData = await User.findOne({ id: key.created_by },
                    "id name phone_number email"
                )
                if (key.created_by) {
                    key.created_by = userData
                }
            }

            return handleResponse(200, "Dispute fetched successfully.", allDisputes, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    static updateStatus = async (req, resp) => {
        try {
            const user = req.user;
            if (!user) {
                return handleResponse(401, "Unauthorized User", {}, resp);
            }

            const { id } = req.params;
            const status = req.body;

            const dispute = await NeedHelp.findOneAndUpdate(
                { id: id },
                { $set: status },
                { new: true }
            );

            if (!dispute) {
                return handleResponse(404, "Dispute Not Found.", {}, resp);
            }

            return handleResponse(200, "Dispute Status Changed Successfully", dispute, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }

}


export default NeedHelpController