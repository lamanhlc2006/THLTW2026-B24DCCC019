import React, { useState } from 'react';
import { 
  Tabs, Table, Button, Form, Input, Select, 
  InputNumber, Modal, Space, Tag, message, Card, Row, Col 
} from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;

// --- 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPES) ---
interface KnowledgeBlock {
  id: string;
  name: string;
}

interface Subject {
  code: string;
  name: string;
  credits: number;
}

interface Question {
  id: string;
  subjectCode: string;
  content: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';
  blockId: string;
}

// --- DỮ LIỆU MẪU (MOCK DATA) ---
const initialBlocks: KnowledgeBlock[] = [
  { id: 'B1', name: 'Tổng quan' },
  { id: 'B2', name: 'Chuyên sâu' },
];

const initialSubjects: Subject[] = [
  { code: 'IT001', name: 'Cấu trúc dữ liệu', credits: 3 },
  { code: 'IT002', name: 'Cơ sở dữ liệu', credits: 3 },
];

const initialQuestions: Question[] = [
  { id: 'Q1', subjectCode: 'IT001', content: 'Thế nào là mảng?', difficulty: 'Dễ', blockId: 'B1' },
  { id: 'Q2', subjectCode: 'IT001', content: 'Trình bày thuật toán Quick Sort.', difficulty: 'Trung bình', blockId: 'B2' },
  { id: 'Q3', subjectCode: 'IT001', content: 'So sánh Array và Linked List.', difficulty: 'Trung bình', blockId: 'B1' },
  { id: 'Q4', subjectCode: 'IT002', content: 'Định nghĩa khoá chính.', difficulty: 'Dễ', blockId: 'B1' },
];

const App: React.FC = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [blocks, setBlocks] = useState<KnowledgeBlock[]>(initialBlocks);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  
  // State cho Modal tạo đề thi
  const [isExamModalVisible, setIsExamModalVisible] = useState(false);
  const [examForm] = Form.useForm();
  const [generatedExam, setGeneratedExam] = useState<Question[] | null>(null);

  // --- COMPONENT: 1. KHỐI KIẾN THỨC ---
  const BlockManagement = () => (
    <Card title="Quản lý Khối kiến thức">
      <Table 
        dataSource={blocks} 
        rowKey="id"
        columns={[
          { title: 'Mã khối', dataIndex: 'id', key: 'id' },
          { title: 'Tên khối kiến thức', dataIndex: 'name', key: 'name' },
        ]}
      />
    </Card>
  );

  // --- COMPONENT: 2. MÔN HỌC ---
  const SubjectManagement = () => (
    <Card title="Quản lý Môn học">
      <Table 
        dataSource={subjects} 
        rowKey="code"
        columns={[
          { title: 'Mã môn', dataIndex: 'code', key: 'code' },
          { title: 'Tên môn học', dataIndex: 'name', key: 'name' },
          { title: 'Số tín chỉ', dataIndex: 'credits', key: 'credits' },
        ]}
      />
    </Card>
  );

  // --- COMPONENT: 3. QUẢN LÝ CÂU HỎI ---
  const QuestionManagement = () => {
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(questions);

    const handleSearch = (values: any) => {
      let result = questions;
      if (values.subjectCode) result = result.filter(q => q.subjectCode === values.subjectCode);
      if (values.difficulty) result = result.filter(q => q.difficulty === values.difficulty);
      if (values.blockId) result = result.filter(q => q.blockId === values.blockId);
      setFilteredQuestions(result);
    };

    const columns = [
      { title: 'Mã CH', dataIndex: 'id', key: 'id' },
      { title: 'Nội dung', dataIndex: 'content', key: 'content' },
      { title: 'Môn học', dataIndex: 'subjectCode', key: 'subjectCode' },
      { 
        title: 'Độ khó', dataIndex: 'difficulty', key: 'difficulty',
        render: (text: string) => {
          let color = text === 'Dễ' ? 'green' : text === 'Trung bình' ? 'blue' : text === 'Khó' ? 'orange' : 'red';
          return <Tag color={color}>{text}</Tag>;
        }
      },
      { title: 'Khối kiến thức', dataIndex: 'blockId', key: 'blockId' },
    ];

    return (
      <Card title="Ngân hàng Câu hỏi tự luận">
        <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
          <Form.Item name="subjectCode">
            <Select placeholder="Chọn môn học" style={{ width: 150 }} allowClear>
              {subjects.map(s => <Option key={s.code} value={s.code}>{s.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="difficulty">
            <Select placeholder="Độ khó" style={{ width: 150 }} allowClear>
              <Option value="Dễ">Dễ</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Khó">Khó</Option>
              <Option value="Rất khó">Rất khó</Option>
            </Select>
          </Form.Item>
          <Form.Item name="blockId">
            <Select placeholder="Khối kiến thức" style={{ width: 150 }} allowClear>
              {blocks.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>Lọc</Button>
          </Form.Item>
        </Form>
        <Table dataSource={filteredQuestions} columns={columns} rowKey="id" />
      </Card>
    );
  };

  // --- COMPONENT: 4. QUẢN LÝ ĐỀ THI ---
  const ExamManagement = () => {
    
    // Hàm xử lý logic sinh đề thi dựa trên cấu trúc
    const handleGenerateExam = (values: any) => {
      const subject = values.subjectCode;
      const structure = values.structure || [];
      let newExam: Question[] = [];
      let hasError = false;

      // Kiểm tra từng tiêu chí trong cấu trúc
      structure.forEach((criteria: any) => {
        const availableQuestions = questions.filter(
          q => q.subjectCode === subject && 
               q.blockId === criteria.blockId && 
               q.difficulty === criteria.difficulty
        );

        if (availableQuestions.length < criteria.count) {
          message.error(`Lỗi: Không đủ câu hỏi cho khối ${criteria.blockId}, độ khó ${criteria.difficulty}. Yêu cầu: ${criteria.count}, Hiện có: ${availableQuestions.length}`);
          hasError = true;
          return;
        }

        // Lấy ngẫu nhiên câu hỏi (Mô phỏng)
        const selected = availableQuestions.sort(() => 0.5 - Math.random()).slice(0, criteria.count);
        newExam = [...newExam, ...selected];
      });

      if (!hasError) {
        setGeneratedExam(newExam);
        message.success('Đã tạo đề thi thành công!');
        setIsExamModalVisible(false);
      }
    };

    return (
      <Card title="Quản lý và Tạo Đề thi">
        <Button type="primary" onClick={() => setIsExamModalVisible(true)} style={{ marginBottom: 16 }}>
          + Tạo đề thi mới theo cấu trúc
        </Button>

        {generatedExam && (
          <Card type="inner" title="Đề thi vừa tạo (Chưa lưu)" extra={<Button type="primary">Lưu đề thi</Button>}>
            <ul>
              {generatedExam.map((q, index) => (
                <li key={q.id} style={{ marginBottom: 8 }}>
                  <strong>Câu {index + 1}:</strong> {q.content} 
                  <Tag style={{ marginLeft: 8 }}>{q.difficulty}</Tag>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Modal 
          title="Tạo cấu trúc đề thi" 
          visible={isExamModalVisible} /* Antd v4 sử dụng 'visible' thay vì 'open' */
          onCancel={() => setIsExamModalVisible(false)}
          footer={null}
          width={700}
        >
          <Form form={examForm} onFinish={handleGenerateExam} layout="vertical">
            <Form.Item name="subjectCode" label="Chọn môn học" rules={[{ required: true }]}>
              <Select placeholder="Chọn môn học">
                {subjects.map(s => <Option key={s.code} value={s.code}>{s.name}</Option>)}
              </Select>
            </Form.Item>

            {/* Dynamic Form List cho cấu trúc (Dynamic Fields) */}
            <Form.List name="structure">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Row key={key} gutter={10} style={{ marginBottom: 8 }} align="middle">
                      <Col span={8}>
                        {/* Antd v4 form.list cần truyền thêm fieldKey nếu có */}
                        <Form.Item 
                          {...restField} 
                          name={[name, 'blockId']} 
                          fieldKey={fieldKey ? [fieldKey, 'blockId'] : undefined}
                          rules={[{ required: true, message: 'Chọn khối KT' }]} 
                          style={{ margin: 0 }}
                        >
                          <Select placeholder="Khối kiến thức">
                            {blocks.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item 
                          {...restField} 
                          name={[name, 'difficulty']} 
                          fieldKey={fieldKey ? [fieldKey, 'difficulty'] : undefined}
                          rules={[{ required: true, message: 'Chọn độ khó' }]} 
                          style={{ margin: 0 }}
                        >
                          <Select placeholder="Độ khó">
                            <Option value="Dễ">Dễ</Option>
                            <Option value="Trung bình">Trung bình</Option>
                            <Option value="Khó">Khó</Option>
                            <Option value="Rất khó">Rất khó</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item 
                          {...restField} 
                          name={[name, 'count']} 
                          fieldKey={fieldKey ? [fieldKey, 'count'] : undefined}
                          rules={[{ required: true, message: 'Nhập SL' }]} 
                          style={{ margin: 0 }}
                        >
                          <InputNumber placeholder="Số lượng" min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm tiêu chí (Cấu trúc)
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">Sinh đề thi tự động</Button>
                <Button onClick={() => message.info('Đã lưu cấu trúc đề thi để dùng lại sau!')}>Lưu cấu trúc này</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    );
  };

  // --- RENDER MAIN LAYOUT TABS (Chuẩn Antd v4) ---
  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>HỆ THỐNG QUẢN LÝ NGÂN HÀNG CÂU HỎI & ĐỀ THI</h2>
      <Tabs defaultActiveKey="4" type="card">
        <TabPane tab="1. Khối kiến thức" key="1">
          <BlockManagement />
        </TabPane>
        <TabPane tab="2. Môn học" key="2">
          <SubjectManagement />
        </TabPane>
        <TabPane tab="3. Ngân hàng Câu hỏi" key="3">
          <QuestionManagement />
        </TabPane>
        <TabPane tab="4. Quản lý Đề thi" key="4">
          <ExamManagement />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;