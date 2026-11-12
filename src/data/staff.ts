import type { BranchId } from "@/types/roles";

export interface StaffMember {
  id: string;
  name: string;
  nic: string;
  dateOfBirth: string;
  role: string;
  branch: BranchId | "all";
  mobile: string;
  email?: string;
  dailyRate: number;
  joinedDate: string;
}

export interface AttendanceRecord {
  staffId: string;
  date: string;
  timeIn: string;
  timeOut?: string;
}

const WORKING_DAYS = 26;

export { WORKING_DAYS };

export const staffMembers: StaffMember[] = [
  /* ── Owner ─────────────────────────────────────────────────── */
  { id: "EMP-001", name: "Yohan Dissanayake", nic: "198512304567", dateOfBirth: "1985-05-10", role: "Owner", branch: "all", mobile: "0771234500", email: "yohan@medizone.lk", dailyRate: 5000, joinedDate: "2018-03-01" },

  /* ── Senior Pharmacist Assistants (1 per branch) ───────────── */
  { id: "EMP-002", name: "Kasun Perera", nic: "199034567890", dateOfBirth: "1990-07-14", role: "Senior Pharmacist Assistant", branch: "b1", mobile: "0771234501", email: "kasun@medizone.lk", dailyRate: 3200, joinedDate: "2020-06-15" },
  { id: "EMP-003", name: "Nadeesha Silva", nic: "199245678901", dateOfBirth: "1992-03-22", role: "Senior Pharmacist Assistant", branch: "b2", mobile: "0712458801", dailyRate: 3200, joinedDate: "2021-01-10" },
  { id: "EMP-004", name: "Amal Fernando", nic: "198856789012", dateOfBirth: "1988-11-05", role: "Senior Pharmacist Assistant", branch: "b3", mobile: "0763341201", dailyRate: 3200, joinedDate: "2019-09-20" },
  { id: "EMP-005", name: "Dilani Jayasinghe", nic: "199167890123", dateOfBirth: "1991-01-30", role: "Senior Pharmacist Assistant", branch: "b4", mobile: "0754459001", email: "dilani@medizone.lk", dailyRate: 3200, joinedDate: "2020-11-01" },
  { id: "EMP-006", name: "Ruwan Bandara", nic: "198978901234", dateOfBirth: "1989-08-18", role: "Senior Pharmacist Assistant", branch: "b5", mobile: "0778901101", dailyRate: 3200, joinedDate: "2021-04-05" },

  /* ── Pharmacist Assistants / Cashiers (2 per branch) ───────── */
  // Miriswaththa (b1)
  { id: "EMP-007", name: "Sachini Kumari", nic: "199889012345", dateOfBirth: "1998-04-12", role: "Pharmacist Assistant", branch: "b1", mobile: "0716673401", dailyRate: 2400, joinedDate: "2022-02-14" },
  { id: "EMP-008", name: "Tharindu Senanayake", nic: "199790123456", dateOfBirth: "1997-09-25", role: "Pharmacist Assistant", branch: "b1", mobile: "0762917701", dailyRate: 2400, joinedDate: "2022-05-01" },
  // Piliyandala (b2)
  { id: "EMP-009", name: "Imesha Peris", nic: "199901234567", dateOfBirth: "1999-06-08", role: "Pharmacist Assistant", branch: "b2", mobile: "0758123001", dailyRate: 2400, joinedDate: "2022-08-20" },
  { id: "EMP-010", name: "Chamod Lakshan", nic: "200012345678", dateOfBirth: "2000-12-02", role: "Pharmacist Assistant", branch: "b2", mobile: "0775632801", dailyRate: 2400, joinedDate: "2023-01-15" },
  // Kesbewa (b3)
  { id: "EMP-011", name: "Ayesha Madushani", nic: "200123456789", dateOfBirth: "2001-02-17", role: "Pharmacist Assistant", branch: "b3", mobile: "0719094401", dailyRate: 2400, joinedDate: "2023-03-10" },
  { id: "EMP-012", name: "Dinesh Wijeratne", nic: "199634567890", dateOfBirth: "1996-10-22", role: "Pharmacist Assistant", branch: "b3", mobile: "0767216601", dailyRate: 2400, joinedDate: "2022-07-01" },
  // Moratuwa (b4)
  { id: "EMP-013", name: "Sanduni Herath", nic: "199945678901", dateOfBirth: "1999-05-14", role: "Pharmacist Assistant", branch: "b4", mobile: "0753381901", dailyRate: 2400, joinedDate: "2023-06-01" },
  { id: "EMP-014", name: "Nuwan Pradeep", nic: "199756789012", dateOfBirth: "1997-03-28", role: "Pharmacist Assistant", branch: "b4", mobile: "0714562301", dailyRate: 2400, joinedDate: "2022-04-18" },
  // Thalawathugoda (b5)
  { id: "EMP-015", name: "Kavindi Ranasinghe", nic: "200067890123", dateOfBirth: "2000-08-06", role: "Pharmacist Assistant", branch: "b5", mobile: "0729871201", dailyRate: 2400, joinedDate: "2023-09-12" },
  { id: "EMP-016", name: "Lahiru Gamage", nic: "199878901234", dateOfBirth: "1998-11-19", role: "Pharmacist Assistant", branch: "b5", mobile: "0761234501", dailyRate: 2400, joinedDate: "2022-10-05" },

  /* ── Purchasing Manager (1 for all branches) ───────────────── */
  { id: "EMP-017", name: "Chaminda Rathnayake", nic: "198789012345", dateOfBirth: "1987-06-25", role: "Purchasing Manager", branch: "all", mobile: "0773456701", email: "chaminda@medizone.lk", dailyRate: 3500, joinedDate: "2019-02-01" },

  /* ── Accounts (2 for all branches) ─────────────────────────── */
  { id: "EMP-018", name: "Harshani Wickramasinghe", nic: "199390123456", dateOfBirth: "1993-04-11", role: "Accounts Officer", branch: "all", mobile: "0718765401", email: "harshani@medizone.lk", dailyRate: 2800, joinedDate: "2020-08-15" },
  { id: "EMP-019", name: "Isuru Weerasinghe", nic: "199501234567", dateOfBirth: "1995-09-03", role: "Accounts Officer", branch: "all", mobile: "0756789001", dailyRate: 2800, joinedDate: "2021-11-20" },
];

const ABSENT_MAP: Record<string, number[]> = {
  "EMP-002": [5, 18],
  "EMP-003": [10, 13],
  "EMP-004": [21],
  "EMP-005": [1],
  "EMP-006": [7, 14],
  "EMP-007": [12, 25],
  "EMP-008": [3, 16],
  "EMP-009": [9],
  "EMP-010": [4, 22],
  "EMP-011": [6, 20],
  "EMP-012": [2, 15],
  "EMP-013": [8, 19],
  "EMP-014": [11],
  "EMP-015": [17, 23],
  "EMP-016": [3, 26],
  "EMP-017": [14],
  "EMP-018": [9, 24],
  "EMP-019": [6],
};

export { ABSENT_MAP };

function generateAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];

  for (const staff of staffMembers) {
    const absentDays = ABSENT_MAP[staff.id] ?? [];

    for (let day = 1; day <= WORKING_DAYS; day++) {
      if (absentDays.includes(day)) continue;

      const idx = staffMembers.indexOf(staff);
      const seed = idx * 31 + day;
      const hIn = 7 + (seed % 2);
      const mIn = (seed * 7) % 60;
      const hOut = 16 + ((seed + 3) % 2);
      const mOut = (seed * 13) % 60;

      records.push({
        staffId: staff.id,
        date: `2026-11-${String(day).padStart(2, "0")}`,
        timeIn: `${String(hIn).padStart(2, "0")}:${String(mIn).padStart(2, "0")}`,
        timeOut: `${String(hOut).padStart(2, "0")}:${String(mOut).padStart(2, "0")}`,
      });
    }
  }
  return records;
}

export const attendanceRecords: AttendanceRecord[] = generateAttendance();

export function daysPresent(staffId: string, month: string): number {
  return attendanceRecords.filter(
    (r) => r.staffId === staffId && r.date.startsWith(month) && r.timeIn && r.timeOut,
  ).length;
}

export function grossPay(dailyRate: number, present: number): number {
  return dailyRate * present;
}

export const STAFF_ROLES = [
  "Owner",
  "Senior Pharmacist Assistant",
  "Pharmacist Assistant",
  "Purchasing Manager",
  "Accounts Officer",
];
