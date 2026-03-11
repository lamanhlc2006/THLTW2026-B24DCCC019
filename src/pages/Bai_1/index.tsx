import React, { useState } from 'react';
import { 
  Button, Card, Typography, Space, Table, Tag, 
  Row, Col, Statistic, Empty, Layout 
} from 'antd';
import { 
  TrophyFilled, 
  ThunderboltFilled, 
  DashboardFilled, 
  HistoryOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;

type Choice = 'Kéo' | 'Búa' | 'Bao';
const choiceData: Record<Choice, { icon: string }> = {
  'Kéo': { icon: '' },
  'Búa': { icon: '' },
  'Bao': { icon: '' }
};

interface GameHistory {
  key: string;
  player: Choice;
  computer: Choice;
  result: 'Thắng' | 'Thua' | 'Hòa';
  time: string;
}

const OanTuTiV4: React.FC = () => {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const playGame = (playerChoice: Choice) => {
    setLoading(true);
    
    setTimeout(() => {
      const choices: Choice[] = ['Kéo', 'Búa', 'Bao'];
      const computerChoice = choices[Math.floor(Math.random() * 3)];
      
      let result: 'Thắng' | 'Thua' | 'Hòa';
      if (playerChoice === computerChoice) result = 'Hòa';
      else if (
        (playerChoice === 'Kéo' && computerChoice === 'Bao') ||
        (playerChoice === 'Búa' && computerChoice === 'Kéo') ||
        (playerChoice === 'Bao' && computerChoice === 'Búa')
      ) result = 'Thắng';
      else result = 'Thua';

      const newMatch: GameHistory = {
        key: Date.now().toString(),
        player: playerChoice,
        computer: computerChoice,
        result,
        time: new Date().toLocaleTimeString(),
      };

      setHistory([newMatch, ...history]);
      setLoading(false);
    }, 400);
  };

  const winCount = history.filter(h => h.result === 'Thắng').length;
  const drawCount = history.filter(h => h.result === 'Hòa').length;
  const lossCount = history.filter(h => h.result === 'Thua').length;

  return (
    <Layout className="game-layout">
      <Content className="game-container">
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={1}>
            Oẳn Tù Tì <ThunderboltFilled style={{ color: '#faad14' }} />
          </Title>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card className="stat-card">
              <Statistic title="Thắng" value={winCount} valueStyle={{ color: '#52c41a' }} prefix={<TrophyFilled />} />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="stat-card">
              <Statistic title="Hòa" value={drawCount} valueStyle={{ color: '#faad14' }} prefix={<DashboardFilled />} />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="stat-card">
              <Statistic title="Thua" value={lossCount} valueStyle={{ color: '#ff4d4f' }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <Card title="Kéo búa bao" className="main-card">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {(['Kéo', 'Búa', 'Bao'] as Choice[]).map((item) => (
                  <Button 
                    key={item}
                    block
                    loading={loading}
                    onClick={() => playGame(item)}
                    className="game-btn"
                  >
                    <span style={{ fontSize: 24, marginRight: 8 }}>{choiceData[item].icon}</span>
                    <span style={{ fontWeight: 'bold' }}>{item}</span>
                  </Button>
                ))}
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={14}>
            <Card 
              title={<span><HistoryOutlined /> Lịch sử</span>}
              className="main-card"
              extra={
                history.length > 0 && (
                  <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setHistory([])}>
                    Xóa
                  </Button>
                )
              }
            >
              <Table 
                dataSource={history} 
                pagination={{ pageSize: 5 }}
                size="middle"
                columns={[
                  { 
                    title: 'Bạn', 
                    dataIndex: 'player',
                    render: (val: Choice) => <span>{choiceData[val].icon} {val}</span>
                  },
                  { 
                    title: 'Máy', 
                    dataIndex: 'computer',
                    render: (val: Choice) => <span>{choiceData[val].icon} {val}</span>
                  },
                  { 
                    title: 'Kết quả', 
                    dataIndex: 'result',
                    align: 'center',
                    render: (res) => (
                      <Tag color={res === 'Thắng' ? 'green' : res === 'Thua' ? 'red' : 'orange'}>
                        {res}
                      </Tag>
                    )
                  }
                ]}
                locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }}
              />
            </Card>
          </Col>
        </Row>

        <style>{`
          .game-layout {
            min-height: 100vh;
            background: #f0f2f5;
            padding: 40px 20px;
          }
          .game-container {
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
          }
          .stat-card {
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }
          .main-card {
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            height: 100%;
          }
          .game-btn {
            height: 70px !important;
            border-radius: 8px !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            border: 1px solid #d9d9d9;
          }
          .game-btn:hover {
            border-color: #1890ff !important;
            color: #1890ff !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(24, 144, 255, 0.2);
          }
          .ant-table-wrapper {
            background: white;
          }
        `}</style>
      </Content>
    </Layout>
  );
};

export default OanTuTiV4;