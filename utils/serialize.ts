export const serializeUser = <
  T extends {
    supplierBenefitAmount: { toString(): string };
    supplierBenefitAmountCDF: { toString(): string };
  },
>(
  user: T,
) => {
  return {
    ...user,
    supplierBenefitAmount: Number(user.supplierBenefitAmount),
    supplierBenefitAmountCDF: Number(user.supplierBenefitAmountCDF),
  };
};
