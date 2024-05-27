import handleResponse from "../../config/http-response.js";
import Country from "../../src/models/adminModel/CountryModel.js";
import ShippingCountry from "../../src/models/adminModel/ShippingCountryModel.js";
import ShippingZone from "../../src/models/adminModel/ShippingZoneModel.js";

class ShippingController {
  static AddZone = async (req, res) => {
    try {
      const user_obj_id = req.user._id;
      const { name, status, country_id } = req.body;

      if (name && country_id) {
        const zone = await ShippingZone.create({
          name: name,
          status: status,
          created_by: user_obj_id,
        });

        const countryId = await Country.find({
          id: {
            $in: country_id,
          },
        });

        for (const country of countryId) {
          const shipping_country = await ShippingCountry.create({
            country_name: country.name,
            states: country.states,
            zone: zone._id,
            country_id: country._id,
            created_by: user_obj_id,
          });
        }
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

      const zones = await ShippingZone.find({ created_by: user_id }).lean().sort({ id: -1 });

      // For each zone, find the associated countries and add them to the zone object
      const zonesWithCountries = await Promise.all(
        zones.map(async (zone) => {
          const countries = await ShippingCountry.find({
            zone: zone._id,
          }).lean();
          return {
            ...zone,
            countries,
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
        zone.name = name;
        zone.status = status;
        zone.save();

     

        await ShippingCountry.deleteMany({ zone: zone._id });

        const countryId = await Country.find({
          id: {
            $in: country_id,
          },
        });

        for (const country of countryId) {
          const shipping_country = await ShippingCountry.create({
            country_name: country.name,
            states: country.states,
            zone: zone._id,
            country_id: country._id,
            created_by: req.user._id,
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
}

export default ShippingController;
