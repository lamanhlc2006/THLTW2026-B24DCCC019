import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Popconfirm,
  message,
  Tag,
  Progress,
  Drawer,
  Segmented,
  Space,
  Typography,
  Timeline as AntTimeline,
  Radio
} from 'antd';
import {
  DashboardOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  HeartOutlined,
  FireOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TrophyOutlined,
  RiseOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Types
interface Workout {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories: number;
  note: string;
  status: string;
}

interface HealthMetric {
  id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  restingHeartRate: number;
  sleepHours: number;
}

interface Goal {
  id: string;
  name: string;
  type: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: string;
}

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: string;
  description: string;
  caloriesPerHour: number;
  instructions: string;
}

// Dummy Data
const initialWorkouts: Workout[] = [
  { id: '1', date: '2024-01-15', type: 'Cardio', duration: 30, calories: 300, note: 'Chạy bộ ngoài trời', status: 'Hoàn thành' },
  { id: '2', date: '2024-01-16', type: 'Strength', duration: 45, calories: 250, note: 'Tập toàn thân', status: 'Hoàn thành' },
  { id: '3', date: '2024-01-17', type: 'Yoga', duration: 60, calories: 180, note: 'Yoga buổi sáng', status: 'Hoàn thành' },
  { id: '4', date: '2024-01-18', type: 'HIIT', duration: 25, calories: 350, note: 'Buổi tập cường độ cao', status: 'Bỏ lỡ' },
  { id: '5', date: '2024-01-19', type: 'Cardio', duration: 40, calories: 400, note: 'Đạp xe', status: 'Hoàn thành' },
  { id: '6', date: '2024-01-20', type: 'Strength', duration: 50, calories: 300, note: 'Tập ngực - vai - tay', status: 'Hoàn thành' },
  { id: '7', date: '2024-01-21', type: 'Cardio', duration: 35, calories: 320, note: 'Bơi lội', status: 'Hoàn thành' },
];

const initialHealthMetrics: HealthMetric[] = [
  { id: '1', date: '2024-01-01', weight: 70, height: 170, bmi: 24.2, restingHeartRate: 72, sleepHours: 7.5 },
  { id: '2', date: '2024-01-08', weight: 69.5, height: 170, bmi: 24.0, restingHeartRate: 70, sleepHours: 8 },
  { id: '3', date: '2024-01-15', weight: 69, height: 170, bmi: 23.9, restingHeartRate: 68, sleepHours: 7.8 },
  { id: '4', date: '2024-01-22', weight: 68.5, height: 170, bmi: 23.7, restingHeartRate: 67, sleepHours: 8.2 },
];

const initialGoals: Goal[] = [
  { id: '1', name: 'Giảm 5kg', type: 'Giảm cân', targetValue: 65, currentValue: 68.5, deadline: '2024-03-01', status: 'Đang thực hiện' },
  { id: '2', name: 'Tăng cơ bắp', type: 'Tăng cơ', targetValue: 70, currentValue: 68.5, deadline: '2024-04-01', status: 'Đang thực hiện' },
  { id: '3', name: 'Chạy 10km', type: 'Cải thiện sức bền', targetValue: 10, currentValue: 7, deadline: '2024-02-15', status: 'Đang thực hiện' },
];

const initialExercises: Exercise[] = [
  { id: '1', name: 'Bench Press', muscleGroup: 'Chest', difficulty: 'Trung bình', description: 'Tập ngực với tạ đòn', caloriesPerHour: 400, instructions: 'Nằm trên ghế, đẩy tạ lên xuống, giữ lưng thẳng' },
  { id: '2', name: 'Pull Up', muscleGroup: 'Back', difficulty: 'Khó', description: 'Kéo xà đơn', caloriesPerHour: 350, instructions: 'Treo người lên xà, kéo cơ thể lên sao cho cằm qua xà' },
  { id: '3', name: 'Squat', muscleGroup: 'Legs', difficulty: 'Dễ', description: 'Tập chân với tạ', caloriesPerHour: 300, instructions: 'Đứng thẳng, hạ thấp người như ngồi ghế, giữ lưng thẳng' },
  { id: '4', name: 'Shoulder Press', muscleGroup: 'Shoulders', difficulty: 'Trung bình', description: 'Tập vai với tạ đơn', caloriesPerHour: 320, instructions: 'Đứng hoặc ngồi, đẩy tạ từ vai lên trên đầu' },
  { id: '5', name: 'Bicep Curl', muscleGroup: 'Arms', difficulty: 'Dễ', description: 'Tập bắp tay trước', caloriesPerHour: 280, instructions: 'Đứng thẳng, gập tay với tạ từ thấp lên cao' },
  { id: '6', name: 'Plank', muscleGroup: 'Core', difficulty: 'Trung bình', description: 'Tập cơ bụng và lưng dưới', caloriesPerHour: 250, instructions: 'Chống khuỷu tay, giữ cơ thể thẳng như tấm ván' },
];

const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { color: 'blue', label: 'Thiếu cân' };
  if (bmi < 25) return { color: 'green', label: 'Bình thường' };
  if (bmi < 30) return { color: 'orange', label: 'Thừa cân' };
  return { color: 'red', label: 'Béo phì' };
};

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(initialHealthMetrics);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [workoutForm] = Form.useForm();
  
  const [healthModalVisible, setHealthModalVisible] = useState(false);
  const [editingHealth, setEditingHealth] = useState<HealthMetric | null>(null);
  const [healthForm] = Form.useForm();
  
  const [goalDrawerVisible, setGoalDrawerVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalForm] = Form.useForm();
  
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseDetailVisible, setExerciseDetailVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseForm] = Form.useForm();
  
  const [searchWorkout, setSearchWorkout] = useState('');
  const [filterWorkoutType, setFilterWorkoutType] = useState('');
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  
  const [searchExercise, setSearchExercise] = useState('');
  const [filterMuscleGroup, setFilterMuscleGroup] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [goalStatusFilter, setGoalStatusFilter] = useState('Tất cả');

  // Calculate Dashboard Stats
  const totalWorkoutsMonth = workouts.filter(w => moment(w.date).month() === moment().month()).length;
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  
  const currentStreak = () => {
    let streak = 0;
    const sortedWorkouts = [...workouts].sort((a, b) => moment(b.date).diff(moment(a.date)));
    for (let i = 0; i < sortedWorkouts.length; i++) {
      if (sortedWorkouts[i].status === 'Hoàn thành') {
        const expectedDate = moment().subtract(i, 'days').format('YYYY-MM-DD');
        if (sortedWorkouts[i].date === expectedDate) streak++;
        else break;
      } else break;
    }
    return streak;
  };
  
  const completedGoals = goals.filter(g => g.status === 'Đã đạt').length;
  const goalCompletionPercent = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;
  
  const avgWorkoutDuration = workouts.length > 0 
    ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length) 
    : 0;
  
  const avgCaloriesPerWorkout = workouts.length > 0 
    ? Math.round(workouts.reduce((sum, w) => sum + w.calories, 0) / workouts.length) 
    : 0;

  const latestWeight = healthMetrics.length > 0 ? healthMetrics[healthMetrics.length - 1].weight : 0;
  const initialWeight = healthMetrics.length > 0 ? healthMetrics[0].weight : 0;
  const weightChange = initialWeight - latestWeight;

  // Workout table columns
  const workoutColumns = [
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: (date: string) => moment(date).format('DD/MM/YYYY') },
    { title: 'Loại bài tập', dataIndex: 'type', key: 'type' },
    { title: 'Thời lượng (phút)', dataIndex: 'duration', key: 'duration' },
    { title: 'Calo đốt', dataIndex: 'calories', key: 'calories' },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', 
      render: (status: string) => (
        <Tag icon={status === 'Hoàn thành' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
             color={status === 'Hoàn thành' ? 'green' : 'red'}>
          {status}
        </Tag>
      ) 
    },
    { title: 'Hành động', key: 'action', render: (_: any, record: Workout) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => handleEditWorkout(record)} />
        <Popconfirm title="Xóa buổi tập?" onConfirm={() => handleDeleteWorkout(record.id)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    ) }
  ];

  // Health metrics table columns
  const healthColumns = [
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: (date: string) => moment(date).format('DD/MM/YYYY') },
    { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight', render: (weight: number) => weight.toFixed(1) },
    { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
    { title: 'BMI', key: 'bmi', render: (_: any, record: HealthMetric) => {
        const bmi = record.weight / Math.pow(record.height / 100, 2);
        const category = getBMICategory(bmi);
        return <Tag color={category.color}>{bmi.toFixed(1)} - {category.label}</Tag>;
      }
    },
    { title: 'Nhịp tim', dataIndex: 'restingHeartRate', key: 'restingHeartRate', render: (rate: number) => `${rate} bpm` },
    { title: 'Giờ ngủ', dataIndex: 'sleepHours', key: 'sleepHours', render: (hours: number) => `${hours} giờ` },
    { title: 'Hành động', key: 'action', render: (_: any, record: HealthMetric) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => handleEditHealth(record)} />
        <Popconfirm title="Xóa chỉ số?" onConfirm={() => handleDeleteHealth(record.id)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    ) }
  ];

  // Handlers
  const handleAddWorkout = () => {
    setEditingWorkout(null);
    workoutForm.resetFields();
    workoutForm.setFieldsValue({ date: moment(), status: 'Hoàn thành' });
    setWorkoutModalVisible(true);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    workoutForm.setFieldsValue({ ...workout, date: moment(workout.date) });
    setWorkoutModalVisible(true);
  };

  const handleSaveWorkout = (values: any) => {
    const workoutData = { ...values, date: values.date.format('YYYY-MM-DD'), id: editingWorkout?.id || Date.now().toString() };
    if (editingWorkout) {
      setWorkouts(workouts.map(w => w.id === editingWorkout.id ? workoutData : w));
      message.success('Cập nhật buổi tập thành công');
    } else {
      setWorkouts([workoutData, ...workouts]);
      message.success('Thêm buổi tập thành công');
    }
    setWorkoutModalVisible(false);
    workoutForm.resetFields();
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
    message.success('Xóa buổi tập thành công');
  };

  const handleAddHealth = () => {
    setEditingHealth(null);
    healthForm.resetFields();
    healthForm.setFieldsValue({ date: moment(), height: 170 });
    setHealthModalVisible(true);
  };

  const handleEditHealth = (health: HealthMetric) => {
    setEditingHealth(health);
    healthForm.setFieldsValue({ ...health, date: moment(health.date) });
    setHealthModalVisible(true);
  };

  const handleSaveHealth = (values: any) => {
    const heightInMeters = values.height / 100;
    const bmi = values.weight / (heightInMeters * heightInMeters);
    const healthData = { 
      ...values, 
      date: values.date.format('YYYY-MM-DD'), 
      bmi: parseFloat(bmi.toFixed(1)),
      id: editingHealth?.id || Date.now().toString() 
    };
    if (editingHealth) {
      setHealthMetrics(healthMetrics.map(h => h.id === editingHealth.id ? healthData : h));
      message.success('Cập nhật chỉ số thành công');
    } else {
      setHealthMetrics([...healthMetrics, healthData]);
      message.success('Thêm chỉ số thành công');
    }
    setHealthModalVisible(false);
    healthForm.resetFields();
  };

  const handleDeleteHealth = (id: string) => {
    setHealthMetrics(healthMetrics.filter(h => h.id !== id));
    message.success('Xóa chỉ số thành công');
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    goalForm.resetFields();
    goalForm.setFieldsValue({ status: 'Đang thực hiện', deadline: moment().add(30, 'days') });
    setGoalDrawerVisible(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    goalForm.setFieldsValue({ ...goal, deadline: moment(goal.deadline) });
    setGoalDrawerVisible(true);
  };

  const handleSaveGoal = (values: any) => {
    const goalData = { 
      ...values, 
      deadline: values.deadline.format('YYYY-MM-DD'),
      id: editingGoal?.id || Date.now().toString() 
    };
    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? goalData : g));
      message.success('Cập nhật mục tiêu thành công');
    } else {
      setGoals([...goals, goalData]);
      message.success('Thêm mục tiêu thành công');
    }
    setGoalDrawerVisible(false);
    goalForm.resetFields();
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    message.success('Xóa mục tiêu thành công');
  };

  const handleUpdateGoalProgress = (goalId: string, newValue: number) => {
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, currentValue: newValue, status: newValue >= g.targetValue ? 'Đã đạt' : g.status }
        : g
    ));
    message.success('Cập nhật tiến độ thành công');
  };

  const handleAddExercise = () => {
    setEditingExercise(null);
    exerciseForm.resetFields();
    setExerciseModalVisible(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    exerciseForm.setFieldsValue(exercise);
    setExerciseModalVisible(true);
  };

  const handleSaveExercise = (values: any) => {
    const exerciseData = { ...values, id: editingExercise?.id || Date.now().toString() };
    if (editingExercise) {
      setExercises(exercises.map(e => e.id === editingExercise.id ? exerciseData : e));
      message.success('Cập nhật bài tập thành công');
    } else {
      setExercises([...exercises, exerciseData]);
      message.success('Thêm bài tập thành công');
    }
    setExerciseModalVisible(false);
    exerciseForm.resetFields();
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
    message.success('Xóa bài tập thành công');
  };

  const filteredWorkouts = workouts.filter(w => {
    const matchesSearch = w.type.toLowerCase().includes(searchWorkout.toLowerCase()) ||
                          (w.note && w.note.toLowerCase().includes(searchWorkout.toLowerCase()));
    const matchesType = !filterWorkoutType || w.type === filterWorkoutType;
    const matchesDate = !dateRange || 
      (moment(w.date).isBetween(dateRange[0], dateRange[1], undefined, '[]'));
    return matchesSearch && matchesType && matchesDate;
  });

  const filteredExercises = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchExercise.toLowerCase());
    const matchesMuscle = !filterMuscleGroup || e.muscleGroup === filterMuscleGroup;
    const matchesDifficulty = !filterDifficulty || e.difficulty === filterDifficulty;
    return matchesSearch && matchesMuscle && matchesDifficulty;
  });

  const filteredGoals = goalStatusFilter === 'Tất cả' 
    ? goals 
    : goals.filter(g => g.status === goalStatusFilter);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, color: 'white', textAlign: 'center', fontSize: collapsed ? 12 : 18, fontWeight: 'bold' }}>
          {collapsed ? 'FT' : 'Fitness Tracker'}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[activeTab]} onClick={(e) => setActiveTab(e.key)}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="workouts" icon={<CalendarOutlined />}>Nhật ký tập luyện</Menu.Item>
          <Menu.Item key="health" icon={<HeartOutlined />}>Nhật ký chỉ số</Menu.Item>
          <Menu.Item key="goals" icon={<TrophyOutlined />}>Quản lý mục tiêu</Menu.Item>
          <Menu.Item key="exercises" icon={<FireOutlined />}>Thư viện bài tập</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          <Title level={4} style={{ margin: 0 }}>
            {activeTab === 'dashboard' && 'Dashboard - Tổng quan'}
            {activeTab === 'workouts' && 'Nhật ký tập luyện'}
            {activeTab === 'health' && 'Nhật ký chỉ số sức khỏe'}
            {activeTab === 'goals' && 'Quản lý mục tiêu'}
            {activeTab === 'exercises' && 'Thư viện bài tập'}
          </Title>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          
          {/* Dashboard Tab - No Charts */}
          {activeTab === 'dashboard' && (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic 
                      title="Tổng buổi tập trong tháng" 
                      value={totalWorkoutsMonth} 
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic 
                      title="Tổng calo đã đốt" 
                      value={totalCalories} 
                      suffix="kcal" 
                      prefix={<FireOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic 
                      title="Số ngày tập liên tiếp" 
                      value={currentStreak()} 
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic 
                      title="Mục tiêu hoàn thành" 
                      value={goalCompletionPercent.toFixed(0)} 
                      suffix="%" 
                      prefix={<TrophyOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} sm={12}>
                  <Card title="Thống kê tập luyện" bordered={false}>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Trung bình mỗi buổi: </Text>
                      <Text>{avgWorkoutDuration} phút - {avgCaloriesPerWorkout} kcal</Text>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Buổi tập nhiều nhất: </Text>
                      <Text>{Math.max(...workouts.map(w => w.duration), 0)} phút</Text>
                    </div>
                    <div>
                      <Text strong>Loại tập phổ biến: </Text>
                      <Tag color="blue">
                        {Object.entries(
                          workouts.reduce((acc, w) => {
                            acc[w.type] = (acc[w.type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Chưa có'}
                      </Tag>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card title="Thống kê sức khỏe" bordered={false}>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Cân nặng hiện tại: </Text>
                      <Text>{latestWeight} kg</Text>
                      {weightChange !== 0 && (
                        <Tag color={weightChange > 0 ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                          {weightChange > 0 ? `Giảm ${weightChange.toFixed(1)}kg` : `Tăng ${Math.abs(weightChange).toFixed(1)}kg`}
                        </Tag>
                      )}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Nhịp tim trung bình: </Text>
                      <Text>
                        {healthMetrics.length > 0 
                          ? Math.round(healthMetrics.reduce((sum, h) => sum + h.restingHeartRate, 0) / healthMetrics.length)
                          : 0} bpm
                      </Text>
                    </div>
                    <div>
                      <Text strong>Giấc ngủ trung bình: </Text>
                      <Text>
                        {healthMetrics.length > 0 
                          ? (healthMetrics.reduce((sum, h) => sum + h.sleepHours, 0) / healthMetrics.length).toFixed(1)
                          : 0} giờ/đêm
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Card title="📝 5 buổi tập gần nhất" style={{ marginTop: 24 }}>
                <AntTimeline>
                  {workouts.slice(0, 5).map(workout => (
                    <AntTimeline.Item key={workout.id} color={workout.status === 'Hoàn thành' ? 'green' : 'red'}>
                      <div>
                        <strong>{moment(workout.date).format('DD/MM/YYYY')}</strong> - {workout.type}
                        <br />
                        <Text type="secondary">⏱️ {workout.duration} phút • 🔥 {workout.calories} kcal</Text>
                        {workout.note && <div><Text type="secondary">📌 {workout.note}</Text></div>}
                      </div>
                    </AntTimeline.Item>
                  ))}
                </AntTimeline>
              </Card>

              <Card title="🎯 Mục tiêu đang thực hiện" style={{ marginTop: 24 }}>
                {goals.filter(g => g.status === 'Đang thực hiện').slice(0, 3).map(goal => {
                  const percent = (goal.currentValue / goal.targetValue) * 100;
                  return (
                    <div key={goal.id} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>{goal.name}</Text>
                        <Text>{goal.currentValue} / {goal.targetValue}</Text>
                      </div>
                      <Progress percent={Math.min(percent, 100)} size="small" />
                      <Text type="secondary">Deadline: {moment(goal.deadline).format('DD/MM/YYYY')}</Text>
                    </div>
                  );
                })}
                {goals.filter(g => g.status === 'Đang thực hiện').length === 0 && (
                  <Text type="secondary">Chưa có mục tiêu nào đang thực hiện</Text>
                )}
              </Card>
            </>
          )}

          {/* Workout Journal Tab */}
          {activeTab === 'workouts' && (
            <>
              <Space style={{ marginBottom: 16 }} wrap>
                <Input 
                  placeholder="Tìm kiếm bài tập" 
                  prefix={<SearchOutlined />}
                  style={{ width: 200 }}
                  value={searchWorkout}
                  onChange={e => setSearchWorkout(e.target.value)}
                />
                <Select 
                  placeholder="Lọc theo loại" 
                  style={{ width: 150 }}
                  allowClear
                  onChange={setFilterWorkoutType}
                >
                  <Option value="Cardio">Cardio</Option>
                  <Option value="Strength">Strength</Option>
                  <Option value="Yoga">Yoga</Option>
                  <Option value="HIIT">HIIT</Option>
                  <Option value="Other">Other</Option>
                </Select>
                <RangePicker onChange={(dates) => setDateRange(dates as [moment.Moment, moment.Moment])} />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddWorkout}>Thêm buổi tập</Button>
              </Space>
              <Table 
                columns={workoutColumns} 
                dataSource={filteredWorkouts} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
              />
            </>
          )}

          {/* Health Metrics Tab */}
          {activeTab === 'health' && (
            <>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddHealth} style={{ marginBottom: 16 }}>
                Thêm chỉ số mới
              </Button>
              <Table 
                columns={healthColumns} 
                dataSource={healthMetrics} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
              />
            </>
          )}

          {/* Goals Management Tab */}
          {activeTab === 'goals' && (
            <>
              <Space style={{ marginBottom: 16 }} direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <Segmented
                    options={['Tất cả', 'Đang thực hiện', 'Đã đạt', 'Đã hủy']}
                    value={goalStatusFilter}
                    onChange={setGoalStatusFilter as any}
                  />
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddGoal}>Thêm mục tiêu</Button>
                </div>
              </Space>
              <Row gutter={[16, 16]}>
                {filteredGoals.map(goal => {
                  const percentComplete = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                  return (
                    <Col xs={24} md={12} lg={8} key={goal.id}>
                      <Card
                        actions={[
                          <EditOutlined key="edit" onClick={() => handleEditGoal(goal)} />,
                          <Popconfirm title="Xóa mục tiêu?" onConfirm={() => handleDeleteGoal(goal.id)}>
                            <DeleteOutlined key="delete" />
                          </Popconfirm>
                        ]}
                      >
                        <Card.Meta title={goal.name} />
                        <div style={{ marginTop: 12 }}>
                          <Tag color={goal.status === 'Đang thực hiện' ? 'blue' : goal.status === 'Đã đạt' ? 'green' : 'red'}>
                            {goal.status}
                          </Tag>
                          <Tag>{goal.type}</Tag>
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Tiến độ: {goal.currentValue} / {goal.targetValue}</Text>
                            <Text strong style={{ color: '#1890ff' }}>{percentComplete.toFixed(0)}%</Text>
                          </div>
                          <Progress percent={percentComplete} status={percentComplete >= 100 ? 'success' : 'active'} />
                          <div style={{ marginTop: 12 }}>
                            <Text type="secondary">Cập nhật giá trị hiện tại:</Text>
                            <InputNumber
                              style={{ marginLeft: 8, width: 120, marginTop: 8 }}
                              value={goal.currentValue}
                              onChange={(value) => handleUpdateGoalProgress(goal.id, value || 0)}
                              step={0.5}
                            />
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <Text type="secondary">📅 Deadline: {moment(goal.deadline).format('DD/MM/YYYY')}</Text>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
              {filteredGoals.length === 0 && (
                <div style={{ textAlign: 'center', padding: 50 }}>
                  <Text type="secondary">Không có mục tiêu nào</Text>
                </div>
              )}
            </>
          )}

          {/* Exercise Library Tab */}
          {activeTab === 'exercises' && (
            <>
              <Space style={{ marginBottom: 16 }} wrap>
                <Input 
                  placeholder="Tìm kiếm bài tập" 
                  prefix={<SearchOutlined />}
                  style={{ width: 200 }}
                  value={searchExercise}
                  onChange={e => setSearchExercise(e.target.value)}
                />
                <Select 
                  placeholder="Nhóm cơ" 
                  style={{ width: 150 }}
                  allowClear
                  onChange={setFilterMuscleGroup}
                >
                  <Option value="Chest">Chest (Ngực)</Option>
                  <Option value="Back">Back (Lưng)</Option>
                  <Option value="Legs">Legs (Chân)</Option>
                  <Option value="Shoulders">Shoulders (Vai)</Option>
                  <Option value="Arms">Arms (Tay)</Option>
                  <Option value="Core">Core (Bụng)</Option>
                  <Option value="Full Body">Full Body (Toàn thân)</Option>
                </Select>
                <Select 
                  placeholder="Mức độ khó" 
                  style={{ width: 150 }}
                  allowClear
                  onChange={setFilterDifficulty}
                >
                  <Option value="Dễ">Dễ</Option>
                  <Option value="Trung bình">Trung bình</Option>
                  <Option value="Khó">Khó</Option>
                </Select>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddExercise}>Thêm bài tập</Button>
              </Space>
              <Row gutter={[16, 16]}>
                {filteredExercises.map(exercise => (
                  <Col xs={24} sm={12} md={8} key={exercise.id}>
                    <Card
                      hoverable
                      onClick={() => {
                        setSelectedExercise(exercise);
                        setExerciseDetailVisible(true);
                      }}
                      actions={[
                        <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); handleEditExercise(exercise); }} />,
                        <Popconfirm title="Xóa bài tập?" onConfirm={() => handleDeleteExercise(exercise.id)}>
                          <DeleteOutlined key="delete" onClick={(e) => e.stopPropagation()} />
                        </Popconfirm>
                      ]}
                    >
                      <Card.Meta 
                        title={exercise.name}
                        description={
                          <div>
                            <div style={{ marginTop: 8 }}>
                              <Tag>{exercise.muscleGroup}</Tag>
                              <Tag color={exercise.difficulty === 'Dễ' ? 'green' : exercise.difficulty === 'Trung bình' ? 'orange' : 'red'}>
                                {exercise.difficulty}
                              </Tag>
                            </div>
                            <Paragraph style={{ marginTop: 8, marginBottom: 0 }} ellipsis={{ rows: 2 }}>
                              {exercise.description}
                            </Paragraph>
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">🔥 ~{Math.round(exercise.caloriesPerHour / 60)} cal/phút</Text>
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
              {filteredExercises.length === 0 && (
                <div style={{ textAlign: 'center', padding: 50 }}>
                  <Text type="secondary">Không tìm thấy bài tập nào</Text>
                </div>
              )}
            </>
          )}
        </Content>
      </Layout>

      {/* Modals and Drawers */}
      <Modal
        title={editingWorkout ? "Sửa buổi tập" : "Thêm buổi tập mới"}
        open={workoutModalVisible}
        onCancel={() => setWorkoutModalVisible(false)}
        onOk={() => workoutForm.submit()}
        width={600}
      >
        <Form form={workoutForm} layout="vertical" onFinish={handleSaveWorkout}>
          <Form.Item name="date" label="Ngày tập" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="type" label="Loại bài tập" rules={[{ required: true }]}>
            <Select>
              <Option value="Cardio">Cardio</Option>
              <Option value="Strength">Strength</Option>
              <Option value="Yoga">Yoga</Option>
              <Option value="HIIT">HIIT</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="calories" label="Calo đốt" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="Hoàn thành">Hoàn thành</Radio>
              <Radio value="Bỏ lỡ">Bỏ lỡ</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingHealth ? "Sửa chỉ số sức khỏe" : "Thêm chỉ số sức khỏe"}
        open={healthModalVisible}
        onCancel={() => setHealthModalVisible(false)}
        onOk={() => healthForm.submit()}
        width={600}
      >
        <Form form={healthForm} layout="vertical" onFinish={handleSaveHealth}>
          <Form.Item name="date" label="Ngày" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true }]}>
            <InputNumber min={20} max={300} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true }]}>
            <InputNumber min={50} max={250} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="restingHeartRate" label="Nhịp tim lúc nghỉ (bpm)" rules={[{ required: true }]}>
            <InputNumber min={40} max={150} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sleepHours" label="Giờ ngủ" rules={[{ required: true }]}>
            <InputNumber min={0} max={24} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={editingGoal ? "Sửa mục tiêu" : "Thêm mục tiêu mới"}
        placement="right"
        onClose={() => setGoalDrawerVisible(false)}
        open={goalDrawerVisible}
        width={500}
      >
        <Form form={goalForm} layout="vertical" onFinish={handleSaveGoal}>
          <Form.Item name="name" label="Tên mục tiêu" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Loại mục tiêu" rules={[{ required: true }]}>
            <Select>
              <Option value="Giảm cân">Giảm cân</Option>
              <Option value="Tăng cơ">Tăng cơ</Option>
              <Option value="Cải thiện sức bền">Cải thiện sức bền</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetValue" label="Giá trị mục tiêu" rules={[{ required: true }]}>
            <InputNumber step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="currentValue" label="Giá trị hiện tại" rules={[{ required: true }]}>
            <InputNumber step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select>
              <Option value="Đang thực hiện">Đang thực hiện</Option>
              <Option value="Đã đạt">Đã đạt</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title={editingExercise ? "Sửa bài tập" : "Thêm bài tập mới"}
        open={exerciseModalVisible}
        onCancel={() => setExerciseModalVisible(false)}
        onOk={() => exerciseForm.submit()}
        width={600}
      >
        <Form form={exerciseForm} layout="vertical" onFinish={handleSaveExercise}>
          <Form.Item name="name" label="Tên bài tập" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="muscleGroup" label="Nhóm cơ tác động" rules={[{ required: true }]}>
            <Select>
              <Option value="Chest">Chest (Ngực)</Option>
              <Option value="Back">Back (Lưng)</Option>
              <Option value="Legs">Legs (Chân)</Option>
              <Option value="Shoulders">Shoulders (Vai)</Option>
              <Option value="Arms">Arms (Tay)</Option>
              <Option value="Core">Core (Bụng)</Option>
              <Option value="Full Body">Full Body (Toàn thân)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="difficulty" label="Mức độ khó" rules={[{ required: true }]}>
            <Select>
              <Option value="Dễ">Dễ</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Khó">Khó</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả ngắn" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="caloriesPerHour" label="Calo đốt trung bình/giờ" rules={[{ required: true }]}>
            <InputNumber min={0} max={1000} step={10} style={{ width: '100%' }} suffix="kcal" />
          </Form.Item>
          <Form.Item name="instructions" label="Hướng dẫn thực hiện" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`📋 Hướng dẫn: ${selectedExercise?.name}`}
        open={exerciseDetailVisible}
        onCancel={() => setExerciseDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedExercise && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag>{selectedExercise.muscleGroup}</Tag>
              <Tag color={selectedExercise.difficulty === 'Dễ' ? 'green' : selectedExercise.difficulty === 'Trung bình' ? 'orange' : 'red'}>
                {selectedExercise.difficulty}
              </Tag>
            </div>
            <Paragraph><strong>📝 Mô tả:</strong> {selectedExercise.description}</Paragraph>
            <Paragraph><strong>📖 Hướng dẫn chi tiết:</strong></Paragraph>
            <Paragraph>{selectedExercise.instructions}</Paragraph>
            <Paragraph>
              <strong>🔥 Calo đốt:</strong> ~{selectedExercise.caloriesPerHour} kcal/giờ 
              (~{Math.round(selectedExercise.caloriesPerHour / 60)} cal/phút)
            </Paragraph>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default App;