# Expodia Flights seed policy

Seed data is development/test-only. It must never be treated as production inventory, fares, bookings, tickets, flight status, or provider confirmations.

Production environments must not run seed fixtures that create realistic-looking operational activity.

If sandbox fixtures are added later, every record must carry `source = SANDBOX` and the application must prevent sandbox records from entering a production provider path.
