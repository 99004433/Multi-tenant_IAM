export function computeDepth(allOrgs, org) {
  let depth = 0;
  let currentParentId = org.parentOrgId;
  const lookup = new Map(allOrgs.map(o => [o.orgId, o]));
  while (currentParentId) {
    const parent = lookup.get(currentParentId);
    if (!parent) break;
    depth += 1;
    currentParentId = parent.parentOrgId;
    if (depth > 1000) break; // safety
  }
  return depth;
}

// get children of a parent
export function childrenOf(allOrgs, parentId) {
  return allOrgs.filter(o => o.parentOrgId === parentId);
}
