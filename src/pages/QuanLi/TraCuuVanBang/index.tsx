// components/DiplomaSearch.tsx
import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, DatePicker, Button, Table, Space, Descriptions,
  Modal, Statistic, Row, Col, message, Tag, InputNumber, Alert
} from 'antd';
import { SearchOutlined, EyeOutlined, FileSearchOutlined } from '@ant-design/icons';
import { DiplomaInfo, GraduationDecision, SearchParams } from '../types';
import { diplomaApi, decisionApi } from '../services/api';
import moment from 'moment';

const DiplomaSearch: React.FC = () => {
  const [searchResults, setSearchResults] = useState<DiplomaInfo[]>([]);
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDiploma, setSelectedDiploma] = useState<DiplomaInfo | null>(null);
  const [searchCounts, setSearchCounts] = useState<Record<string, number>>({});
  const [form] = Form.useForm();

  useEffect(() => {
    decisionApi.getAll().then(setDecisions);
  }, []);

  const validateSearchParams = (values: SearchParams): boolean => {
    const filledFields = Object.values(values).filter(v => v !== undefined && v !== '').length;
    return filledFields >= 2;
  };

  const handleSearch = async (values: any) => {
    const searchParams: SearchParams = {
      diplomaNumber: values.diplomaNumber || undefined,
      entryNumber: values.entryNumber || undefined,
      studentId: values.studentId || undefined,
      fullName: values.fullName || undefined,
      dateOfBirth: values.dateOfBirth?.toDate() || undefined,
    };

    if (!validateSearchParams(searchParams)) {
      message.warning('Vui lòng nhập ít nhất 2 tham số tìm kiếm');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const results = await diplomaApi.search(searchParams);
      setSearchResults(results);

      // Get search counts for each decision
      const counts: Record<string, number> = {};
      for (const decision of decisions) {
        counts[decision.id] = await diplomaApi.getSearchCount(decision.id);
      }
      setSearchCounts(counts);
    } catch (error) {
      message.error('Có lỗi xảy ra khi tìm kiếm');
    }
    setLoading(false);
  };

  const handleViewDetail = (diploma: DiplomaInfo) => {
    setSelectedDiploma(diploma);
    setDetailVisible(true);
  };

  const handleReset = () => {
    form.resetFields();
    setSearchResults([]);
    setSearched(false);
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
      title: 'Quyết định TN',
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
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title={<><FileSearchOutlined /> Tra cứu Văn bằng</>}>
        <Alert
          message="Lưu ý"
          description="Vui lòng nhập ít nhất 2 tham số để tìm kiếm"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="diplomaNumber" label="Số hiệu văn bằng">
                <Input placeholder="Nhập số hiệu văn bằng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="entryNumber" label="Số vào sổ">
                <InputNumber style={{ width: '100%' }} placeholder="Nhập số vào sổ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="studentId" label="Mã sinh viên">
                <Input placeholder="Nhập mã sinh viên" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="fullName" label="Họ tên">
                <Input placeholder="Nhập họ tên" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateOfBirth" label="Ngày sinh">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label=" ">
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                    Tìm kiếm
                  </Button>
                  <Button onClick={handleReset}>
                    Đặt lại
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {searched && (
        <>
          {/* Thống kê số lượt tra cứu theo quyết định */}
          <Card title="Thống kê lượt tra cứu theo Quyết định" style={{ marginTop: 16 }}>
            <Row gutter={16}>
              {decisions.map(decision => (
                <Col span={6} key={decision.id}>
                  <Statistic
                    title={decision.decisionNumber}
                    value={searchCounts[decision.id] || 0}
                    suffix="lượt"
                  />
                </Col>
              ))}
            </Row>
          </Card>

          {/* Kết quả tìm kiếm */}
          <Card 
            title={`Kết quả tìm kiếm (${searchResults.length} kết quả)`} 
            style={{ marginTop: 16 }}
          >
            <Table
              columns={columns}
              dataSource={searchResults}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'Không tìm thấy kết quả phù hợp' }}
            />
          </Card>
        </>
      )}

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết Văn bằng và Quyết định Tốt nghiệp"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>Đóng</Button>}
        width={700}
      >
        {selectedDiploma && (
          <>
            <Descriptions title="Thông tin Văn bằng" bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Số vào sổ">
                <Tag color="blue">{selectedDiploma.entryNumber}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số hiệu văn bằng">
                {selectedDiploma.diplomaNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Mã sinh viên">
                {selectedDiploma.studentId}
              </Descriptions.Item>
              <Descriptions.Item label="Họ tên">
                {selectedDiploma.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {moment(selectedDiploma.dateOfBirth).format('DD/MM/YYYY')}
              </Descriptions.Item>
              {selectedDiploma.additionalFields && 
                Object.entries(selectedDiploma.additionalFields).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {value?.toString() || '-'}
                  </Descriptions.Item>
                ))
              }
            </Descriptions>

            {(() => {
              const decision = decisions.find(d => d.id === selectedDiploma.decisionId);
              if (decision) {
                return (
                  <Descriptions title="Thông tin Quyết định Tốt nghiệp" bordered column={1}>
                    <Descriptions.Item label="Số quyết định">
                      {decision.decisionNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày ban hành">
                      {moment(decision.issueDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trích yếu">
                      {decision.excerpt}
                    </Descriptions.Item>
                  </Descriptions>
                );
              }
              return null;
            })()}
          </>
        )}
      </Modal>
    </div>
  );
};

export default DiplomaSearch;
