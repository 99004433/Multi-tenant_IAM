// src/components/organizations/AddressAutocomplete.jsx
import React, { useState, useRef } from "react";
import { Autocomplete, LoadScript } from "@react-google-maps/api";
import { TextField, Box, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const libraries = ["places"];

// Get API key from environment variables
// Create a .env file in the root of your project and add: VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export default function AddressAutocomplete({ onPlaceSelected, error, helperText }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const autocompleteRef = useRef(null);

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const getAddressComponent = (components, type) => {
    const component = components.find((c) => c.types.includes(type));
    return component ? component.long_name : "";
  };

  const getRegionFromState = (state, country) => {
    // Simple region mapping for India (you can expand this for other countries)
    const indianRegions = {
      Karnataka: "South India",
      "Tamil Nadu": "South India",
      Kerala: "South India",
      "Andhra Pradesh": "South India",
      Telangana: "South India",
      Maharashtra: "West India",
      Gujarat: "West India",
      Goa: "West India",
      "Uttar Pradesh": "North India",
      Delhi: "North India",
      Punjab: "North India",
      Haryana: "North India",
      "Himachal Pradesh": "North India",
      "West Bengal": "East India",
      Odisha: "East India",
      Bihar: "East India",
      Jharkhand: "East India",
    };

    if (country === "India" && indianRegions[state]) {
      return indianRegions[state];
    }

    // Default mapping for other countries
    return state || country;
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.address_components) {
        console.warn("No details available for input:", place.name);
        return;
      }

      const components = place.address_components;

      // Extract all address components
      const street = getAddressComponent(components, "route");
      const streetNumber = getAddressComponent(components, "street_number");
      const sublocality = getAddressComponent(components, "sublocality_level_1");
      const city =
        getAddressComponent(components, "locality") ||
        getAddressComponent(components, "administrative_area_level_2");
      const state = getAddressComponent(components, "administrative_area_level_1");
      const country = getAddressComponent(components, "country");
      const zipcode = getAddressComponent(components, "postal_code");

      // Build full address
      const addressParts = [streetNumber, street, sublocality].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : place.formatted_address;

      // Calculate region
      const region = getRegionFromState(state, country);

      // Prepare the location data
      const locationData = {
        address: fullAddress,
        city: city,
        state: state,
        country: country,
        zipcode: zipcode,
        region: region,
      };

      // Call the callback with extracted data
      if (onPlaceSelected) {
        onPlaceSelected(locationData);
      }

      // Update input value
      setInputValue(place.formatted_address);
    }
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <TextField
          fullWidth
          label="Search Address"
          placeholder="Start typing your address..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          error={error}
          helperText={helperText}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                <LocationOnIcon color="action" />
              </Box>
            ),
          }}
        />
      </Autocomplete>
    </LoadScript>
  );
}
