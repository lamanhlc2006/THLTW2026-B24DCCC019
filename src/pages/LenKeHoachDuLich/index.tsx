import React, { useState } from 'react';
import { 
  Layout, Menu, Card, Row, Col, Select, Button, Typography, 
  List, Progress, Alert, Table, Tag, Space, Drawer, Rate, Avatar, Modal, Form, Input, InputNumber, message
} from 'antd';
import { 
  HomeOutlined, ScheduleOutlined, DollarCircleOutlined, 
  SettingOutlined, MenuOutlined, EnvironmentOutlined, PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import 'antd/dist/antd.css'; 

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// --- MOCK DATA GỐC ---
const INITIAL_DESTINATIONS = [
  { id: '1', name: 'Thị trấn Sapa', location: 'Lào Cai', type: 'nui', price: 1500000, rating: 4.8, image: 'https://images.unsplash.com/photo-1559592413-7cea4ee494ce?w=500', desc: 'Thành phố trong sương.' },
  { id: '2', name: 'Bãi biển Mỹ Khê', location: 'Đà Nẵng', type: 'bien', price: 2000000, rating: 4.5, image: 'https://images.unsplash.com/photo-1559586616-361e1871495e?w=500', desc: 'Bãi biển quyến rũ.' },
  { id: '3', name: 'Phố cổ Hội An', location: 'Quảng Nam', type: 'thanh_pho', price: 1200000, rating: 4.9, image: 'https://images.unsplash.com/photo-1583417311718-c981d11369ae?w=500', desc: 'Nét đẹp cổ kính.' },
  { id: '4', name: 'Vịnh Hạ Long', location: 'Quảng Ninh', type: 'bien', price: 3500000, rating: 4.7, image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=500', desc: 'Kỳ quan thiên nhiên.' }
];

export default function TravelPlannerApp() {
  const [currentTab, setCurrentTab] = useState('home');
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  
  // States cho dữ liệu
  const [destinations] = useState(INITIAL_DESTINATIONS);
  const [itineraryData, setItineraryData] = useState([
    { id: Date.now(), title: 'Tham quan Bản Cát Cát', day: 1, type: 'Tham quan', cost: 150000, destName: 'Thị trấn Sapa' }
  ]);

  // States cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  // --- HÀM XỬ LÝ LỊCH TRÌNH ---
  const handleAddToItinerary = (dest: any) => {
    const newItem = {
      id: Date.now(),
      title: `Ghé thăm ${dest.name}`,
      day: 1,
      type: 'Tham quan',
      cost: 0,
      destName: dest.name
    };
    setItineraryData([...itineraryData, newItem]);
    message.success(`Đã thêm ${dest.name} vào lịch trình!`);
  };

  const handleDeleteItinerary = (id: number) => {
    setItineraryData(itineraryData.filter(item => item.id !== id));
    message.info('Đã xóa mục khỏi lịch trình');
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleSaveItinerary = (values: any) => {
    if (editingItem) {
      setItineraryData(itineraryData.map(item => item.id === editingItem.id ? { ...item, ...values } : item));
      message.success('Đã cập nhật lịch trình');
    } else {
      setItineraryData([...itineraryData, { ...values, id: Date.now() }]);
      message.success('Đã tạo lịch trình mới');
    }
    setIsModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: 'Khám phá điểm đến' },
    { key: 'itinerary', icon: <ScheduleOutlined />, label: 'Tạo lịch trình' },
    { key: 'budget', icon: <DollarCircleOutlined />, label: 'Quản lý ngân sách' },
    { key: 'admin', icon: <SettingOutlined />, label: 'Trang quản trị' },
  ];

  // --- VIEW: KHÁM PHÁ ---
  const HomeView = () => (
    <div>
      <Title level={2}>Khám phá điểm đến</Title>
      <Row gutter={[20, 20]}>
        {destinations.map(dest => (
          <Col xs={24} sm={12} lg={8} key={dest.id}>
            <Card
              hoverable
              cover={<img alt={dest.name} src={dest.image} style={{ height: 200, objectFit: 'cover' }} />}
              actions={[
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddToItinerary(dest)}>
                  Thêm vào lịch
                </Button>
              ]}
            >
              <Card.Meta title={dest.name} description={dest.location} />
              <div style={{ marginTop: 10 }}>
                <Rate disabled defaultValue={dest.rating} style={{ fontSize: 14 }} />
                <div style={{ fontWeight: 'bold', color: '#1890ff', marginTop: 5 }}>{dest.price.toLocaleString()} đ</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  // --- VIEW: LỊCH TRÌNH ---
  const ItineraryView = () => (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Title level={2}>Lịch trình của tôi</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); form.resetFields(); setIsModalOpen(true); }}>
          Tạo lịch trình
        </Button>
      </Row>
      <List
        className="itinerary-list"
        itemLayout="horizontal"
        dataSource={itineraryData}
        renderItem={item => (
          <Card style={{ marginBottom: 15, borderRadius: 8 }}>
            <List.Item
              actions={[
                <Button icon={<EditOutlined />} onClick={() => openEditModal(item)}>Sửa</Button>,
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteItinerary(item.id)}>Xoá</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>D{item.day}</Avatar>}
                title={<Text strong>{item.title}</Text>}
                description={
                  <Space split={<Text type="secondary">|</Text>}>
                    <span>Địa điểm: {item.destName || 'Chưa rõ'}</span>
                    <span>Loại: <Tag color="blue">{item.type}</Tag></span>
                    <span>Chi phí: {item.cost.toLocaleString()} đ</span>
                  </Space>
                }
              />
            </List.Item>
          </Card>
        )}
      />
    </div>
  );

  const renderContent = () => {
    switch (currentTab) {
      case 'home': return <HomeView />;
      case 'itinerary': return <ItineraryView />;
      case 'budget': return (
        <Card title="Phân bổ ngân sách">
          <Alert message="Bạn đang quản lý tốt ngân sách!" type="success" showIcon style={{marginBottom: 20}} />
          <Text>Tổng chi tiêu: {itineraryData.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString()} đ</Text>
          <Progress percent={45} status="active" />
        </Card>
      );
      case 'admin': return <Table dataSource={destinations} columns={[{ title: 'Tên', dataIndex: 'name' }, { title: 'Giá', dataIndex: 'price' }]} />;
      default: return <HomeView />;
    }
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sider Desktop cố định bên trái */}
      <Sider
        breakpoint="md"
        collapsedWidth="0"
        trigger={null}
        theme="light"
        width={240}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          borderRight: '1px solid #f0f0f0',
          zIndex: 100,
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>TRAVEL APP</Title>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[currentTab]}
          onClick={({ key }) => setCurrentTab(key)}
          items={menuItems}
        />
      </Sider>

      {/* Drawer cho Mobile */}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        visible={mobileMenuVisible}
        bodyStyle={{ padding: 0 }}
      >
        <Menu mode="inline" selectedKeys={[currentTab]} onClick={({ key }) => { setCurrentTab(key); setMobileMenuVisible(false); }} items={menuItems} />
      </Drawer>

      <Layout style={{ marginLeft: 240, transition: 'all 0.2s' }}>
        <Header style={{ background: '#fff', padding: '0 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Button
            className="mobile-toggle"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuVisible(true)}
            style={{ display: 'none' }}
          />
          <Text strong>Hệ thống lập kế hoạch du lịch</Text>
        </Header>

        {/* Phần nội dung có thanh cuộn riêng và Gap 20px */}
        <Content style={{ 
          height: 'calc(100vh - 64px)', 
          overflowY: 'auto', 
          padding: '24px 24px 24px 44px', // 44px = 24px padding chuẩn + 20px gap thêm
          background: '#f9f9f9' 
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {renderContent()}
          </div>
        </Content>
      </Layout>

      {/* Modal Sửa/Tạo lịch trình */}
      <Modal
        title={editingItem ? "Sửa lịch trình" : "Tạo lịch trình mới"}
        visible={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingItem(null); }}
        onOk={() => form.submit()}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSaveItinerary}>
          <Form.Item name="title" label="Tiêu đề hoạt động" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Ăn tối tại phố cổ" />
          </Form.Item>
          <Form.Item name="destName" label="Điểm đến">
            <Input placeholder="Tên địa danh" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="day" label="Ngày thứ mấy" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cost" label="Chi phí dự kiến" rules={[{ required: true }]}>
                <InputNumber min={0} step={1000} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="type" label="Loại hình" initialValue="Tham quan">
            <Select>
              <Option value="Tham quan">Tham quan</Option>
              <Option value="Ăn uống">Ăn uống</Option>
              <Option value="Di chuyển">Di chuyển</Option>
              <Option value="Lưu trú">Lưu trú</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        @media (max-width: 768px) {
          .ant-layout-sider { display: none !important; }
          .ant-layout { margin-left: 0 !important; }
          .mobile-toggle { display: block !important; }
        }
        /* Custom scrollbar cho Content */
        .ant-layout-content::-webkit-scrollbar { width: 6px; }
        .ant-layout-content::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
      `}</style>
    </Layout>
  );
}