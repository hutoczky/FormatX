package hu.formatx.suite;

final class PriceCatalog {
    static final Plan[] PLANS = new Plan[] {
            new Plan("business_lite", "Business Lite", 15900, 139300, 44, 383, 19900, 199000, 55, 547),
            new Plan("business_pro", "Business Pro", 39900, 349300, 110, 961, 49900, 499000, 137, 1373),
            new Plan("technician_team", "Technician Team", 79900, 699300, 220, 1924, 99900, 999000, 275, 2748)
    };

    private PriceCatalog() { }

    static final class Plan {
        final String id;
        final String name;
        final long monthlyHuf;
        final long annualHuf;
        final long monthlyEur;
        final long annualEur;
        final long regularMonthlyHuf;
        final long regularAnnualHuf;
        final long regularMonthlyEur;
        final long regularAnnualEur;

        Plan(String id, String name, long monthlyHuf, long annualHuf, long monthlyEur, long annualEur,
             long regularMonthlyHuf, long regularAnnualHuf, long regularMonthlyEur, long regularAnnualEur) {
            this.id = id;
            this.name = name;
            this.monthlyHuf = monthlyHuf;
            this.annualHuf = annualHuf;
            this.monthlyEur = monthlyEur;
            this.annualEur = annualEur;
            this.regularMonthlyHuf = regularMonthlyHuf;
            this.regularAnnualHuf = regularAnnualHuf;
            this.regularMonthlyEur = regularMonthlyEur;
            this.regularAnnualEur = regularAnnualEur;
        }

        long price(boolean annual, boolean eur) {
            if (eur) return annual ? annualEur : monthlyEur;
            return annual ? annualHuf : monthlyHuf;
        }

        long original(boolean annual, boolean eur) {
            if (eur) return annual ? regularAnnualEur : regularMonthlyEur;
            return annual ? regularAnnualHuf : regularMonthlyHuf;
        }
    }
}
