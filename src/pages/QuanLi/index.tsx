import React, { useState, useMemo } from 'react';
import { 
  Layout, Menu, Table, Button, Modal, Form, Input, 
  Select, DatePicker, TimePicker, Tag, Card, Row, 
  Col, Statistic, Rate, List, Typography, Space, message, Tabs
} from 'antd';
import { 
  UserOutlined, CalendarOutlined, AppstoreOutlined, 
  BarChartOutlined, StarOutlined, PlusOutlined 
} from '@ant-design/icons';
import moment from 'moment';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// --- Interfaces ---
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // Phút
}

interface Staff {
  id: string;
  name: string;
  maxClientsPerDay: number;
  rating: number;
}

interface Appointment {
  id: string;
  customerName: string;
  staffId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  review?: { rating: number; comment: string; reply?: string };
}

// --- Mock Data Ban đầu ---
const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: 'Cắt tóc nam', price: 100000, duration: 30 },
  { id: 's2', name: 'Combo Gội massage', price: 150000, duration: 45 },
];

const INITIAL_STAFFS: Staff[] = [
  { id: 'st1', name: 'Nguyễn Văn Anh', maxClientsPerDay: 5, rating: 4.5 },
  { id: 'st2', name: 'Trần Thị Bình', maxClientsPerDay: 3, rating: 5.0 },
];

// --- MAIN COMPONENT ---
const BookingApp: React.FC = () => {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [staffs, setStaffs] = useState<Staff[]>(INITIAL_STAFFS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // --- Logic Xử lý ---

  const handleAddAppointment = (values: any) => {
    const dateStr = values.date.format('YYYY-MM-DD');
    const timeStr = values.time.format('HH:mm');

    // 1. Kiểm tra giới hạn khách/ngày của nhân viên
    const staffAppsInDay = appointments.filter(
      ap => ap.staffId === values.staffId && ap.date === dateStr && ap.status !== 'Cancelled'
    );
    const staff = staffs.find(s => s.id === values.staffId);
    if (staff && staffAppsInDay.length >= staff.maxClientsPerDay) {
      return message.error("Nhân viên này đã nhận đủ khách trong ngày này!");
    }

    // 2. Kiểm tra trùng lịch (cùng nhân viên, cùng ngày, cùng giờ)
    const isOverlapped = appointments.some(
      ap => ap.staffId === values.staffId && ap.date === dateStr && ap.time === timeStr && ap.status !== 'Cancelled'
    );
    if (isOverlapped) {
      return message.error("Nhân viên đã có lịch vào khung giờ này!");
    }

    const newApp: Appointment = {
      id: Date.now().toString(),
      customerName: values.customerName,
      staffId: values.staffId,
      serviceId: values.serviceId,
      date: dateStr,
      time: timeStr,
      status: 'Pending',
    };

    setAppointments([...appointments, newApp]);
    setIsModalVisible(false);
    form.resetFields();
    message.success("Đặt lịch thành công!");
  };

  const updateStatus = (id: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(ap => ap.id === id ? { ...ap, status: newStatus } : ap));
    message.info(`Đã cập nhật trạng thái: ${newStatus}`);
  };

  const submitReview = (id: string, rating: number, comment: string) => {
    setAppointments(prev => prev.map(ap => 
      ap.id === id ? { ...ap, review: { rating, comment } } : ap
    ));
    message.success("Cảm ơn bạn đã đánh giá!");
  };

  // --- Render Thống kê ---
  const stats = useMemo(() => {
    const completed = appointments.filter(ap => ap.status === 'Completed');
    const revenue = completed.reduce((sum, ap) => {
      const s = services.find(ser => ser.id === ap.serviceId);
      return sum + (s?.price || 0);
    }, 0);
    return { count: appointments.length, revenue };
  }, [appointments, services]);

  // --- Columns cho Table ---
  const columns = [
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { 
      title: 'Nhân viên', 
      dataIndex: 'staffId', 
      render: (id: string) => staffs.find(s => s.id === id)?.name 
    },
    { 
      title: 'Dịch vụ', 
      dataIndex: 'serviceId', 
      render: (id: string) => services.find(s => s.id === id)?.name 
    },
    { title: 'Thời gian', render: (_: any, record: Appointment) => `${record.date} ${record.time}` },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'Completed' ? 'green' : status === 'Pending' ? 'gold' : 'blue'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      render: (_: any, record: Appointment) => (
        <Space>
          {record.status === 'Pending' && (
            <Button size="small" onClick={() => updateStatus(record.id, 'Confirmed')}>Duyệt</Button>
          )}
          {record.status === 'Confirmed' && (
            <Button size="small" type="primary" onClick={() => updateStatus(record.id, 'Completed')}>Hoàn thành</Button>
          )}
          {record.status !== 'Completed' && record.status !== 'Cancelled' && (
            <Button size="small" danger onClick={() => updateStatus(record.id, 'Cancelled')}>Hủy</Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: '#fff', lineHeight: '32px' }}>
          BOOKING SYSTEM
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<CalendarOutlined />}>Lịch hẹn</Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>Nhân viên</Menu.Item>
          <Menu.Item key="3" icon={<AppstoreOutlined />}>Dịch vụ</Menu.Item>
          <Menu.Item key="4" icon={<BarChartOutlined />}>Thống kê</Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 20px' }}>
          <Title level={4} style={{ margin: '16px 0' }}>Quản lý Đặt lịch Dịch vụ</Title>
        </Header>

        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Tabs defaultActiveKey="1">
            {/* Tab 1: Quản lý Lịch hẹn */}
            <TabPane tab="Lịch hẹn & Đặt lịch" key="1">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} style={{ marginBottom: 16 }}>
                Đặt lịch mới
              </Button>
              <Table dataSource={appointments} columns={columns} rowKey="id" />
            </TabPane>

            {/* Tab 2: Thống kê & Báo cáo */}
            <TabPane tab="Thống kê" key="2">
              <Row gutter={16}>
                <Col span={8}>
                  <Card><Statistic title="Tổng lịch hẹn" value={stats.count} prefix={<CalendarOutlined />} /></Card>
                </Col>
                <Col span={8}>
                  <Card><Statistic title="Doanh thu (VNĐ)" value={stats.revenue} precision={0} valueStyle={{ color: '#3f8600' }} /></Card>
                </Col>
                <Col span={8}>
                  <Card><Statistic title="Đánh giá trung bình" value={4.8} prefix={<StarOutlined />} suffix="/ 5" /></Card>
                </Col>
              </Row>
            </TabPane>

            {/* Tab 3: Đánh giá (Mô phỏng khách hàng) */}
            <TabPane tab="Đánh giá từ khách" key="3">
              <List
                itemLayout="vertical"
                dataSource={appointments.filter(ap => ap.status === 'Completed')}
                renderItem={item => (
                  <List.Item>
                    <Text strong>{item.customerName}</Text> - <Text type="secondary">{services.find(s => s.id === item.serviceId)?.name}</Text>
                    <br />
                    {item.review ? (
                      <div>
                        <Rate disabled defaultValue={item.review.rating} />
                        <p>{item.review.comment}</p>
                      </div>
                    ) : (
                      <Button size="small" onClick={() => submitReview(item.id, 5, "Dịch vụ rất tuyệt vời!")}>
                        Gửi đánh giá mẫu (5 sao)
                      </Button>
                    )}
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        </Content>
      </Layout>

      {/* Modal Đặt lịch */}
      <Modal 
        title="Tạo lịch hẹn mới" 
        visible={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAppointment}>
          <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="serviceId" label="Dịch vụ" rules={[{ required: true }]}>
            <Select>
              {services.map(s => <Option key={s.id} value={s.id}>{s.name} ({s.price.toLocaleString()}đ)</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="staffId" label="Nhân viên phục vụ" rules={[{ required: true }]}>
            <Select>
              {staffs.map(st => <Option key={st.id} value={st.id}>{st.name} (Tối đa {st.maxClientsPerDay} khách/ngày)</Option>)}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Ngày" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < moment().startOf('day')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="time" label="Giờ" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
};

export default BookingApp;