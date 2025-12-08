// import React from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Box,
//   Button,
//   CircularProgress,
// } from "@mui/material";

// import AutoCompleteSearch from "./AutoCompleteSearch"; // <-- IMPORTANT: add this import

// export default function OrgDialog({
//   open,
//   form,
//   submitting,
//   onClose,
//   onChange,
//   onSubmit,
//   parentName,
// }) {

//   // Handler triggered when a location is selected
//   const handleLocationSelect = (loc) => {
//     if (!loc) return;

//     // Autofill all fields using your existing onChange()
//     const apply = (name, value) => {
//       onChange({ target: { name, value } });
//     };

//     apply("address", loc.address || "");
//     apply("city", loc.city || "");
//     apply("state", loc.state || "");
//     apply("country", loc.country || "");
//     apply("zipcode", loc.zipcode || "");
//     apply("region", loc.region || "");
//   };

//   return (
//     <DialogContent sx={{ maxHeight: "100vh", overflow: "auto" }}>
//     <Dialog open={open} fullWidth maxWidth="md" onClose={onClose}>
//       <DialogTitle fontWeight={700}>
//         {form.orgId
//           ? "Edit Organization"
//           : parentName
//           ? `Add Child to ${parentName}`
//           : "Add Parent Organization"}
//       </DialogTitle>

//       <form onSubmit={onSubmit}>
//         <DialogContent>

//           {/*AutoComplete Search box */}
//           <Box sx={{ mb: 2 }}>
//             <AutoCompleteSearch onSelect={handleLocationSelect} />
//           </Box>

//           <Box
//             sx={{
//               display: "grid",
//               gap: 2,
//               gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
//             }}
//           >
//             <TextField
//               label="Name"
//               name="name"
//               value={form.name}
//               onChange={onChange}
//               required
//             />

//             <TextField
//               label="Address"
//               name="address"
//               value={form.address}
//               onChange={onChange}
//               required
//             />

//             <TextField
//               label="City"
//               name="city"
//               value={form.city}
//               onChange={onChange}
//             />

//             <TextField
//               label="State"
//               name="state"
//               value={form.state}
//               onChange={onChange}
//             />

//             <TextField
//               label="Country"
//               name="country"
//               value={form.country}
//               onChange={onChange}
//             />

//             <TextField
//               label="Zipcode"
//               name="zipcode"
//               value={form.zipcode}
//               onChange={onChange}
//             />

//             <TextField
//               select
//               name="status"
//               value={form.status}
//               label="Status"
//               onChange={onChange}
//             >
//               <MenuItem value="active">Active</MenuItem>
//               <MenuItem value="inactive">Inactive</MenuItem>
//             </TextField>

//             <TextField
//               label="Region"
//               name="region"
//               value={form.region}
//               onChange={onChange}
//             />
//           </Box>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={onClose}>Cancel</Button>
//           <Button type="submit" variant="contained" disabled={submitting}>
//             {submitting ? <CircularProgress size={18} /> : "Save"}
//           </Button>
//         </DialogActions>
//       </form>
//     </Dialog>
//     </DialogContent>

//   );
// }

// OrgDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";

import AutoCompleteSearch from "./AutoCompleteSearch";

export default function OrgDialog({
  open,
  form,
  submitting,
  onClose,
  onChange,
  onSubmit,
  parentName,
}) {
  // Handler triggered when a location is selected
  const handleLocationSelect = (loc) => {
    if (!loc) return;

    // Autofill all fields using your existing onChange()
    const apply = (name, value) => {
      onChange({ target: { name, value } });
    };

    apply("address", loc.address || "");
    apply("city", loc.city || "");
    apply("state", loc.state || "");
    apply("country", loc.country || "");
    apply("zipcode", loc.zipcode || "");
    apply("region", loc.region || "");
  };

  const title = form?.orgId
    ? "Edit Organization"
    : parentName
    ? `Add Child to ${parentName}`
    : "Add Parent Organization";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false} // remove cap so it can truly go full width
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "none",
          height: "85vh", // tall dialog to allow internal scrolling
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }} fontWeight={700}>
        {title}
      </DialogTitle>

      {/* Make form a flex child of dialog sections without extra wrapper */}
      <form onSubmit={onSubmit} style={{ display: "contents" }}>
        <DialogContent
          sx={{
            p: 2,            // reduce default padding; use p: 0 for edge-to-edge
            flex: 1,         // fill vertical space
            overflow: "hidden", // inner box handles scroll
          }}
        >
          {/* AutoComplete Search box */}
          <Box sx={{ mb: 2 }}>
            <AutoCompleteSearch onSelect={handleLocationSelect} />
          </Box>

          {/* Scrollable content area */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <TextField
                label="Name"
                name="name"
                value={form.name || ""}
                onChange={onChange}
                required
              />

              <TextField
                label="Address"
                name="address"
                value={form.address || ""}
                onChange={onChange}
                required
              />

              <TextField
                label="City"
                name="city"
                value={form.city || ""}
                onChange={onChange}
              />

              <TextField
                label="State"
                name="state"
                value={form.state || ""}
                onChange={onChange}
              />

              <TextField
                label="Country"
                name="country"
                value={form.country || ""}
                onChange={onChange}
              />

              <TextField
                label="Zipcode"
                name="zipcode"
                value={form.zipcode || ""}
                onChange={onChange}
              />

              <TextField
                select
                name="status"
                value={form.status || "active"}
                label="Status"
                onChange={onChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>

              <TextField
                label="Region"
                name="region"
                value={form.region || ""}
                onChange={onChange}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={18} /> : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
