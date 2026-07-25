package hu.formatx.suite;

final class PriceCatalog {
    static final Plan[] PLANS = new Plan[] {
            new Plan("business_lite", "Business Lite", 7900, 79000, 22, 220, 9900, 99000, 27, 270),
            new Plan("business_pro", "Business Pro", 15900, 159000, 44, 440, 19900, 199000, 55, 550),
            new Plan("technician_team", "Technician Team", 29900, 299000, 83, 830, 39900, 399000, 110, 1100)
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
