// types/index.ts
export interface DiplomaBook {
  id: string;
  bookNumber: number; // Số vào sổ
  year: number;
  createdAt: Date;
}

export interface GraduationDecision {
  id: string;
  decisionNumber: string; // Số QĐ
  issueDate: Date;
  excerpt: string; // Trích yếu
  diplomaBookId: string;
}

export interface TemplateField {
  id: string;
  name: string;
  dataType: 'String' | 'Number' | 'Date';
  controlType: string;
}

export interface DiplomaInfo {
  id: string;
  entryNumber: number; // Số vào sổ (tự động tăng)
  diplomaNumber: string; // Số hiệu văn bằng
  studentId: string; // Mã sinh viên
  fullName: string; // Họ tên
  dateOfBirth: Date; // Ngày sinh
  decisionId: string;
  // Dynamic fields từ template
  additionalFields?: Record<string, any>;
}

export interface SearchParams {
  diplomaNumber?: string;
  entryNumber?: number;
  studentId?: string;
  fullName?: string;
  dateOfBirth?: Date;
}
