# Demo accounts

Demo accounts for the IS 3610 Medizone Pharmacy prototype.

- Passwords are stored in plain text on purpose. This is a prototype, **not real security**.
- Everyone (owner, staff and customers) uses the same **Sign in** page at `/login`. The account decides the role and what you can open.
- You can sign in with the **mobile number, email, username or staff id**. Sign-in is not case-sensitive.
- New customers can create their own account at `/register`. Only the owner creates staff accounts.

This file is generated from `src/data/auth.ts` and the access rules in `src/types/roles.ts`. If you change those, regenerate or update this file. 

## Staff

| Name | Job title | Role id | Branch | Username | Email | Staff id | Password | Can open |
|---|---|---|---|---|---|---|---|---|
| Mr. Yohan | Owner | `owner` | All branches | `yohan` | yohan@medizone.lk | `MZ-001` | `Owner@2026` | All 9 modules (Dashboard, Inventory, Prescriptions, Customers, Suppliers, Delivery & warranty, Billing, Staff & payroll, Reports) |
| Nimali Perera | Senior pharmacist assistant | `senior_pharmacist` | Branch 1 | `senior.b1` | nimali@medizone.lk | `MZ-011` | `Senior@2026` | All 9 modules (Dashboard, Inventory, Prescriptions, Customers, Suppliers, Delivery & warranty, Billing, Staff & payroll, Reports) |
| Kasun Fernando | Senior pharmacist assistant | `senior_pharmacist` | Branch 2 | `senior.b2` | kasun@medizone.lk | `MZ-012` | `Senior@2026` | All 9 modules (Dashboard, Inventory, Prescriptions, Customers, Suppliers, Delivery & warranty, Billing, Staff & payroll, Reports) |
| Dilini Jayasinghe | Senior pharmacist assistant | `senior_pharmacist` | Branch 3 | `senior.b3` | dilini@medizone.lk | `MZ-013` | `Senior@2026` | All 9 modules (Dashboard, Inventory, Prescriptions, Customers, Suppliers, Delivery & warranty, Billing, Staff & payroll, Reports) |
| Ruwan Silva | Senior pharmacist assistant | `senior_pharmacist` | Branch 4 | `senior.b4` | ruwan@medizone.lk | `MZ-014` | `Senior@2026` | All 9 modules (Dashboard, Inventory, Prescriptions, Customers, Suppliers, Delivery & warranty, Billing, Staff & payroll, Reports) |
| Tharindu Wickramasinghe | Pharmacist assistant | `pharmacist_assistant` | Branch 1 | `assistant.b1` | tharindu@medizone.lk | `MZ-021` | `Assist@2026` | Prescriptions, Customers, Delivery & warranty, Billing |
| Sanduni Rathnayake | Pharmacist assistant | `pharmacist_assistant` | Branch 2 | `assistant.b2` | sanduni@medizone.lk | `MZ-022` | `Assist@2026` | Prescriptions, Customers, Delivery & warranty, Billing |
| Hasini Gunawardena | Trainee pharmacist assistant | `pharmacist_assistant` | Branch 3 | `trainee.b3` | hasini@medizone.lk | `MZ-031` | `Trainee@2026` | Prescriptions, Customers, Delivery & warranty, Billing |
| Chamara Bandara | Purchasing manager | `purchasing_manager` | All branches | `purchasing` | chamara@medizone.lk | `MZ-041` | `Purchase@2026` | Inventory, Suppliers |
| Ishara Dissanayake | Accountant clerk | `accountant` | All branches | `accounts` | ishara@medizone.lk | `MZ-051` | `Accounts@2026` | Billing, Staff & payroll, Reports |
| Mahesh Kumara | Part-time accountant | `accountant` | All branches | `accounts.pt` | mahesh@medizone.lk | `MZ-052` | `PartTime@2026` | Billing, Staff & payroll, Reports |

Every signed-in user can also open `/home` and `/profile`.

## Customers

| Name | Type | Branch | Mobile | Email | Customer id | Password |
|---|---|---|---|---|---|---|
| Anura Senanayake | Regular, 5% | Branch 1 | `0771234567` (077 123 4567) | anura@example.com | `c1` | `Customer@123` |
| Priyanka Herath | Regular, 3% | Branch 2 | `0712345678` (071 234 5678) | priyanka@example.com | `c2` | `Customer@123` |
| Fathima Rizna | New | Branch 1 | `0759876543` (075 987 6543) | fathima@example.com | `c3` | `Customer@123` |

Customers see the customer view of `/home` (shopping, cart, offers and profile). Module 5 reuses the customer ids `c1` to `c3`.
Customers who register at `/register` get ids from `c101` upwards and are stored in the browser only.
