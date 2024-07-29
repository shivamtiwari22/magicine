import handleResponse from "../../config/http-response.js";
import Country from "../../src/models/adminModel/CountryModel.js";
import ShippingCountry from "../../src/models/adminModel/ShippingCountryModel.js";
import ShippingRate from "../../src/models/adminModel/ShippingRateModel.js";
import ShippingZone from "../../src/models/adminModel/ShippingZoneModel.js";
import Carrier from "../../src/models/adminModel/CarrierModel.js";
import { response } from "express";

class ShippingController {
  static AddZone = async (req, res) => {
    try {
      const user_obj_id = req.user._id;
      const { name, status, country_id } = req.body;

      if (name && country_id) {
        const countryId = await Country.find({
          id: {
            $in: country_id,
          },
        });

        for (const country of countryId) {
          const shippingCountry = await ShippingCountry.findOne({ country_name: country.name });

          if (shippingCountry) {
            return handleResponse(409, `${country.name} is already added in a zone.`, {}, res);
          }
        }
        const zone = await ShippingZone.create({
          name: name,
          status: status,
          created_by: user_obj_id,
        });

        let shippingCountries = [];
        for (const country of countryId) {
          const shipping_country = {
            country_name: country.name,
            states: country.states,
            zone: zone._id,
            country_id: country._id,
            created_by: user_obj_id,
            total_states: country.states.length,
            avl_states: country.states.length,
          };

          shippingCountries.push(shipping_country);
        }

        await ShippingCountry.insertMany(shippingCountries);
        handleResponse(201, "Zone Created Successfully", zone, res);
      } else {
        handleResponse(400, "Name & Country is required", {}, res);
      }
    } catch (e) {
      handleResponse(500, e.message, {}, res);
    }
  };


  static GetZones = async (req, res) => {
    try {
      const user_id = req.user._id;

      const zones = await ShippingZone.find({ created_by: user_id })
        .sort({ id: -1 });

      const zonesWithCountries = await Promise.all(
        zones.map(async (zone) => {
          const countries = await ShippingCountry.find({
            zone: zone._id,
          })
            .populate("country_id");

          const countriesWithStates = countries.map((country) => ({
            ...country,
            country_id: {
              states: country.country_id.states,
              id: country.country_id.id,
            },
          }));

          const rates = await ShippingRate.find({
            zone_id: zone._id,
          });
          for (const key of rates) {
            const Rates = await Carrier.findOne({ id: key.carrier_id });
            key.carrier_id = Rates;
          }
          return {
            ...zone,
            countries: countriesWithStates,
            rates,
          };
        })
      );

      handleResponse(200, "Zone fetch successfully", zonesWithCountries, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static deleteZoneById = async (req, res) => {
    try {
      const { id } = req.params;
      const zone = await ShippingZone.findOne({ id });
      if (!zone) {
        return handleResponse(404, "Zone not found.", {}, res);
      }

      await zone.deleteOne();
      handleResponse(200, "Zone deleted successfully", {}, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updateZoneById = async (req, res) => {
    try {
      const { id } = req.params;

      const { name, status, country_id } = req.body;
      if (name && country_id) {
        const zone = await ShippingZone.findOne({ id });
        if (!zone) {
          return handleResponse(404, "Zone not found.", {}, res);
        }


        await ShippingCountry.deleteMany({ zone: zone._id });

        const countryId = await Country.find({
          id: {
            $in: country_id,
          },
        });

        for (const country of countryId) {
          const existingCountry = await ShippingCountry.findOne({ country_name: country.name, _id: { $ne: country._id } })
          if (existingCountry) {
            return handleResponse(409, `${country.name} already added to zone.`, {}, res)
          }

          zone.name = name;
          zone.status = status;
          zone.save();


          const shipping_country = await ShippingCountry.create({
            country_name: country.name,
            states: country.states,
            zone: zone._id,
            country_id: country._id,
            created_by: req.user._id,
            total_states: country.states.length,
            avl_states: country.states.length,
          });
        }
        handleResponse(201, "Zone Updated Successfully", zone, res);
      } else {
        handleResponse(400, "Name & Country is required", {}, res);
      }
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static deleteZoneCountryById = async (req, res) => {
    try {
      const { id } = req.params;
      const zone = await ShippingCountry.findOne({ id });
      if (!zone) {
        return handleResponse(404, "Shipping Country not found.", {}, res);
      }

      await zone.deleteOne();
      handleResponse(200, "Country deleted successfully", {}, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updateCountryById = async (req, res) => {
    try {
      const { id } = req.params;

      const { states } = req.body;
      if (states) {
        const zone = await ShippingCountry.findOne({ id });
        if (!zone) {
          return handleResponse(404, "Shipping Country not found.", {}, res);
        }

        zone.states = states;
        zone.avl_states = states.length;
        zone.save();

        handleResponse(201, "Zone Updated Successfully", zone, res);
      } else {
        handleResponse(400, "States is required", {}, res);
      }
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  // Shipping_Rate Functions

  static AddRate = async (req, res) => {
    try {
      const {
        name,
        delivery_takes,
        mini_order,
        max_order,
        rate,
        free_shipping,
        zone_id,
        carrier_id,
      } = req.body;

      if (name && zone_id) {
        const rates = await ShippingRate.create({
          name: name,
          delivery_takes: delivery_takes,
          mini_order: mini_order,
          max_order: max_order,
          rate: rate,
          free_shipping: free_shipping,
          zone_id: zone_id,
          carrier_id: carrier_id,
          created_by: req.user._id,
        });

        handleResponse(201, "Rate Created Successfully", rates, res);
      } else {
        handleResponse(400, "Name & Zone id is required", {}, res);
      }
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
          res
        );
      } else {
        return handleResponse(500, err.message, {}, res);
      }
    }
  };

  static deleteRateById = async (req, res) => {
    try {
      const { id } = req.params;
      const zone = await ShippingRate.findOne({ id });
      if (!zone) {
        return handleResponse(404, "Rate not found.", {}, res);
      }

      await zone.deleteOne();
      handleResponse(200, "Rate deleted successfully", {}, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updateRateById = async (req, res) => {
    try {
      const { id } = req.params;

      const {
        name,
        delivery_takes,
        mini_order,
        max_order,
        rate,
        free_shipping,
        zone_id,
        carrier_id,
      } = req.body;

      if (name) {
        const rates = await ShippingRate.findOne({ id });
        if (!rates) {
          return handleResponse(404, "Rate not found.", {}, res);
        }
        (rates.name = name),
          (rates.delivery_takes = delivery_takes),
          (rates.mini_order = mini_order),
          (rates.max_order = max_order),
          (rates.rate = rate),
          (rates.free_shipping = free_shipping),
          (rates.carrier_id = carrier_id),
          rates.save();

        handleResponse(200, "Rate Updated Successfully", rates, res);
      } else {
        handleResponse(400, "Name & Zone id is required", {}, res);
      }
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
          res
        );
      } else {
        return handleResponse(500, err.message, {}, res);
      }
    }
  };

  static GetCountryList = async (req, res) => {
    try {
      const countryList = await Country.find();
      handleResponse(200, "Country Get Successfully", countryList, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };
}

export default ShippingController;
