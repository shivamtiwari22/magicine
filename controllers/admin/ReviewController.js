import Review from "../../src/models/adminModel/ReviewsModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Roles from "../../src/models/adminModel/RoleModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import Sergical_Equipment from "../../src/models/adminModel/SergicalEquipmentModedl.js";

class ReviewController {
  //add review
  static AddReview = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { ...reviewData } = req.body;

      const getUser = await User.findOne({ id: reviewData.customer });
      if (!customer) {
        return handleResponse(404, "User not found", {}, resp);
      }

      if (reviewData.modelType === "Product") {
        const product = await Product.findOne({ id: reviewData.product });
        if (!product) {
          return handleResponse(404, "Product not found", {}, resp);
        }
      }
      if (reviewData.modelType === "Medicine") {
        const product = await Medicine.findOne({ id: reviewData.product });
        if (!product) {
          return handleResponse(404, "Medicine not found", {}, resp);
        }
      }
      if (reviewData.modelType === "Equipment") {
        const product = await Sergical_Equipment.findOne({
          id: reviewData.product,
        });
        if (!product) {
          return handleResponse(404, "Surgical Equipment not found", {}, resp);
        }
      }

      const getUserRole = await Roles.findOne({ user_id: getUser.id });

      if (getUserRole.name !== "User") {
        return handleResponse(
          401,
          "Only Customers are allowed to givr review.",
          {},
          resp
        );
      }

      const newReview = Review({
        ...reviewData,
        created_by: User.id,
      });

      await newReview.save();
      return handleResponse(201, "Review added successfully", newReview, resp);
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

  //get review
  static GetReviews = async (req, resp) => {
    try {
      const reviews = await Review.find().sort({
        createdAt: -1,
      });
      const newReview = await reviews.filter(
        (reviews) => reviews.deleted_at === null
      );

      if (newReview.length == 0) {
        return handleResponse(200, "No Reviews available.", {}, resp);
      }
      return handleResponse(
        200,
        "Reviews fetched successfully",
        { newReview },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get review id
  static GetReviewsID = async (req, resp) => {
    try {
      const { id } = req.params;
      const reviews = await Review.findOne({ id }).sort({
        createdAt: -1,
      });
      if (!reviews) {
        return handleResponse(404, "Review not found", {}, resp);
      }

      return handleResponse(
        200,
        "Reviews fetched successfully",
        { reviews },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //delete review
  static DeleteReview = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const review = await Review.findOne({ id });
      if (!review) {
        return handleResponse(404, "Review not found", {}, resp);
      }

      if (review.deleted_at !== null) {
        await Review.findOneAndDelete({ id });
        return handleResponse(200, "Review deleted successfully", {}, resp);
      } else {
        return handleResponse(
          400,
          "For deleting this review you have to this review to trash first. ",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //update review
  static UpdateReview = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const reviewData = req.body;
      const review = await Review.findOne({ id });
      if (!review) {
        return handleResponse(404, "Review not found", {}, resp);
      }

      for (const key in reviewData) {
        if (Object.hasOwnProperty.call(reviewData, key)) {
          review[key] = reviewData[key];
        }
      }

      await review.save();

      return handleResponse(
        200,
        "Review updated successfully",
        { review },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get soft delete review
  static GetSoftDelete = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const reviews = await Review.find();
      const softDeletedReviews = reviews.filter(
        (review) => review.deleted_at !== null
      );

      if (softDeletedReviews.length > 0) {
        return handleResponse(
          200,
          "Review trash fetched successfully",
          { reviews: softDeletedReviews },
          resp
        );
      } else {
        return handleResponse(404, "No review data found in trash.", {}, resp);
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static SoftDelete = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const review = await Review.findOne({ id });
      if (!review) {
        return handleResponse(404, "Review not found", {}, resp);
      }
      if (review.deleted_at !== null) {
        return handleResponse(400, "Review already added to trash.", {}, resp);
      }

      const softDeleted = await Review.findOneAndUpdate(
        { id },
        { deleted_at: new Date() }
      );
      return handleResponse(
        200,
        "Review deleted successfully",
        { softDeleted },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //restore review
  static RestoreReview = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const review = await Review.findOne({ id });

      if (!review) {
        return handleResponse(404, "Review not found", {}, resp);
      }

      if (review.deleted_at === null) {
        return handleResponse(400, "Review already restored", {}, resp);
      }

      const softDeleted = await Review.findOneAndUpdate(
        { id },
        { deleted_at: null }
      );
      return handleResponse(
        200,
        "Review restored successfully",
        { softDeleted },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default ReviewController;
