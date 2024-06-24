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

      const images = req.files?.images;

      const getUser = await User.findOne({ id: reviewData.customer });
      if (!getUser) {
        return handleResponse(404, "User not found", {}, resp);
      }

      let product;
      if (reviewData.modelType === "Product") {
        product = await Product.findOne({ id: reviewData.product });
        if (!product) {
          return handleResponse(404, "Product not found", {}, resp);
        }
      } else if (reviewData.modelType === "Medicine") {
        product = await Medicine.findOne({ id: reviewData.product });
        if (!product) {
          return handleResponse(404, "Medicine not found", {}, resp);
        }
      } else if (reviewData.modelType === "Equipment") {
        product = await Sergical_Equipment.findOne({ id: reviewData.product });
        if (!product) {
          return handleResponse(404, "Surgical Equipment not found", {}, resp);
        }
      } else {
        return handleResponse(400, "Invalid modelType", {}, resp);
      }

      const getUserRole = await Roles.findOne({ user_id: getUser.id });
      if (getUserRole.name !== "User") {
        return handleResponse(
          401,
          "Only Customers are allowed to give reviews.",
          {},
          resp
        );
      }
      const existingReview = await Review.findOne({
        customer: reviewData.customer,
        product: reviewData.product,
        modelType: reviewData.modelType,
      });

      if (existingReview) {
        return handleResponse(
          400,
          "You have already reviewed this item.",
          {},
          resp
        );
      }

      const newReview = new Review({
        ...reviewData,
        // created_by: user.id,
      });

      const base_url = `${req.protocol}://${req.get("host")}/api`;

      if (images && images.length > 0) {
        newReview.image = `${base_url}/${images[0].path.replace(/\\/g, "/")}`;
      }

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
      const { modelType, productId } = req.params;

      const reviews = await Review.find({
        modelType: modelType,
        product: productId,
      });

      if (reviews.length === 0) {
        return handleResponse(200, "No Reviews available.", {}, resp);
      }

      for (const key of reviews) {
        if (key.customer) {
          const user = await User.findOne({ id: key.customer });
          key.customer = user;
        }
      }

      let productData;
      if (modelType === "Product") {
        productData = await Product.findOne({ id: productId });
      } else if (modelType === "Medicine") {
        productData = await Medicine.findOne({ id: productId });
      } else if (modelType === "Equipment") {
        productData = await Sergical_Equipment.findOne({ id: productId });
      } else {
        return handleResponse(400, "Invalid modelType", {}, resp);
      }

      if (!productData) {
        return handleResponse(404, "Product not found", {}, resp);
      }

      const totalRating = reviews.reduce(
        (total, item) => total + item.star_rating,
        0
      );

      const reviewData = {
        productId: productData.id,
        productName: productData.product_name,
        review: reviews,
        totalReviews: reviews.length,
        averageStarRating: totalRating / reviews.length,
      };

      return handleResponse(
        200,
        "Reviews fetched successfully",
        reviewData,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static GetReviewsProduct = async (req, resp) => {
    try {
      const reviews = await Review.find().sort({ createdAt: -1 });
      if (!reviews || reviews.length === 0) {
        return handleResponse(200, "No reviews available.", {}, resp);
      }

      const uniqueProductReviewsMap = {};

      for (const review of reviews) {
        const key = `${review.modelType}-${review.product}`;

        if (!uniqueProductReviewsMap[key]) {
          const allReviewsProduct = await Review.find({
            modelType: review.modelType,
            product: review.product,
          })
            .sort({ createdAt: -1 })
            .limit(1);

          let productData;
          let customerData;
          for (const review of allReviewsProduct) {
            if (review.modelType === "Product") {
              const product = await Product.findOne({ id: review.product });
              productData = product;
            }
            if (review.modelType === "Medicine") {
              const product = await Medicine.findOne({ id: review.product });
              productData = product;
            }
            if (review.modelType === "Equipment") {
              const product = await Sergical_Equipment.findOne({
                id: review.product,
              });
              productData = product;
            }

            const customer = await User.findOne({ id: review.customer });
            customerData = customer;

            const getcustomer = await User.findOne({ id: review.created_by });
            review.created_by = getcustomer;
          }

          if (allReviewsProduct.length > 0) {
            uniqueProductReviewsMap[key] = {
              modelType: productData.type,
              productId: productData.id,
              productName: productData.product_name,
              customerId: customerData.id,
              customerName: customerData.name,
              reviewId: allReviewsProduct[0].id,
              ReviewText: allReviewsProduct[0].text_content,
              submittedOn: allReviewsProduct[0].createdAt,
              status: allReviewsProduct[0].status,
              totalStars: 0,
              totalReviews: 0,
            };
          }
        }

        if (uniqueProductReviewsMap[key]) {
          uniqueProductReviewsMap[key].totalStars += review.star_rating;
          uniqueProductReviewsMap[key].totalReviews++;
        }
      }

      for (const key in uniqueProductReviewsMap) {
        const totalReviews = uniqueProductReviewsMap[key].totalReviews;
        const totalStars = uniqueProductReviewsMap[key].totalStars;
        const averageStarRating = totalStars / totalReviews;

        uniqueProductReviewsMap[key].averageStarRating = averageStarRating;
      }

      return handleResponse(
        200,
        "Reviews fetched successfully.",
        { newReview: Object.values(uniqueProductReviewsMap) },
        resp
      );
    } catch (err) {
      console.log("error", err);
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

      if (reviews.product) {
        const productData = await Product.findOne({ id: reviews.product });
        reviews.product = productData;
      }
      if (reviews.customer) {
        const customerData = await User.findOne({ id: reviews.customer });
        reviews.customer = customerData;
      }

      const reviewData = [];
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

  //update review
  static UpdateReview = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const { ...reviewData } = req.body;
      const images = req.files?.images;
      const review = await Review.findOne({ id });
      if (!review) {
        return handleResponse(404, "Review not found", {}, resp);
      }

      for (const key in reviewData) {
        if (Object.hasOwnProperty.call(reviewData, key)) {
          review[key] = reviewData[key];
        }
      }

      const base_url = `${req.protocol}://${req.get("host")}/api`;
      if (images && images.length > 0) {
        review.image = `${base_url}/${images[0].path.replace(/\\/g, "/")}`;
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

  //delete review
  // static DeleteReview = async (req, resp) => {
  //   try {
  //     const user = req.user;
  //     if (!user) {
  //       return handleResponse(401, "User not found", {}, resp);
  //     }

  //     const { id } = req.params;

  //     const review = await Review.findOne({ id });
  //     if (!review) {
  //       return handleResponse(404, "Review not found", {}, resp);
  //     }

  //     if (review.deleted_at !== null) {
  //       await Review.findOneAndDelete({ id });
  //       return handleResponse(200, "Review deleted successfully", {}, resp);
  //     } else {
  //       return handleResponse(
  //         400,
  //         "For deleting this review you have to this review to trash first. ",
  //         {},
  //         resp
  //       );
  //     }
  //   } catch (err) {
  //     return handleResponse(500, err.message, {}, resp);
  //   }
  // };

  //get soft delete review
  // static GetSoftDelete = async (req, resp) => {
  //   try {
  //     const user = req.user;

  //     if (!user) {
  //       return handleResponse(401, "User not found", {}, resp);
  //     }

  //     const reviews = await Review.find();
  //     const softDeletedReviews = reviews.filter(
  //       (review) => review.deleted_at !== null
  //     );

  //     if (softDeletedReviews.length > 0) {
  //       return handleResponse(
  //         200,
  //         "Review trash fetched successfully",
  //         { reviews: softDeletedReviews },
  //         resp
  //       );
  //     } else {
  //       return handleResponse(404, "No review data found in trash.", {}, resp);
  //     }
  //   } catch (err) {
  //     return handleResponse(500, err.message, {}, resp);
  //   }
  // };

  //soft delete
  // static SoftDelete = async (req, resp) => {
  //   try {
  //     const user = req.user;

  //     if (!user) {
  //       return handleResponse(401, "User not found", {}, resp);
  //     }

  //     const { id } = req.params;

  //     const review = await Review.findOne({ id });
  //     if (!review) {
  //       return handleResponse(404, "Review not found", {}, resp);
  //     }
  //     if (review.deleted_at !== null) {
  //       return handleResponse(400, "Review already added to trash.", {}, resp);
  //     }

  //     const softDeleted = await Review.findOneAndUpdate(
  //       { id },
  //       { deleted_at: new Date() }
  //     );
  //     return handleResponse(
  //       200,
  //       "Review deleted successfully",
  //       { softDeleted },
  //       resp
  //     );
  //   } catch (err) {
  //     return handleResponse(500, err.message, {}, resp);
  //   }
  // };

  // restore review
  // static RestoreReview = async (req, resp) => {
  //   try {
  //     const user = req.user;
  //     if (!user) {
  //       return handleResponse(401, "User not found", {}, resp);
  //     }

  //     const { id } = req.params;
  //     const review = await Review.findOne({ id });

  //     if (!review) {
  //       return handleResponse(404, "Review not found", {}, resp);
  //     }

  //     if (review.deleted_at === null) {
  //       return handleResponse(400, "Review already restored", {}, resp);
  //     }

  //     const softDeleted = await Review.findOneAndUpdate(
  //       { id },
  //       { deleted_at: null }
  //     );
  //     return handleResponse(
  //       200,
  //       "Review restored successfully",
  //       { softDeleted },
  //       resp
  //     );
  //   } catch (err) {
  //     return handleResponse(500, err.message, {}, resp);
  //   }
  // };

  // status true
  static ReviewStatusTrue = async (req, resp) => {
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

      if (review.status !== "" && review.status !== "inactive") {
        return handleResponse(422, "This review is already accepted", {}, resp);
      }

      const softDeleted = await Review.findOneAndUpdate(
        { id },
        { status: "active" },
        { new: true }
      );
      return handleResponse(
        200,
        "Review accepted successfully",
        softDeleted,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // status true
  static ReviewStatusFalse = async (req, resp) => {
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

      if (review.status !== "" && review.status !== "active") {
        return handleResponse(422, "This review is already rejected", {}, resp);
      }

      const softDeleted = await Review.findOneAndUpdate(
        { id },
        { status: "inactive" },
        { new: true }
      );
      return handleResponse(
        200,
        "Review accepted successfully",
        softDeleted,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get medicine product and equipment
  static GetproductMedicineEquipment = async (req, resp) => {
    try {
      const products = await Product.find().lean(); // Use lean() for better performance if not modifying data
      const medicines = await Medicine.find().lean();
      const equipment = await Sergical_Equipment.find().lean();

      const combined = [...products, ...medicines, ...equipment];

      return handleResponse(
        200,
        "Medicine, product, and equipment fetched successfully",
        combined,
        resp
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      return handleResponse(
        500,
        err.message || "Internal Server Error",
        {},
        resp
      );
    }
  };
}

export default ReviewController;
