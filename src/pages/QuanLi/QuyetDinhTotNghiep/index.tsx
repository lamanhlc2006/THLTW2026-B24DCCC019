// components/GraduationDecisionManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, DatePicker, Select, message, Card, Space, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { GraduationDecision, DiplomaBook } from '../types';
import { decisionApi, diplomaBookApi } from '../services/api';
import moment from 'moment';

const { TextArea } = Input;

const GraduationDecisionManagement: React.FC = () => {
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [books, setBooks] = useState<DiplomaBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDecision, setEditingDecision] = useState<GraduationDecision | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [decisionsData, booksData] = await Promise.all([
        decisionApi.getAll(),
        diplomaBookApi.getAll(),
      ]);
      setDecisions(decisionsData);
      setBooks(booksData);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (decision?: GraduationDecision) => {
    if (decision) {
      setEditingDecision(decision);
      form.setFieldsValue({
        ...decision,
        issueDate: moment(decision.issueDate),
      });
    } else {
      setEditingDecision(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        issueDate: values.issueDate.toDate(),
      };

      if (editingDecision) {
        await decisionApi.update(editingDecision.id, data);
        message.success('Cập nhật quyết định thành công');
      } else {
        await decisionApi.create(data);
        message.success('Thêm quyết định thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await decisionApi.delete(id);
      message.success('Xóa quyết định thành công');
      fetchData();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'Số QĐ',
      dataIndex: 'decisionNumber',
      key: 'decisionNumber',
    },
    {
      title: 'Ngày ban hành',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: Date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trích yếu',
      dataIndex: 'excerpt',
      key: 'excerpt',
      ellipsis: true,
    },
    {
      title: 'Sổ văn bằng',
      dataIndex: 'diplomaBookId',
      key: 'diplomaBookId',
      render: (id: string) => {
        const book = books.find(b => b.id === id);
        return book ? `Sổ ${book.bookNumber} - Năm ${book.year}` : '-';
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: GraduationDecision) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa quyết định này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={<><FileTextOutlined /> Quản lý Quyết định Tốt nghiệp</>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Thêm quyết định
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={decisions}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingDecision ? 'Sửa Quyết định' : 'Thêm Quyết định'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="decisionNumber"
            label="Số quyết định"
            rules={[{ required: true, message: 'Vui lòng nhập số quyết định' }]}
          >
            <Input placeholder="VD: QD-001/2024" />
          </Form.Item>

          <Form.Item
            name="issueDate"
            label="Ngày ban hành"
            rules={[{ required: true, message: 'Vui lòng chọn ngày ban hành' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="excerpt"
            label="Trích yếu"
            rules={[{ required: true, message: 'Vui lòng nhập trích yếu' }]}
          >
            <TextArea rows={3} placeholder="Nội dung trích yếu quyết định" />
          </Form.Item>

          <Form.Item
            name="diplomaBookId"
            label="Sổ văn bằng"
            rules={[{ required: true, message: 'Vui lòng chọn sổ văn bằng' }]}
          >
            <Select placeholder="Chọn sổ văn bằng">
              {books.map(book => (
                <Select.Option key={book.id} value={book.id}>
                  Sổ {book.bookNumber} - Năm {book.year}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingDecision ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default GraduationDecisionManagement;
