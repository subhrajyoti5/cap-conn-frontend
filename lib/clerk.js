export const getRoleFromSearchParams = (searchParams) => {
  const role = searchParams?.get("role");
  return role === "TRAINER" ? "TRAINER" : "TRAINEE";
};
