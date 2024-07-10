import Form from "../../src/models/adminModel/FormModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";


class FormController {
    //add
    static AddUses = async (req, resp) => {
        try {
            const user = req.user;

            const usesData = req.body;

            const existingUse = await Form.findOne({ name: usesData.name })
            if (existingUse) {
                return handleResponse(409, "Form with this name already exists", {}, resp)
            }

            const newUse = new Form({
                ...usesData,
                created_by: user.id
            })

            await newUse.save()
            return handleResponse(201, "New Form created successfully.", newUse, resp)


        } catch (err) {
            if (err.name === "ValidationError") {
                const validationErrors = Object.keys(err.errors).map((field) => ({
                    field: field,
                    message: err.errors[field].message,
                }));
                return handleResponse(
                    400,
                    "Validation error.",
                    { errors: validationErrors },
                    resp
                );
            } else {
                return handleResponse(500, err.message, {}, resp);
            }
        }
    }

    //get-all
    static GetAllUses = async (req, resp) => {
        try {
            const allUses = await Form.find().sort({ createdAt: - 1 })
            if (!allUses) {
                return handleResponse(404, "No form found.", {}, resp)
            }

            const filteredUses = allUses.filter((item) => item.deleted_at === null)
            if (filteredUses.length < 0) {
                return handleResponse(200, "No Form Available", {}, resp)
            }

            for (const key of filteredUses) {
                if (key.created_by) {
                    const userData = await User.findOne({ id: key.created_by })
                    key.created_by = userData
                }
            }

            return handleResponse(200, "Form Fetched Successsfully", filteredUses, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //get single uses
    static GetSingleUses = async (req, resp) => {
        try {
            const user = req.user;
            const { id } = req.params;

            const uses = await Form.findOne({ id: id })
            if (!uses) {
                return handleResponse(404, "Form not fund.", {}, resp)
            }

            if (uses.created_by) {
                const userData = await User.findOne({ id: uses.created_by })
                uses.created_by = userData
            }

            return handleResponse(200, "Form fetched Successfully", uses, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //update uses
    static UpdateUses = async (req, resp) => {
        try {
            const user = req.user;
            const userData = req.body;
            const { id } = req.params;

            const existingUses = await Form.findOne({ id: id })

            if (!existingUses) {
                return handleResponse(404, "Form not found.", {}, resp)
            }

            for (const key in userData) {
                if (Object.hasOwnProperty.call(userData, key)) {
                    existingUses[key] = userData[key];
                }
            }

            await existingUses.save()
            return handleResponse(200, "Form Update successfully.", existingUses, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //add trash
    static AddTrash = async (req, resp) => {
        try {
            const user = req.user;
            const { id } = req.params;

            const use = await Form.findOne({ id: id })

            if (!use) {
                return handleResponse(404, "Form not found.", {}, resp)
            }

            if (use.deleted_at !== null) {
                return handleResponse(400, "Form already in trash.", {}, resp)
            }

            use.deleted_at = new Date()
            await use.save()
            return handleResponse(200, "Form successfully added to trash.", use, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }


    //restore trash
    static RestoreTrash = async (req, resp) => {
        try {
            const user = req.user;
            const { id } = req.params;

            const use = await Form.findOne({ id: id })

            if (!use) {
                return handleResponse(404, "Form not found.", {}, resp)
            }

            if (use.deleted_at === null) {
                return handleResponse(400, "Form already restored.", {}, resp)
            }

            use.deleted_at = null;
            await use.save()
            return handleResponse(200, "Form successfully restored.", use, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //get-all-trash
    static GetUsesTrash = async (req, resp) => {
        try {
            const allUses = await Form.find().sort({ createdAt: - 1 })
            if (!allUses) {
                return handleResponse(404, "No uses found.", {}, resp)
            }

            const filteredUses = allUses.filter((item) => item.deleted_at !== null)
            if (filteredUses.length < 0) {
                return handleResponse(200, "No uses available in trash.", {}, resp)
            }

            for (const key of filteredUses) {
                if (key.created_by) {
                    const userData = await User.findOne({ id: key.created_by })
                    key.created_by = userData
                }
            }

            return handleResponse(200, "Form trash fetched successsfully", filteredUses, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    // delete 
    static DeleteTrash = async (req, resp) => {
        try {
            const user = req.user;
            const { id } = req.params;

            const use = await Form.findOne({ id: id })
            if (!use) {
                return handleResponse(404, "use not found.", {}, resp)
            }

            if (use.deleted_at === null) {
                return handleResponse(400, "Add this use to trash for deleting it.", {}, resp)
            }
            await Form.findOneAndDelete({ id: id })
            return handleResponse(200, "Form deleted successfully.", {}, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }
}



export default FormController