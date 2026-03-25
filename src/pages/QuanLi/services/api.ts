// services/api.ts
import { DiplomaBook, GraduationDecision, TemplateField, DiplomaInfo, SearchParams } from '../types';

// Mock data
let diplomaBooks: DiplomaBook[] = [
  { id: '1', bookNumber: 1, year: 2024, createdAt: new Date() },
];

let decisions: GraduationDecision[] = [
  { id: '1', decisionNumber: 'QD-001/2024', issueDate: new Date(), excerpt: 'Quyết định tốt nghiệp đợt 1 năm 2024', diplomaBookId: '1' },
];

let templateFields: TemplateField[] = [
  { id: '1', name: 'Dân tộc', dataType: 'String', controlType: 'input' },
  { id: '2', name: 'Nơi sinh', dataType: 'String', controlType: 'input' },
  { id: '3', name: 'Điểm trung bình', dataType: 'Number', controlType: 'inputNumber' },
  { id: '4', name: 'Xếp hạng', dataType: 'String', controlType: 'select' },
  { id: '5', name: 'Hệ đào tạo', dataType: 'String', controlType: 'select' },
];

let diplomas: DiplomaInfo[] = [];
let currentEntryNumber = 0;

// API Functions
export const diplomaBookApi = {
  getAll: () => Promise.resolve([...diplomaBooks]),
  getByYear: (year: number) => Promise.resolve(diplomaBooks.filter(b => b.year === year)),
  create: (year: number): Promise<DiplomaBook> => {
    const existing = diplomaBooks.find(b => b.year === year);
    if (existing) return Promise.reject('Sổ văn bằng năm này đã tồn tại');
    
    const newBook: DiplomaBook = {
      id: Date.now().toString(),
      bookNumber: diplomaBooks.length + 1,
      year,
      createdAt: new Date(),
    };
    diplomaBooks.push(newBook);
    currentEntryNumber = 0; // Reset entry number for new book
    return Promise.resolve(newBook);
  },
};

export const decisionApi = {
  getAll: () => Promise.resolve([...decisions]),
  getByBookId: (bookId: string) => Promise.resolve(decisions.filter(d => d.diplomaBookId === bookId)),
  create: (data: Omit<GraduationDecision, 'id'>): Promise<GraduationDecision> => {
    const newDecision: GraduationDecision = { ...data, id: Date.now().toString() };
    decisions.push(newDecision);
    return Promise.resolve(newDecision);
  },
  update: (id: string, data: Partial<GraduationDecision>) => {
    const index = decisions.findIndex(d => d.id === id);
    if (index > -1) decisions[index] = { ...decisions[index], ...data };
    return Promise.resolve(decisions[index]);
  },
  delete: (id: string) => {
    decisions = decisions.filter(d => d.id !== id);
    return Promise.resolve(true);
  },
};

export const templateFieldApi = {
  getAll: () => Promise.resolve([...templateFields]),
  create: (data: Omit<TemplateField, 'id'>): Promise<TemplateField> => {
    const newField: TemplateField = { ...data, id: Date.now().toString() };
    templateFields.push(newField);
    return Promise.resolve(newField);
  },
  update: (id: string, data: Partial<TemplateField>) => {
    const index = templateFields.findIndex(f => f.id === id);
    if (index > -1) templateFields[index] = { ...templateFields[index], ...data };
    return Promise.resolve(templateFields[index]);
  },
  delete: (id: string) => {
    templateFields = templateFields.filter(f => f.id !== id);
    return Promise.resolve(true);
  },
};

export const diplomaApi = {
  getAll: () => Promise.resolve([...diplomas]),
  getByDecisionId: (decisionId: string) => Promise.resolve(diplomas.filter(d => d.decisionId === decisionId)),
  create: (data: Omit<DiplomaInfo, 'id' | 'entryNumber'>): Promise<DiplomaInfo> => {
    currentEntryNumber += 1;
    const newDiploma: DiplomaInfo = {
      ...data,
      id: Date.now().toString(),
      entryNumber: currentEntryNumber,
    };
    diplomas.push(newDiploma);
    return Promise.resolve(newDiploma);
  },
  update: (id: string, data: Partial<Omit<DiplomaInfo, 'entryNumber'>>) => {
    const index = diplomas.findIndex(d => d.id === id);
    if (index > -1) {
      diplomas[index] = { ...diplomas[index], ...data };
    }
    return Promise.resolve(diplomas[index]);
  },
  delete: (id: string) => {
    diplomas = diplomas.filter(d => d.id !== id);
    return Promise.resolve(true);
  },
  search: (params: SearchParams) => {
    let results = [...diplomas];
    if (params.diplomaNumber) {
      results = results.filter(d => d.diplomaNumber.includes(params.diplomaNumber!));
    }
    if (params.entryNumber) {
      results = results.filter(d => d.entryNumber === params.entryNumber);
    }
    if (params.studentId) {
      results = results.filter(d => d.studentId.includes(params.studentId!));
    }
    if (params.fullName) {
      results = results.filter(d => d.fullName.toLowerCase().includes(params.fullName!.toLowerCase()));
    }
    if (params.dateOfBirth) {
      results = results.filter(d => 
        new Date(d.dateOfBirth).toDateString() === new Date(params.dateOfBirth!).toDateString()
      );
    }
    return Promise.resolve(results);
  },
  getSearchCount: (decisionId: string) => {
    // Mock search count by decision
    return Promise.resolve(Math.floor(Math.random() * 100));
  },
};
