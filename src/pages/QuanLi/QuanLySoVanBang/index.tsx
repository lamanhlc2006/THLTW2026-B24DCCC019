// components/DiplomaBookManagement.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, message, Card, Space, Tag } from 'antd';
import { PlusOutlined, BookOutlined } from '@ant-design/icons';
import { DiplomaBook } from '../types';
import { diplomaBookApi } from '../services/api';
import moment from 'moment';

const DiplomaBookManagement: React.FC = () => {
  const [books, setBooks] = useState<DiplomaBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await diplomaBookApi.getAll();
      setBooks(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sổ văn bằng');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleCreate = async (values: { year: number }) => {
    try {
      await diplomaBookApi.create(values.year);
      message.success('Tạo sổ văn bằng thành công');
      setModalVisible(false);
      form.resetFields();
      fetchBooks();
    } catch (error) {
      message.error(error as string);
    }
  };

  const columns = [
    {
      title: 'Số thứ tự',
      dataIndex: 'bookNumber',
      key: 'bookNumber',
      render: (num: number) => <Tag color="blue">{num}</Tag>,
    },
    {
      title: 'Năm',
      dataIndex: 'year',
      key: 'year',
      render: (year: number) => <strong>{year}</strong>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

  return (
    <Card 
      title={<><BookOutlined /> Quản lý Sổ Văn Bằng</>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Tạo sổ mới
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={books}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Tạo Sổ Văn Bằng Mới"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item
            name="year"
            label="Năm"
            rules={[{ required: true, message: 'Vui lòng nhập năm' }]}
            initialValue={new Date().getFullYear()}
          >
            <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tạo mới
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

export default DiplomaBookManagement;
