import type { BranchId } from "@/types/roles";

export interface StaffMember {
  id: string;
  name: string;
  nic: string;
  dateOfBirth: string;
  role: string;
  branch: BranchId;
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
  { id: "EMP-001", name: "Kasun Perera", nic: "982345678V", dateOfBirth: "1998-01-12", role: "Pharmacist", branch: "b1", mobile: "0771234567", email: "kasun@example.com", dailyRate: 2200, joinedDate: "2024-01-12" },
  { id: "EMP-002", name: "Nadeesha Silva", nic: "973456789V", dateOfBirth: "1997-05-20", role: "Pharmacist", branch: "b3", mobile: "0712458890", dailyRate: 2000, joinedDate: "2024-01-12" },
  { id: "EMP-003", name: "Amal Fernando", nic: "951234567V", dateOfBirth: "1995-08-15", role: "Manager", branch: "b1", mobile: "0763341288", dailyRate: 2800, joinedDate: "2024-01-12" },
  { id: "EMP-004", name: "Dilani Jayasinghe", nic: "964567891V", dateOfBirth: "1996-03-02", role: "Pharmacist", branch: "b4", mobile: "0754459021", email: "dilani@example.com", dailyRate: 1700, joinedDate: "2024-01-12" },
  { id: "EMP-005", name: "Ruwan Bandara", nic: "007891234V", dateOfBirth: "2000-11-10", role: "Assistant", branch: "b3", mobile: "0778901123", dailyRate: 1600, joinedDate: "2024-01-12" },
  { id: "EMP-006", name: "Sachini Kumari", nic: "991234567V", dateOfBirth: "1999-07-25", role: "Cashier", branch: "b1", mobile: "0716673409", dailyRate: 1500, joinedDate: "2024-01-12" },
  { id: "EMP-007", name: "Tharindu Senanayake", nic: "985678901V", dateOfBirth: "1998-09-18", role: "Assistant", branch: "b5", mobile: "0762917745", dailyRate: 1400, joinedDate: "2024-01-12" },
  { id: "EMP-008", name: "Imesha Peris", nic: "974567891V", dateOfBirth: "1997-12-05", role: "Cashier", branch: "b4", mobile: "0758123099", dailyRate: 1300, joinedDate: "2024-01-12" },
  { id: "EMP-009", name: "Chamod Lakshan", nic: "003456789V", dateOfBirth: "2000-04-30", role: "Storekeeper", branch: "b1", mobile: "0775632810", dailyRate: 1200, joinedDate: "2024-01-12" },
  { id: "EMP-010", name: "Ayesha Maduranga", nic: "012345678V", dateOfBirth: "2001-06-14", role: "Assistant", branch: "b3", mobile: "0719094432", dailyRate: 1200, joinedDate: "2024-01-12" },
  { id: "EMP-011", name: "Dinesh Wijeratne", nic: "968901234V", dateOfBirth: "1996-10-22", role: "Driver", branch: "b1", mobile: "0767216605", dailyRate: 1100, joinedDate: "2024-01-12" },
  { id: "EMP-012", name: "Sanduni Herath", nic: "997654321V", dateOfBirth: "1999-02-08", role: "Cashier", branch: "b5", mobile: "0753381904", dailyRate: 1000, joinedDate: "2024-01-12" },
];

const ABSENT_MAP: Record<string, number[]> = {
  "EMP-001": [5, 18],
  "EMP-002": [10, 13],
  "EMP-003": [21],
  "EMP-004": [1],
  "EMP-005": [7, 14],
  "EMP-007": [12, 25],
  "EMP-008": [3, 16],
  "EMP-009": [9],
  "EMP-010": [4, 22],
  "EMP-011": [6, 20],
  "EMP-012": [2, 8, 11, 15, 17, 19, 23, 24, 26],
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
  "Pharmacist",
  "Manager",
  "Assistant",
  "Cashier",
  "Storekeeper",
  "Driver",
];
