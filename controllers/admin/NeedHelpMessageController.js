import NeedHelpMessage from "../../src/models/adminModel/NeedHelpMessageModel.js"
import handleResponse from "../../config/http-response.js";
import NeedHelp from "../../src/models/adminModel/NeedHelp.js";
import Order from "../../src/models/adminModel/OrderModel.js";
import OrderItem from "../../src/models/adminModel/OrderItemModel.js";
import User from "../../src/models/adminModel/AdminModel.js";




class NeedHelpMessageController {
    static sendMessage = async (req, resp) => {
        try {
            const user = req.user;
            if (!user) {
                return handleResponse(401, "Unauthorized User.", {}, resp)
            }
            const messageData = req.body;



            const disputeData = await NeedHelp.findOne({ orderId: messageData.orderId })

            if (disputeData.status == "closed") {
                return handleResponse(400, "Dispute is already closed.", {}, resp)
            }

            if (!messageData.message) {
                return handleResponse(400, "Message Field is required.", {}, resp)
            }

            const newMessage = new NeedHelpMessage({
                ...messageData,
                created_by: user.id,
                userType: "admin"
            })

            await newMessage.save()
            return handleResponse(200, "Message Send Successfully.", newMessage, resp)
        } catch (err) {
            console.log("error", err);

            return handleResponse(500, err.message, {}, resp)
        }
    }

    static GetAllMessages = async (req, resp) => {
        try {
            const user = req.user;
            if (!user) {
                return handleResponse(401, "Unauthorized User", {}, resp);
            }

            const { id } = req.params;

            const dispute = await NeedHelp.findOne({ id: id });
            if (!dispute) {
                return handleResponse(404, "Dispute not found.", {}, resp);
            }

            const AllMessages = [];

            if (dispute.orderId && dispute.id) {
                const messageData = await NeedHelpMessage.find({ orderId: dispute.orderId, disputeId: dispute.id });
                AllMessages.push(...messageData);
            }

            const AllOrderItems = [];

            const orderDetail = await Order.findOne({ order_number: dispute.orderId });
            if (orderDetail) {
                const orderItem = await OrderItem.find({ order_id: orderDetail.id });
                AllOrderItems.push(...orderItem);
                orderDetail.items = AllOrderItems;
            }

            if (AllMessages.length > 1 && dispute.status === "open") {
                dispute.status = "pending";
                await dispute.save();
            }

            const disputeData = dispute.toObject();
            disputeData.disputeMessage = AllMessages;
            disputeData.orderData = orderDetail;

            if (dispute && dispute.created_by) {
                const customerData = await User.findOne({ id: dispute.created_by },
                    "id name email phone profile_pic"
                );
                const profile_picture = `${req.protocol}://${req.get("host")}/${customerData.profile_pic}`
                if (customerData) {
                    disputeData.created_by = customerData;
                    disputeData.created_by.profile_pic = profile_picture
                }
            }

            return handleResponse(200, "Data fetched successfully.", disputeData, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }



}


export default NeedHelpMessageController