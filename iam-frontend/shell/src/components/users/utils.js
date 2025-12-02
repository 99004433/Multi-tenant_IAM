
// src/components/users/utils.js

// Validation helpers
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const trimAll = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));

export const validateForm = (formData, setFormErrors) => {
  const data = trimAll(formData);
  const errors = {};

  if (!data.firstName) errors.firstName = "Required";
  if (!data.lastName) errors.lastName = "Required";

  if (!data.email) errors.email = "Email required";
  else if (!EMAIL_REGEX.test(data.email)) errors.email = "Invalid email";

  if (!data.organization) errors.organization = "Required";
  if (!data.groupName) errors.groupName = "Required";
  if (!data.role) errors.role = "Required";

  if (!data.contactNo) errors.contactNo = "Contact required";
  else if (!/^\+?[0-9]{7,15}$/.test(data.contactNo)) errors.contactNo = "Invalid phone";

  if (!data.userId) {
    if (!data.password) errors.password = "Password required";
    else if (data.password.length < 6) errors.password = "Min 6 chars";
  } else if (data.password && data.password.length < 6) {
    errors.password = "Min 6 chars";
  }

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

// CSV export
export const escapeCsv = (val) => {
  const s = (val ?? "").toString();
  const needsQuote = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
};

export const exportCSV = (rows, page) => {
  const header = ["User ID", "First Name", "Middle Name", "Last Name", "Email", "Group", "Role", "Contact No", "Status"];
  const lines = rows.map((r) =>
    [
      r.userId,
      r.firstName,
      r.middleName || "",
      r.lastName,
      r.email || "",
      r.groupName || "",
      r.role || "",
      r.contactNo || "",
      r.status || "",
    ].map(escapeCsv).join(",")
  );
  const csv = [header.map(escapeCsv).join(","), ...lines].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

// Roles based on selected group
export const computeFilteredRoles = (groupName, groups, roles) => {
  const gname = groupName;
  if (!gname) return [];
  const selectedGroup = groups.find(
    (g) =>
      g.name === gname ||
      g.groupName === gname ||
      g.groupId === gname ||
      g.id === gname
  );
  if (!selectedGroup) return [];
  const allowedRaw = selectedGroup.allowedRoleIds || selectedGroup.allowed_roles || [];
  const allowedIds = allowedRaw.map((x) => Number(x)).filter(Number.isFinite);
  if (!allowedIds.length) return [];
  return roles.filter((r) => allowedIds.includes(Number(r.roleId ?? r.id)));
};
