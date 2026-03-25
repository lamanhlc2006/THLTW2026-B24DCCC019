// components/TemplateFieldManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, message, Card, Space, Popconfirm, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { TemplateField } from '../types';
import { templateFieldApi } from '../services/api';

const dataTypes = [
  { value: 'String', label: 'Chuỗi (String)' },
  { value: 'Number', label: 'Số (Number)' },
  { value: 'Date', label: 'Ngày tháng (Date)' },
];

const controlTypes = [
  { value: 'input', label: 'Ô nhập liệu' },
  { value: 'inputNumber', label: 'Ô nhập số' },
  { value: 'datePicker', label: 'Chọn ngày' },
  { value: 'select', label: 'Danh sách chọn' },
  { value: 'textarea', label: 'Vùng văn bản' },
];

const TemplateFieldManagement: React.FC = () => {
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<TemplateField | null>(null);
  const [form] = Form.useForm();

  const fetchFields = async () => {
    setLoading(true);
    try {
      const data = await templateFieldApi.getAll();
      setFields(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách trường');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleOpenModal = (field?: TemplateField) => {
    if (field) {
      setEditingField(field);
      form.setFieldsValue(field);
    } else {
      setEditingField(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values: Omit<TemplateField, 'id'>) => {
    try {
      if (editingField) {
        await templateFieldApi.update(editingField.id, values);
        message.success('Cập nhật trường thành công');
      } else {
        await templateFieldApi.create(values);
        message.success('Thêm trường thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchFields();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await templateFieldApi.delete(id);
      message.success('Xóa trường thành công');
      fetchFields();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const getDataTypeColor = (type: string) => {
    switch (type) {
      case 'String': return 'green';
      case 'Number': return 'blue';
      case 'Date': return 'orange';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Tên trường',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'dataType',
      key: 'dataType',
      render: (type: string) => (
        <Tag color={getDataTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: 'Loại control',
      dataIndex: 'controlType',
      key: 'controlType',
      render: (type: string) => {
        const control = controlTypes.find(c => c.value === type);
        return control?.label || type;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: TemplateField) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa trường này?"
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
      title={<><SettingOutlined /> Cấu hình Biểu mẫu Phụ lục Văn bằng</>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Thêm trường
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={fields}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingField ? 'Sửa Trường' : 'Thêm Trường'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Tên trường"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input placeholder="VD: Dân tộc, Nơi sinh..." />
          </Form.Item>

          <Form.Item
            name="dataType"
            label="Kiểu dữ liệu"
            rules={[{ required: true, message: 'Vui lòng chọn kiểu dữ liệu' }]}
          >
            <Select placeholder="Chọn kiểu dữ liệu">
              {dataTypes.map(type => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="controlType"
            label="Loại control nhập liệu"
            rules={[{ required: true, message: 'Vui lòng chọn loại control' }]}
          >
            <Select placeholder="Chọn loại control">
              {controlTypes.map(type => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingField ? 'Cập nhật' : 'Thêm mới'}
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

export default TemplateFieldManagement;
