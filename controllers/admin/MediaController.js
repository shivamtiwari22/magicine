import Media from "../../src/models/adminModel/MediaLink.js";
import handleResponse from "../../config/http-response.js";
import { response } from "express";


class MediaController {
    // add 
    static AddMedia = async (req, resp) => {
        try {
            const user = req.user;
            if (!user) {
                return handleResponse(401, "Unauthorized user", {}, resp)
            }

            // const mediaData = req.body;
            const files = req.files;
            const base_url = `${req.protocol}://${req.get("host")}/api`;

            const newMedia = new Media({
                created_by: user.id
            })

            if (files) {
                if (files.image) {
                    newMedia.image = `${base_url}/${files.image[0].path.replace(
                        /\\/g,
                        "/"
                    )}`
                }
            }

            await newMedia.save()
            return handleResponse(201, "Media Saved Successfully", newMedia, resp)

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
                console.log("error", err);
                return handleResponse(500, err.message, {}, resp);
            }
        }
    }

    //get media
    static GetAllMedia = async (req, resp) => {
        try {
            const user = req.user;
            if (!user) {
                return handleResponse(401, "Unauthorized user", {}, resp)
            }

            const allMedia = await Media.find().sort({ createdAt: -1 });

            if (!allMedia) {
                return handleResponse(404, "Media not found", {}, resp)
            }

            const filteredData = allMedia.filter((item) => item.deleted_at === null)
            if (filteredData.length === 0) {
                return handleResponse(200, "No Media found", {}, resp)
            }
            return handleResponse(200, "Media Fetched Successfully", filteredData, resp)
        }
        catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //get single media
    static GetSingleMedia = async (req, resp) => {
        try {
            const user = req.user;
            if (!user) {
                return handleResponse(401, "Unauthorized user", {}, resp)
            }

            const { id } = req.params;

            const mediaData = await Media.findOne({ id: id })

            if (!mediaData) {
                return handleResponse(404, "Error fetching Media", {}, resp)
            }
            return handleResponse(200, "Media Fetched Successsfully", mediaData, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //update media
    // static UpdateMedia = async (req, resp) => {
    //     try {
    //         const user = req.user;
    //         if (!user) {
    //             return handleResponse(401, "Unauthorized User", {}, resp);
    //         }

    //         const { id } = req.params;
    //         // const mediaData = req.body;
    //         const files = req.files;
    //         const base_url = `${req.protocol}://${req.get("host")}/api`;

    //         const existingMedia = await Media.findOne({ id: id });

    //         if (!existingMedia) {
    //             return handleResponse(404, "Media Not found", {}, resp);
    //         }

    //         // for (const key in mediaData) {
    //         //     if (Object.hasOwnProperty.call(mediaData, key)) {
    //         //         existingMedia[key] = mediaData[key];
    //         //     }
    //         // }

    //         if (files && files.image && files.image.length > 0) {
    //             existingMedia.image = `${base_url}/${files.image.path.replace(/\\/g, "/")}`
    //         }

    //         await existingMedia.save();
    //         return handleResponse(200, "Media Updated Successfully", existingMedia, resp);
    //     } catch (err) {
    //         console.log("err", err);
    //         return handleResponse(500, err.message, {}, resp);
    //     }
    // }

    //add tash 
    // static AddTrash = async (req, resp) => {
    //     try {
    //         const user = req.user;
    //         if (!user) {
    //             return handleResponse(401, "Unauthorized User", {}, resp)
    //         }
    //         const { id } = req.params;

    //         const media = await Media.findOne({ id: id })
    //         if (!media) {
    //             return handleResponse(404, "Media Not Found", {}, resp)
    //         }

    //         if (media.deleted_at !== null) {
    //             return handleResponse(400, "This media already added to trash.", {}, resp)
    //         }

    //         media.deleted_at = new Date()
    //         const trashedMedia = await media.save()
    //         return handleResponse(200, "Media Successfully added to trash.", trashedMedia, resp)

    //     } catch (err) {
    //         console.log(err);
    //         return handleResponse(500, err.message, {}, resp)
    //     }
    // }

    //restore tash 
    // static RestoreTrash = async (req, resp) => {
    //     try {
    //         const user = req.user;
    //         if (!user) {
    //             return handleResponse(401, "Unauthorized User", {}, resp)
    //         }
    //         const { id } = req.params;

    //         const media = await Media.findOne({ id: id })
    //         if (!media) {
    //             return handleResponse(404, "Media Not Found", {}, resp)
    //         }

    //         if (media.deleted_at === null) {
    //             return handleResponse(400, "This media already restored.", {}, resp)
    //         }

    //         media.deleted_at = null
    //         const trashedMedia = await media.save()
    //         return handleResponse(200, "Media Successfully restored.", trashedMedia, resp)

    //     } catch (err) {
    //         console.log(err);
    //         return handleResponse(500, err.message, {}, resp)
    //     }
    // }

    // get trash
    // static GetTrashMedia = async (req, resp) => {
    //     try {
    //         const user = req.user;
    //         if (!user) {
    //             return handleResponse(401, "Unauthorized User", {}, resp)
    //         }
    //         const media = await Media.find().sort({ createdAt: -1 })
    //         if (!media) {
    //             return handleResponse(404, "Error Fetching Media")
    //         }

    //         const filterMedia = media.filter((item) => item.deleted_at !== null)
    //         if (filterMedia.length == 0) {
    //             return handleResponse(200, "No media available in trash.", {}, resp)
    //         }
    //         return handleResponse(200, "Media trash fetched successfully.", {}, resp)

    //     } catch (err) {
    //         return handleResponse(500, err.message, {}, resp)
    //     }
    // }

    //delete 
    static DeleteMedia = async (req, resp) => {
        try {
            const user = req.user;
            if (!user) {
                return handleResponse(401, "unauthorized User", {}, resp)
            }
            const { id } = req.params;
            const media = await Media.findOne({ id: id })
            if (!media) {
                return handleResponse(400, "Media Not found", {}, resp)
            }

            await Media.findOneAndDelete({ id: id })
            return handleResponse(200, "Media Deleted Successfully.", {}, resp)
        } catch (err) {
            console.log(err);
            return handleResponse(500, err.message, {}, resp)
        }
    }
}

export default MediaController