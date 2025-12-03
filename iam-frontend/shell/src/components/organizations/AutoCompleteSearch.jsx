import React, { useEffect, useState } from "react";

export default function AutoCompleteSearch({ onSelect }) {
  const [service, setService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState([]);

  // Initialize services
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setService(new window.google.maps.places.AutocompleteService());

        // Create dummy div for PlacesService
        const dummyDiv = document.createElement("div");
        setPlacesService(new window.google.maps.places.PlacesService(dummyDiv));

        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (!value || !service) {
      setPredictions([]);
      return;
    }

    service.getPlacePredictions({ input: value}, (res, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPredictions(res);
      } else {
        setPredictions([]);
      }
    });
  };

  const handleSelect = (prediction) => {
    setInputValue(prediction.description);
    setPredictions([]);

    if (placesService) {
      placesService.getDetails({ placeId: prediction.place_id }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // Extract structured address components
          const components = place.address_components;

          const getComponent = (type) => {
            const c = components.find((comp) => comp.types.includes(type));
            return c ? c.long_name : "";
          };

          const street = getComponent("route");
          const streetNumber = getComponent("street_number");
          const sublocality = getComponent("sublocality_level_1");
          const city = getComponent("locality") || getComponent("administrative_area_level_2");
          const state = getComponent("administrative_area_level_1");
          const country = getComponent("country");
          const zipcode = getComponent("postal_code");

          // Map state -> region (India example)
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

          const region = country === "India" ? indianRegions[state] || state : state || country;

          const addressData = {
            address: [streetNumber, street, sublocality].filter(Boolean).join(", "),
            city,
            state,
            country,
            zipcode,
            region,
            lat: place.geometry?.location.lat(),
            lng: place.geometry?.location.lng(),
          };

          if (onSelect) onSelect(addressData);
        }
      });
    }
  };

  return (
    <div style={{ width: "400px", position: "relative" }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Search location..."
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid gray",
        }}
      />

      {predictions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            width: "100%",
            background: "white",
            border: "1px solid #ddd",
            marginTop: "5px",
            borderRadius: "6px",
            listStyle: "none",
            padding: 0,
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 2000,
          }}
        >
          {predictions.map((p) => (
            <li
              key={p.place_id}
              onClick={() => handleSelect(p)}
              style={{ padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer" }}
            >
              {p.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
