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

            const mediaData = req.body;
            const files = req.files;
            const base_url = `${req.protocol}://${req.get("host")}/api`;

            const newMedia = new Media({
                ...mediaData,
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
            console.log("jjj", id);

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
    static UpdateMedia = async (req, resp) => {
        try {
            const user = req.user;
            if (!user) {
                return handleResponse(401, "Unauthorized User", {}, resp)
            }

            const { id } = req.params;
            const mediaData = req.body;
            const files = req.files;
            const base_url = `${req.protocol}://${req.get("host")}/api`;

            const existingMedia = await Media.findOne({ id: id })

            if (!existingMedia) {
                return handleResponse(404, "Media Not found", {}, resp)
            }


            for (const key in mediaData) {
                if (Object.hasOwnProperty.call(mediaData, key)) {
                    existingMedia[key] = mediaData[key]
                }
            }

            if (existingMedia && existingMedia.image) {
                existingMedia.image = `${base_url}/${files.image[0].path.replace(
                    /\\/g,
                    "/"
                )}`;
            }

            await existingMedia.save()
            return handleResponse(200, "Media Updated Successfully", existingMedia, resp)


        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }
}

export default MediaController