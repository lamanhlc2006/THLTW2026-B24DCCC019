import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Table,
  Tag as AntTag,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  Typography,
  message,
  Dropdown,
  Badge,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ======================= Types =======================
type TaskStatus = 'todo' | 'inprogress' | 'done';
type Priority = 'high' | 'medium' | 'low';

interface Task {
  id: string;
  name: string;
  description: string;
  deadline: string | null;
  priority: Priority;
  tag: string;
  status: TaskStatus;
  createdAt: string;
}

// ======================= Constants =======================
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; boardTitle: string }> = {
  todo: { label: 'Need to do', color: '#faad14', boardTitle: '📋 Need to do' },
  inprogress: { label: 'In progress', color: '#1890ff', boardTitle: '⚙️ In progress' },
  done: { label: 'Done', color: '#52c41a', boardTitle: '✅ Done' },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high: { label: 'High', color: '#f5222d' },
  medium: { label: 'Medium', color: '#fa8c16' },
  low: { label: 'Low', color: '#52c41a' },
};

const TAG_OPTIONS = ['Work', 'Study', 'Personal', 'Meeting', 'Skill Development'];
const PRIORITY_OPTIONS: Priority[] = ['high', 'medium', 'low'];

// ======================= Helper Functions =======================
const loadTasksFromStorage = (): Task[] => {
  const stored = localStorage.getItem('kanban_tasks');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

const saveTasksToStorage = (tasks: Task[]) => {
  localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
};

const countOverdueTasks = (tasks: Task[]): number => {
  const today = moment().startOf('day');
  return tasks.filter(task => 
    task.status !== 'done' && 
    task.deadline && 
    moment(task.deadline).isBefore(today)
  ).length;
};

// ======================= Main Component =======================
const TaskManagementApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'kanban' | 'list'>('dashboard');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  // Load data
  useEffect(() => {
    const storedTasks = loadTasksFromStorage();
    if (storedTasks.length === 0) {
      // Demo data
      const demoTasks: Task[] = [
        {
          id: uuidv4(),
          name: 'Complete project prototype design',
          description: 'Design Kanban app interface using Figma',
          deadline: moment().add(2, 'days').format('YYYY-MM-DD'),
          priority: 'high',
          tag: 'Work',
          status: 'todo',
          createdAt: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          name: 'Learn React Hooks',
          description: 'Deep dive into useState, useEffect, useContext',
          deadline: moment().add(5, 'days').format('YYYY-MM-DD'),
          priority: 'medium',
          tag: 'Study',
          status: 'inprogress',
          createdAt: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          name: 'Team weekly meeting',
          description: 'Weekly project sync',
          deadline: moment().add(1, 'days').format('YYYY-MM-DD'),
          priority: 'high',
          tag: 'Meeting',
          status: 'todo',
          createdAt: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          name: 'Code review',
          description: 'Review team members PR',
          deadline: moment().subtract(1, 'days').format('YYYY-MM-DD'),
          priority: 'medium',
          tag: 'Work',
          status: 'todo',
          createdAt: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          name: 'Deploy app to production',
          description: 'Deploy frontend app using Vercel',
          deadline: moment().add(3, 'days').format('YYYY-MM-DD'),
          priority: 'high',
          tag: 'Skill Development',
          status: 'done',
          createdAt: new Date().toISOString(),
        },
      ];
      setTasks(demoTasks);
      saveTasksToStorage(demoTasks);
    } else {
      setTasks(storedTasks);
    }
  }, []);

  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasksToStorage(newTasks);
  };

  const handleSaveTask = (values: any) => {
    const taskData: Omit<Task, 'id' | 'createdAt' | 'status'> = {
      name: values.name,
      description: values.description,
      deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
      priority: values.priority,
      tag: values.tag,
    };

    if (editingTask) {
      const updatedTasks = tasks.map(task =>
        task.id === editingTask.id
          ? { ...task, ...taskData }
          : task
      );
      updateTasks(updatedTasks);
      message.success('Task updated successfully!');
    } else {
      const newTask: Task = {
        id: uuidv4(),
        ...taskData,
        status: 'todo',
        createdAt: new Date().toISOString(),
      };
      updateTasks([...tasks, newTask]);
      message.success('Task added successfully!');
    }
    setModalVisible(false);
    setEditingTask(null);
    form.resetFields();
  };

  const deleteTask = (taskId: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this task?',
      okText: 'Delete',
      cancelText: 'Cancel',
      onOk: () => {
        const newTasks = tasks.filter(task => task.id !== taskId);
        updateTasks(newTasks);
        message.success('Task deleted!');
      },
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      name: task.name,
      description: task.description,
      deadline: task.deadline ? moment(task.deadline) : null,
      priority: task.priority,
      tag: task.tag,
    });
    setModalVisible(true);
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;
    const draggedTaskId = draggableId;

    const newTasks = tasks.map(task => {
      if (task.id === draggedTaskId) {
        return { ...task, status: destStatus };
      }
      return task;
    });

    if (sourceStatus === destStatus) {
      const columnTasks = newTasks.filter(t => t.status === sourceStatus);
      const reordered = Array.from(columnTasks);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      
      const otherTasks = newTasks.filter(t => t.status !== sourceStatus);
      updateTasks([...otherTasks, ...reordered]);
    } else {
      updateTasks(newTasks);
    }
    message.success(`Moved to "${STATUS_CONFIG[destStatus].label}"`);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = countOverdueTasks(tasks);
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const getTableColumns = () => {
    return [
      {
        title: 'Task Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a: Task, b: Task) => a.name.localeCompare(b.name),
        render: (text: string) => <strong>{text}</strong>,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
      {
        title: 'Deadline',
        dataIndex: 'deadline',
        key: 'deadline',
        sorter: (a: Task, b: Task) => moment(a.deadline).unix() - moment(b.deadline).unix(),
        render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : <Text type="secondary">No deadline</Text>,
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        filters: PRIORITY_OPTIONS.map(p => ({ text: PRIORITY_CONFIG[p].label, value: p })),
        onFilter: (value: any, record: Task) => record.priority === value,
        render: (priority: Priority) => (
          <AntTag color={PRIORITY_CONFIG[priority].color}>{PRIORITY_CONFIG[priority].label}</AntTag>
        ),
      },
      {
        title: 'Tag',
        dataIndex: 'tag',
        key: 'tag',
        filters: TAG_OPTIONS.map(tag => ({ text: tag, value: tag })),
        onFilter: (value: any, record: Task) => record.tag === value,
        render: (tag: string) => <AntTag color="geekblue">{tag}</AntTag>,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        filters: Object.entries(STATUS_CONFIG).map(([key, val]) => ({ text: val.label, value: key })),
        onFilter: (value: any, record: Task) => record.status === value,
        render: (status: TaskStatus) => (
          <AntTag color={STATUS_CONFIG[status].color}>{STATUS_CONFIG[status].label}</AntTag>
        ),
      },
      {
        title: 'Actions',
        key: 'action',
        render: (_: any, record: Task) => (
          <Space>
            <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
              Edit
            </Button>
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => deleteTask(record.id)}>
              Delete
            </Button>
          </Space>
        ),
      },
    ];
  };

  const renderKanbanColumn = (status: TaskStatus) => {
    const columnTasks = tasks.filter(t => t.status === status);
    return (
      <div style={{ flex: 1, margin: '0 8px', minWidth: 280 }}>
        <div style={{
          backgroundColor: '#fafafa',
          borderRadius: 8,
          padding: '12px 8px',
          height: 'calc(100vh - 200px)',
          overflowY: 'auto',
        }}>
          <div style={{ padding: '0 8px 12px 8px', borderBottom: '2px solid #e8e8e8', marginBottom: 12 }}>
            <Title level={5} style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
              <span>{STATUS_CONFIG[status].boardTitle}</span>
              <Badge count={columnTasks.length} showZero style={{ backgroundColor: STATUS_CONFIG[status].color }} />
            </Title>
          </div>
          <Droppable droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  minHeight: 200,
                  backgroundColor: snapshot.isDraggingOver ? '#e6f7ff' : 'transparent',
                  transition: 'background-color 0.2s ease',
                  borderRadius: 4,
                }}
              >
                {columnTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          marginBottom: 8,
                        }}
                      >
                        <Card
                          size="small"
                          style={{
                            backgroundColor: snapshot.isDragging ? '#fff7e6' : '#ffffff',
                            borderLeft: `4px solid ${PRIORITY_CONFIG[task.priority].color}`,
                            cursor: 'grab',
                          }}
                          bodyStyle={{ padding: 10 }}
                          actions={[
                            <EditOutlined key="edit" onClick={() => openEditModal(task)} />,
                            <DeleteOutlined key="delete" onClick={() => deleteTask(task.id)} />,
                          ]}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <strong style={{ fontSize: 14 }}>{task.name}</strong>
                              <Dropdown
                                menu={{
                                  items: [
                                    { key: 'edit', label: 'Edit', icon: <EditOutlined />, onClick: () => openEditModal(task) },
                                    { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => deleteTask(task.id) },
                                  ],
                                }}
                                trigger={['click']}
                              >
                                <Button type="text" size="small" icon={<MoreOutlined />} />
                              </Dropdown>
                            </div>
                            {task.description && (
                              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                {task.description.length > 60 ? `${task.description.slice(0, 60)}...` : task.description}
                              </Text>
                            )}
                            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Space size={4}>
                                <AntTag color={PRIORITY_CONFIG[task.priority].color} style={{ fontSize: 10 }}>
                                  {PRIORITY_CONFIG[task.priority].label}
                                </AntTag>
                                <AntTag color="cyan" style={{ fontSize: 10 }}>{task.tag}</AntTag>
                              </Space>
                              {task.deadline && (
                                <Text type="secondary" style={{ fontSize: 10 }}>
                                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                                  {moment(task.deadline).format('DD/MM')}
                                </Text>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                  <div style={{ textAlign: 'center', padding: 24, color: '#bfbfbf' }}>
                    No tasks
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div>
            <Title level={3} style={{ marginBottom: 24 }}>📊 Dashboard</Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Tasks"
                    value={totalTasks}
                    prefix={<UnorderedListOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Completed"
                    value={completedTasks}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="In Progress"
                    value={inProgressTasks}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Overdue"
                    value={overdueTasks}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col span={24}>
                <Card title="📈 Task Progress">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <Text strong>Need to do: </Text>
                      <Text>{todoTasks}</Text>
                    </div>
                    <div>
                      <Text strong>In progress: </Text>
                      <Text>{inProgressTasks}</Text>
                    </div>
                    <div>
                      <Text strong>Completed: </Text>
                      <Text>{completedTasks}</Text>
                    </div>
                    <div>
                      <Text strong>Completion rate: </Text>
                      <Text type="success">
                        {totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)}%
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
      case 'kanban':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={3} style={{ margin: 0 }}>📌 Kanban Board</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingTask(null);
                form.resetFields();
                setModalVisible(true);
              }}>
                Add Task
              </Button>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ display: 'flex', overflowX: 'auto', gap: 8 }}>
                {renderKanbanColumn('todo')}
                {renderKanbanColumn('inprogress')}
                {renderKanbanColumn('done')}
              </div>
            </DragDropContext>
          </div>
        );
      case 'list':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={3} style={{ margin: 0 }}>📋 Task List</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingTask(null);
                form.resetFields();
                setModalVisible(true);
              }}>
                Add Task
              </Button>
            </div>
            <Card>
              <Table
                columns={getTableColumns()}
                dataSource={tasks}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} tasks` }}
                scroll={{ x: 800 }}
              />
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#001529', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
          <FlagOutlined style={{ marginRight: 8 }} /> TaskFlow - Kanban Task Management
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ backgroundColor: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            style={{ height: '100%', borderRight: 0 }}
            onClick={({ key }) => setActiveMenu(key as any)}
            items={[
              { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
              { key: 'kanban', icon: <AppstoreOutlined />, label: 'Kanban Board' },
              { key: 'list', icon: <UnorderedListOutlined />, label: 'Task List' },
            ]}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ backgroundColor: '#f0f2f5', padding: 24, borderRadius: 8, minHeight: 280 }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>

      <Modal
        title={editingTask ? '✏️ Edit Task' : '➕ Add New Task'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTask(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveTask}
          initialValues={{
            priority: 'medium',
            tag: TAG_OPTIONS[0],
          }}
        >
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please enter task name' }]}
          >
            <Input placeholder="Enter task name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter detailed description" />
          </Form.Item>
          <Form.Item
            name="deadline"
            label="Deadline"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Select deadline" />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select>
              {PRIORITY_OPTIONS.map(p => (
                <Option key={p} value={p}>
                  <AntTag color={PRIORITY_CONFIG[p].color}>{PRIORITY_CONFIG[p].label}</AntTag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="tag"
            label="Tag"
            rules={[{ required: true, message: 'Please select tag' }]}
          >
            <Select>
              {TAG_OPTIONS.map(tag => (
                <Option key={tag} value={tag}>{tag}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingTask(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default TaskManagementApp;