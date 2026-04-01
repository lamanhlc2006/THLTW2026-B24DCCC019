import React, { useState, useMemo } from 'react';
import {
  Tabs, Table, Button, Modal, Form, Input, Select, Tag, Space,
  Row, Col, Card, Statistic, message, Popconfirm, Avatar, Drawer, List, Typography
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SwapOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;
const { Text } = Typography;

// --- Định nghĩa Types ---
interface Club {
  id: string;
  avatar: string;
  name: string;
  foundedDate: string;
  description: string;
  president: string;
  isActive: boolean;
}

interface ActionHistory {
  action: string;
  date: string;
  by: string;
  note?: string;
}

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  address: string;
  strengths: string;
  clubId: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectReason?: string;
  history: ActionHistory[];
}

// --- Mock Data Ban Đầu ---
const initialClubs: Club[] = [
  { id: 'C1', avatar: 'https://joeschmoe.io/api/v1/1', name: 'CLB Âm Nhạc', foundedDate: '2020-01-01', description: '<b>Hát hay</b> đàn giỏi', president: 'Nguyễn Văn A', isActive: true },
  { id: 'C2', avatar: 'https://joeschmoe.io/api/v1/2', name: 'CLB Lập Trình', foundedDate: '2021-05-15', description: 'Code <i>vì đam mê</i>', president: 'Trần Thị B', isActive: true },
];

const initialApps: Application[] = [
  { id: 'A1', name: 'Lê Văn C', email: 'c@gmail.com', phone: '0123456789', gender: 'Nam', address: 'Hà Nội', strengths: 'Guitar', clubId: 'C1', reason: 'Đam mê', status: 'Pending', history: [] },
  { id: 'A2', name: 'Phạm Thị D', email: 'd@gmail.com', phone: '0987654321', gender: 'Nữ', address: 'HCM', strengths: 'ReactJS', clubId: 'C2', reason: 'Muốn học hỏi', status: 'Pending', history: [] },
  { id: 'A3', name: 'Hoàng Văn E', email: 'e@gmail.com', phone: '0111222333', gender: 'Nam', address: 'Đà Nẵng', strengths: 'Piano', clubId: 'C1', reason: 'Giải trí', status: 'Approved', history: [{ action: 'Approved', date: '2025-04-01 10:00', by: 'Admin' }] },
];

export default function ClubManagementSystem() {
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [applications, setApplications] = useState<Application[]>(initialApps);
  const [activeTab, setActiveTab] = useState('1');

  // ==================== TAB 1: DANH SÁCH CLB ====================
  const [searchClubText, setSearchClubText] = useState('');
  
  const clubColumns = [
    { title: 'Avatar', dataIndex: 'avatar', render: (src: string) => <Avatar src={src} /> },
    { title: 'Tên CLB', dataIndex: 'name', sorter: (a: Club, b: Club) => a.name.localeCompare(b.name) },
    { title: 'Ngày thành lập', dataIndex: 'foundedDate', sorter: (a: Club, b: Club) => new Date(a.foundedDate).getTime() - new Date(b.foundedDate).getTime() },
    { title: 'Chủ nhiệm', dataIndex: 'president' },
    { title: 'Hoạt động', dataIndex: 'isActive', render: (val: boolean) => <Tag color={val ? 'green' : 'red'}>{val ? 'Có' : 'Không'}</Tag> },
    {
      title: 'Thao tác',
      render: (_: any, record: Club) => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />} />
          <Popconfirm title="Xóa CLB này?" onConfirm={() => setClubs(clubs.filter(c => c.id !== record.id))}>
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button size="small" onClick={() => setActiveTab('3')} icon={<EyeOutlined />}>TV</Button>
        </Space>
      ),
    },
  ];

  const filteredClubs = clubs.filter(c => c.name.toLowerCase().includes(searchClubText.toLowerCase()));

  // ==================== TAB 2: QUẢN LÝ ĐƠN ĐĂNG KÝ ====================
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [currentHistory, setCurrentHistory] = useState<ActionHistory[]>([]);

  const handleApprove = (ids: string[]) => {
    const time = moment().format('HH:mm DD/MM/YYYY');
    setApplications(apps => apps.map(app => 
      ids.includes(app.id) 
        ? { ...app, status: 'Approved', history: [...app.history, { action: 'Approved', date: time, by: 'Admin' }] } 
        : app
    ));
    setSelectedRowKeys([]);
    message.success(`Đã duyệt ${ids.length} đơn`);
  };

  const handleReject = (values: { reason: string }) => {
    const time = moment().format('HH:mm DD/MM/YYYY');
    setApplications(apps => apps.map(app => 
      selectedRowKeys.includes(app.id) 
        ? { ...app, status: 'Rejected', rejectReason: values.reason, history: [...app.history, { action: 'Rejected', date: time, by: 'Admin', note: values.reason }] } 
        : app
    ));
    setIsRejectModalVisible(false);
    setSelectedRowKeys([]);
    rejectForm.resetFields();
    message.warning(`Đã từ chối ${selectedRowKeys.length} đơn`);
  };

  const appColumns = [
    { title: 'Họ tên', dataIndex: 'name', sorter: (a: Application, b: Application) => a.name.localeCompare(b.name) },
    { title: 'Email', dataIndex: 'email' },
    { title: 'CLB', dataIndex: 'clubId', render: (id: string) => clubs.find(c => c.id === id)?.name },
    { title: 'Trạng thái', dataIndex: 'status', render: (status: string) => (
      <Tag color={status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange'}>{status}</Tag>
    )},
    {
      title: 'Thao tác',
      render: (_: any, record: Application) => (
        <Space>
          <Button size="small" onClick={() => { setCurrentHistory(record.history); setHistoryDrawerVisible(true); }}>Lịch sử</Button>
        </Space>
      ),
    },
  ];

  // ==================== TAB 3: QUẢN LÝ THÀNH VIÊN (APPROVED) ====================
  const [memberSelectedKeys, setMemberSelectedKeys] = useState<React.Key[]>([]);
  const [isChangeClubModalVisible, setIsChangeClubModalVisible] = useState(false);
  const [targetClubId, setTargetClubId] = useState<string>('');

  const members = applications.filter(app => app.status === 'Approved');

  const handleChangeClub = () => {
    if (!targetClubId) {
      message.error("Vui lòng chọn CLB đến");
      return;
    }
    const time = moment().format('HH:mm DD/MM/YYYY');
    const clubName = clubs.find(c => c.id === targetClubId)?.name;
    
    setApplications(apps => apps.map(app => 
      memberSelectedKeys.includes(app.id) 
        ? { ...app, clubId: targetClubId, history: [...app.history, { action: 'Change Club', date: time, by: 'Admin', note: `Chuyển sang ${clubName}` }] } 
        : app
    ));
    setIsChangeClubModalVisible(false);
    setMemberSelectedKeys([]);
    message.success(`Đã chuyển CLB cho ${memberSelectedKeys.length} thành viên`);
  };

  // ==================== TAB 4: BÁO CÁO THỐNG KÊ ====================
  const stats = useMemo(() => {
    const totalClubs = clubs.length;
    const pending = applications.filter(a => a.status === 'Pending').length;
    const approved = applications.filter(a => a.status === 'Approved').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;

    // Chuẩn bị data cho Bảng thống kê theo CLB
    const tableData = clubs.map(club => {
      const appsInClub = applications.filter(a => a.clubId === club.id);
      return {
        key: club.id,
        clubName: club.name,
        pending: appsInClub.filter(a => a.status === 'Pending').length,
        approved: appsInClub.filter(a => a.status === 'Approved').length,
        rejected: appsInClub.filter(a => a.status === 'Rejected').length,
        total: appsInClub.length
      };
    });

    return { totalClubs, pending, approved, rejected, tableData };
  }, [clubs, applications]);

  const statColumns = [
    { title: 'Tên Câu Lạc Bộ', dataIndex: 'clubName', key: 'clubName', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Đang chờ (Pending)', dataIndex: 'pending', key: 'pending', render: (val: number) => <Tag color="orange">{val}</Tag> },
    { title: 'Đã duyệt (Approved)', dataIndex: 'approved', key: 'approved', render: (val: number) => <Tag color="green">{val}</Tag> },
    { title: 'Từ chối (Rejected)', dataIndex: 'rejected', key: 'rejected', render: (val: number) => <Tag color="red">{val}</Tag> },
    { title: 'Tổng đơn', dataIndex: 'total', key: 'total', render: (val: number) => <Text strong>{val}</Text> },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card title="HỆ THỐNG QUẢN LÝ CÂU LẠC BỘ" bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          
          {/* ----- TAB 1: DANH SÁCH CÂU LẠC BỘ ----- */}
          <TabPane tab="1. Câu lạc bộ" key="1">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary">Thêm mới CLB</Button>
              <Input.Search placeholder="Tìm kiếm tên CLB..." onSearch={setSearchClubText} onChange={e => setSearchClubText(e.target.value)} />
            </Space>
            <Table 
              rowKey="id" 
              dataSource={filteredClubs} 
              columns={clubColumns} 
              expandable={{ expandedRowRender: record => <div dangerouslySetInnerHTML={{ __html: record.description }} /> }}
            />
          </TabPane>

          {/* ----- TAB 2: QUẢN LÝ ĐƠN ĐĂNG KÝ ----- */}
          <TabPane tab="2. Đơn đăng ký" key="2">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<CheckCircleOutlined />} disabled={selectedRowKeys.length === 0} onClick={() => handleApprove(selectedRowKeys as string[])}>
                Duyệt {selectedRowKeys.length > 0 ? selectedRowKeys.length : ''} đơn đã chọn
              </Button>
              <Button danger icon={<CloseCircleOutlined />} disabled={selectedRowKeys.length === 0} onClick={() => setIsRejectModalVisible(true)}>
                Từ chối {selectedRowKeys.length > 0 ? selectedRowKeys.length : ''} đơn đã chọn
              </Button>
            </Space>
            <Table 
              rowKey="id" 
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
              dataSource={applications} 
              columns={appColumns} 
            />
          </TabPane>

          {/* ----- TAB 3: QUẢN LÝ THÀNH VIÊN ----- */}
          <TabPane tab="3. Quản lý thành viên" key="3">
            <Space style={{ marginBottom: 16 }}>
               <Button type="dashed" icon={<SwapOutlined />} disabled={memberSelectedKeys.length === 0} onClick={() => setIsChangeClubModalVisible(true)}>
                Đổi CLB cho {memberSelectedKeys.length > 0 ? memberSelectedKeys.length : ''} thành viên
              </Button>
            </Space>
            <Table 
              rowKey="id" 
              rowSelection={{ selectedRowKeys: memberSelectedKeys, onChange: setMemberSelectedKeys }}
              dataSource={members} 
              columns={appColumns.filter(c => c.dataIndex !== 'status')} // Không cần hiển thị status vì đều là Approved
            />
          </TabPane>

          {/* ----- TAB 4: BÁO CÁO THỐNG KÊ ----- */}
          <TabPane tab="4. Báo cáo & Thống kê" key="4">
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}><Card><Statistic title="Tổng số CLB" value={stats.totalClubs} /></Card></Col>
              <Col span={6}><Card><Statistic title="Đơn Pending" value={stats.pending} valueStyle={{ color: '#faad14' }} /></Card></Col>
              <Col span={6}><Card><Statistic title="Đơn Approved" value={stats.approved} valueStyle={{ color: '#52c41a' }} /></Card></Col>
              <Col span={6}><Card><Statistic title="Đơn Rejected" value={stats.rejected} valueStyle={{ color: '#f5222d' }} /></Card></Col>
            </Row>
            
            <Card title="Thống kê số lượng đơn đăng ký theo từng CLB">
              <Table 
                dataSource={stats.tableData} 
                columns={statColumns} 
                pagination={false} 
                bordered
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* MODAL TỪ CHỐI ĐƠN */}
      <Modal title="Lý do từ chối" visible={isRejectModalVisible} onOk={() => rejectForm.submit()} onCancel={() => setIsRejectModalVisible(false)}>
        <Form form={rejectForm} onFinish={handleReject} layout="vertical">
          <Form.Item name="reason" label="Vui lòng nhập lý do từ chối" rules={[{ required: true, message: 'Bắt buộc nhập lý do' }]}>
            <Input.TextArea rows={4} placeholder="Ví dụ: Không phù hợp với tiêu chí của CLB..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL ĐỔI CLB CHO THÀNH VIÊN */}
      <Modal title={`Chuyển CLB cho ${memberSelectedKeys.length} thành viên`} visible={isChangeClubModalVisible} onOk={handleChangeClub} onCancel={() => setIsChangeClubModalVisible(false)}>
        <Select style={{ width: '100%' }} placeholder="Chọn CLB muốn chuyển đến" onChange={setTargetClubId} value={targetClubId || undefined}>
          {clubs.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
        </Select>
      </Modal>

      {/* DRAWER LỊCH SỬ THAO TÁC */}
      <Drawer title="Lịch sử thao tác" placement="right" onClose={() => setHistoryDrawerVisible(false)} visible={historyDrawerVisible}>
        <List
          itemLayout="horizontal"
          dataSource={currentHistory}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={<Text strong>{item.action}</Text>}
                description={
                  <>
                    <div>Bởi: {item.by} lúc {item.date}</div>
                    {item.note && <div>Lý do: <Text type="danger">{item.note}</Text></div>}
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
}