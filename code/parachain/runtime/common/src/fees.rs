use frame_support::weights::{constants::ExtrinsicBaseWeight, WeightToFeePolynomial, WeightToFeeCoefficients, WeightToFeeCoefficient, WeightToFee};
use primitives::currency::CurrencyId;
use sp_runtime::Perbill;
use crate::Balance;

pub struct WeightToFeeConverter;
impl WeightToFeePolynomial for WeightToFeeConverter {
	type Balance = Balance;
	fn polynomial() -> WeightToFeeCoefficients<Self::Balance> {
		let p = CurrencyId::milli::<Balance>();
		let q = 10 * Balance::from(ExtrinsicBaseWeight::get());
		smallvec::smallvec![WeightToFeeCoefficient {
			degree: 1,
			negative: false,
			coeff_frac: Perbill::from_rational(p % q, q),
			coeff_integer: p / q,
		}]
	}
}


#[cfg(test)]
mod commons_sence {

	#[test]
	fn reasonable_fee() {
		let x = WeightToFee::weight_to_fee(42);
	}

}
