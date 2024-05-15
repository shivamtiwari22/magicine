import Coupons from "../../src/models/adminModel/CouponsModel.js";
import handleResponse from "../../config/http-response.js";

class CouponsController {
  //add coupon
  static AddCoupons = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const couponData = req.body;

      const newCoupon = new Coupons({
        ...couponData,
        created_by: user.id,
      });

      await newCoupon.save();
      return handleResponse(
        200,
        "Coupon added successfully.",
        { newCoupon },
        resp
      );
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
  };

  // get coupon
  static GetCoupon = async (req, resp) => {
    try {
      const coupons = await Coupons.find().sort({
        createdAt: -1,
      });
      const availableCoupon = coupons.filter(
        (coupons) => coupons.delete_at == null
      );

      return handleResponse(
        200,
        "Coupon fetched successfully",
        { availableCoupon },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // get coupon id
  static GetCouponID = async (req, resp) => {
    try {
      const { id } = req.params;
      const coupons = await Coupons.findOnr({ id }).sort({
        createdAt: -1,
      });

      if (!coupons) {
        return handleResponse(404, "Coupon not found.", {}, resp);
      }
      return handleResponse(
        200,
        "Coupon fetched successfully",
        { availableCoupon },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //update coupon
  static UpdateCoupon = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const couponData = req.body;

      const coupon = await Coupons.findOne({ id });
      if (!coupon) {
        return handleResponse(404, "Coupon not found.", {}, resp);
      }

      for (const key in couponData) {
        if (Object.hasOwnProperty.call(couponData, key)) {
          coupon[key] = couponData[key];
        }
      }

      await coupon.save();
      return handleResponse(
        200,
        "Coupon updated successfully",
        { coupon },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // delete coupon
  static DeleteCoupon = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const coupon = await Coupons.findOne({ id });

      if (!coupon) {
        return handleResponse(404, "Coupon not found.", {}, resp);
      }
      if (coupon.delete_at !== null) {
        await Coupons.findOneAndDelete({ id });
        return handleResponse(
          200,
          "Coupon deleted successfully.",
          { coupon },
          resp
        );
      } else {
        return handleResponse(
          400,
          "For deleting this coupon you have to first add it to trash..",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // soft delete
  static SoftDelete = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const coupon = await Coupons.findOneAndUpdate({
        id,
        delete_at: Date.now(),
      });

      if (!coupon) {
        return handleResponse(404, "Coupon not found.", {}, resp);
      }

      await coupon.save();
      const newCoupon = coupon;
      return handleResponse(
        200,
        "Coupon successfully added to trash.",
        { newCoupon },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get soft delete
  static GetSoftDelete = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const coupon = await Coupons.find();

      const trashCoupon = coupon.filter((coupon) => coupon.delete_at !== null);

      return handleResponse(
        200,
        "Coupon fetched successfully.",
        { trashCoupon },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // restore coupon
  static RestoreSoftDelete = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const restoreCoupon = await Coupons.findOneAndUpdate({
        id,
        delete_at: null,
      });
      if (!restoreCoupon) {
        return handleResponse(404, "Coupon not found.", {}, resp);
      }

      await restoreCoupon.save();
      return handleResponse(
        200,
        "Coupon restored successfully.",
        { restoreCoupon },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default CouponsController;
