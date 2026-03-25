// components/DiplomaInfoManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, DatePicker, Select, InputNumber,
  message, Card, Space, Popconfirm, Descriptions, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { DiplomaInfo, GraduationDecision, TemplateField } from '../types';
import { diplomaApi, decisionApi, templateFieldApi } from '../services/api';
import moment from 'moment';

const DiplomaInfoManagement: React.FC = () => {
  const [diplomas, setDiplomas] = useState<DiplomaInfo[]>([]);
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingDiploma, setEditingDiploma] = useState<DiplomaInfo | null>(null);
  const [viewingDiploma, setViewingDiploma] = useState<DiplomaInfo | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [diplomasData, decisionsData, fieldsData] = await Promise.all([
        diplomaApi.getAll(),
        decisionApi.getAll(),
        templateFieldApi.getAll(),
      ]);
      setDiplomas(diplomasData);
      setDecisions(decisionsData);
      setTemplateFields(fieldsData);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (diploma?: DiplomaInfo) => {
    if (diploma) {
      setEditingDiploma(diploma);
      form.setFieldsValue({
        ...diploma,
        dateOfBirth: moment(diploma.dateOfBirth),
        ...diploma.additionalFields,
      });
    } else {
      setEditingDiploma(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleViewDetail = (diploma: DiplomaInfo) => {
    setViewingDiploma(diploma);
    setDetailVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const additionalFields: Record<string, any> = {};
      templateFields.forEach(field => {
        if (values[field.name] !== undefined) {
          additionalFields[field.name] = values[field.name];
        }
      });

      const data = {
        diplomaNumber: values.diplomaNumber,
        studentId: values.studentId,
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth.toDate(),
        decisionId: values.decisionId,
        additionalFields,
      };

      if (editingDiploma) {
        await diplomaApi.update(editingDiploma.id, data);
        message.success('Cập nhật văn bằng thành công');
      } else {
        await diplomaApi.create(data);
        message.success('Thêm văn bằng thành công');
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
      await diplomaApi.delete(id);
      message.success('Xóa văn bằng thành công');
      fetchData();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const renderDynamicFormItem = (field: TemplateField) => {
    switch (field.controlType) {
      case 'inputNumber':
        return <InputNumber style={{ width: '100%' }} />;
      case 'datePicker':
        return <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />;
      case 'select':
        return (
          <Select placeholder={`Chọn ${field.name}`}>
            <Select.Option value="option1">Tùy chọn 1</Select.Option>
            <Select.Option value="option2">Tùy chọn 2</Select.Option>
          </Select>
        );
      case 'textarea':
        return <Input.TextArea rows={2} />;
      default:
        return <Input />;
    }
  };

  const columns = [
    {
      title: 'Số vào sổ',
      dataIndex: 'entryNumber',
      key: 'entryNumber',
      render: (num: number) => <Tag color="blue">{num}</Tag>,
    },
    {
      title: 'Số hiệu văn bằng',
      dataIndex: 'diplomaNumber',
      key: 'diplomaNumber',
    },
    {
      title: 'Mã SV',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (date: Date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Quyết định',
      dataIndex: 'decisionId',
      key: 'decisionId',
      render: (id: string) => {
        const decision = decisions.find(d => d.id === id);
        return decision?.decisionNumber || '-';
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: DiplomaInfo) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa văn bằng này?"
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
      title={<><SafetyCertificateOutlined /> Quản lý Thông tin Văn bằng</>}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Thêm văn bằng
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={diplomas}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal thêm/sửa */}
      <Modal
        title={editingDiploma ? 'Sửa Thông tin Văn bằng' : 'Thêm Thông tin Văn bằng'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="diplomaNumber"
            label="Số hiệu văn bằng"
            rules={[{ required: true, message: 'Vui lòng nhập số hiệu văn bằng' }]}
          >
            <Input placeholder="Số hiệu văn bằng" />
          </Form.Item>

          <Form.Item
            name="studentId"
            label="Mã sinh viên"
            rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên' }]}
          >
            <Input placeholder="Mã sinh viên" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Họ và tên sinh viên" />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="decisionId"
            label="Quyết định tốt nghiệp"
            rules={[{ required: true, message: 'Vui lòng chọn quyết định' }]}
          >
            <Select placeholder="Chọn quyết định tốt nghiệp">
              {decisions.map(decision => (
                <Select.Option key={decision.id} value={decision.id}>
                  {decision.decisionNumber} - {decision.excerpt}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Dynamic fields from template */}
          {templateFields.map(field => (
            <Form.Item
              key={field.id}
              name={field.name}
              label={field.name}
            >
              {renderDynamicFormItem(field)}
            </Form.Item>
          ))}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingDiploma ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết Văn bằng"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>Đóng</Button>}
        width={600}
      >
        {viewingDiploma && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Số vào sổ">
              <Tag color="blue">{viewingDiploma.entryNumber}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số hiệu văn bằng">
              {viewingDiploma.diplomaNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Mã sinh viên">
              {viewingDiploma.studentId}
            </Descriptions.Item>
            <Descriptions.Item label="Họ tên">
              {viewingDiploma.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {moment(viewingDiploma.dateOfBirth).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Quyết định">
              {decisions.find(d => d.id === viewingDiploma.decisionId)?.decisionNumber}
            </Descriptions.Item>
            {viewingDiploma.additionalFields && 
              Object.entries(viewingDiploma.additionalFields).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  {value?.toString() || '-'}
                </Descriptions.Item>
              ))
            }
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};

export default DiplomaInfoManagement;
