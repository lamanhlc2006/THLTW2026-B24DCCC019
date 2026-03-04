import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Table,
  Typography,
  Space,
  Progress,
  message,
  DatePicker,
} from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;

type StudySession = {
  id: string;
  date: string; // ISO string
  duration: number;
  content: string;
  note: string;
};

type Subject = {
  id: string;
  name: string;
  sessions: StudySession[];
  monthlyGoal: number;
};

const StudyManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  const [form] = Form.useForm();
  const [subjectForm] = Form.useForm();

  // Load localStorage
  useEffect(() => {
    const data = localStorage.getItem("subjects");
    if (data) setSubjects(JSON.parse(data));
  }, []);

  // Save localStorage
  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  // Thêm môn
  const addSubject = () => {
    const name = subjectName.trim();
    if (!name) return;

    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      sessions: [],
      monthlyGoal: 0,
    };

    setSubjects([...subjects, newSubject]);
    setSubjectName("");
    message.success("Thêm môn thành công!");
  };

  // Xóa môn
  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    message.success("Đã xóa môn!");
  };

  // Mở modal thêm buổi học (hoặc sửa)
  const openAddSession = (subjectId: string, session?: StudySession) => {
    setCurrentSubjectId(subjectId);
    setEditingSession(session || null);
    setIsModalOpen(true);
    if (session) {
      form.setFieldsValue({
        content: session.content,
        duration: session.duration,
        note: session.note,
        date: dayjs(session.date),
      });
    } else {
      // for new session, prefill date with now so user doesn't have
      // to click the picker unless they want to change it
      form.resetFields();
      form.setFieldsValue({ date: dayjs() });
    }
  };

  // Thêm hoặc sửa buổi học
  const handleAddSession = (values: any) => {
    if (!currentSubjectId) return;

    if (editingSession) {
      // update existing
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === currentSubjectId
            ? {
                ...s,
                sessions: s.sessions.map((ss) =>
                  ss.id === editingSession.id
                    ? {
                        ...ss,
                        date: values.date.toISOString(),
                        duration: values.duration,
                        content: values.content,
                        note: values.note || "",
                      }
                    : ss
                ),
              }
            : s
        )
      );
      message.success("Cập nhật buổi học thành công!");
    } else {
      const newSession: StudySession = {
        id: Date.now().toString(),
        date: values.date.toISOString(),
        duration: values.duration,
        content: values.content,
        note: values.note || "",
      };

      setSubjects((prev) =>
        prev.map((s) =>
          s.id === currentSubjectId
            ? { ...s, sessions: [...s.sessions, newSession] }
            : s
        )
      );
      message.success("Thêm buổi học thành công!");
    }

    setIsModalOpen(false);
    setEditingSession(null);
    form.resetFields();
  };

  // Đặt mục tiêu
  const setGoal = (subjectId: string, goal: number) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId ? { ...s, monthlyGoal: goal } : s
      )
    );
  };

  // Xóa buổi học
  const deleteSession = (subjectId: string, sessionId: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, sessions: s.sessions.filter((ss) => ss.id !== sessionId) }
          : s
      )
    );
    message.success("Đã xóa buổi học!");
  };

  // Sửa môn học
  const openEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setIsSubjectModalOpen(true);
    subjectForm.setFieldsValue({ name: subject.name });
  };

  const handleEditSubject = (values: any) => {
    if (!editingSubjectId) return;
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === editingSubjectId ? { ...s, name: values.name } : s
      )
    );
    message.success("Cập nhật môn học thành công!");
    setIsSubjectModalOpen(false);
    setEditingSubjectId(null);
    subjectForm.resetFields();
  };

  // Tính tổng phút tháng hiện tại
  const getMonthlyTotal = (sessions: StudySession[]) => {
    const now = new Date();
    return sessions
      .filter((s) => {
        const d = new Date(s.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, s) => sum + s.duration, 0);
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>📚 Quản Lý Tiến Độ Học Tập</Title>

      <Space style={{ marginBottom: 20 }}>
        <Input
          placeholder="Tên môn học"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />
        <Button type="primary" onClick={addSubject}>
          Thêm môn
        </Button>
      </Space>

      {subjects.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <Title level={4}>Tổng tháng</Title>
          <Text>
            Mục tiêu tổng: {subjects.reduce((sum, s) => sum + s.monthlyGoal, 0)}
            phút
          </Text>
          <br />
          <Text>
            Đã học:{" "}
            {subjects.reduce(
              (sum, s) => sum + getMonthlyTotal(s.sessions),
              0
            )}{" "}
            phút
          </Text>
          <Progress
            percent={
              subjects.length
                ? Math.min(
                    (subjects.reduce(
                      (sum, s) => sum + getMonthlyTotal(s.sessions),
                      0
                    ) /
                      (subjects.reduce((sum, s) => sum + s.monthlyGoal, 0) || 1)) *
                      100,
                    100
                  )
                : 0
            }
          />
        </Card>
      )}

      {subjects.map((subject) => {
        const monthlyTotal = getMonthlyTotal(subject.sessions);
        const percent =
          subject.monthlyGoal > 0
            ? Math.min((monthlyTotal / subject.monthlyGoal) * 100, 100)
            : 0;

        const columns = [
          { title: "Ngày giờ", dataIndex: "date", render: (text: string) => new Date(text).toLocaleString() },
          { title: "Nội dung", dataIndex: "content" },
          { title: "Thời lượng (phút)", dataIndex: "duration" },
          { title: "Ghi chú", dataIndex: "note" },
          {
            title: "Hành động",
            render: (_: any, record: StudySession) => (
              <Space>
                <Button size="small" onClick={() => openAddSession(subject.id, record)}>
                  Sửa
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => deleteSession(subject.id, record.id)}
                >
                  Xóa
                </Button>
              </Space>
            ),
          },
        ];

        return (
          <Card
            key={subject.id}
            title={subject.name}
            style={{ marginBottom: 20 }}
            extra={
              <Space>
                <Button onClick={() => openEditSubject(subject)}>Sửa</Button>
                <Button danger onClick={() => deleteSubject(subject.id)}>
                  Xóa môn
                </Button>
              </Space>
            }
          >
            <Text>Mục tiêu tháng: {subject.monthlyGoal} phút</Text>
            <br />
            <Text>Đã học: {monthlyTotal} phút</Text>

            <Progress percent={Math.round(percent)} />
            <Text type={percent >= 100 ? "success" : "secondary"}>
              {percent >= 100 ? "Đã đạt mục tiêu" : "Chưa đạt mục tiêu"}
            </Text>

            <Space style={{ marginTop: 10 }}>
              <Button onClick={() => openAddSession(subject.id)}>
                Thêm buổi học
              </Button>

              <InputNumber
                placeholder="Mục tiêu (phút)"
                min={0}
                onChange={(value) =>
                  setGoal(subject.id, Number(value))
                }
              />
            </Space>

            <Table
              columns={columns}
              dataSource={subject.sessions}
              rowKey="id"
              pagination={false}
              style={{ marginTop: 15 }}
            />
          </Card>
        );
      })}

      <Modal
        title={editingSession ? "Chỉnh sửa buổi học" : "Thêm buổi học"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingSession(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleAddSession}>
          <Form.Item
            label="Ngày giờ"
            name="date"
            rules={[{ required: true, message: "Chọn ngày giờ!" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            rules={[{ required: true, message: "Nhập nội dung!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Thời lượng (phút)"
            name="duration"
            rules={[{ required: true, message: "Nhập thời lượng!" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Lưu
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Chỉnh sửa môn học"
        open={isSubjectModalOpen}
        onCancel={() => {
          setIsSubjectModalOpen(false);
          subjectForm.resetFields();
          setEditingSubjectId(null);
        }}
        footer={null}
      >
        <Form
          layout="vertical"
          form={subjectForm}
          onFinish={handleEditSubject}
        >
          <Form.Item
            label="Tên môn"
            name="name"
            rules={[{ required: true, message: "Nhập tên môn!" }]}
          >
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Lưu
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default StudyManager;