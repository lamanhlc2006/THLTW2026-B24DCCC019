import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Pagination,
  Input,
  Tag,
  Button,
  Table,
  Modal,
  Form,
  Select,
  Popconfirm,
  Space,
  Avatar,
  Typography,
  Divider,
  Breadcrumb,
  Empty,
  Spin,
  message,
  Statistic,
  Descriptions,
  List,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import 'antd/dist/antd.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ============ Types ============
interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: Tag[];
  status: 'draft' | 'published';
  viewCount: number;
  createdAt: string;
  author: string;
}

interface Tag {
  id: string;
  name: string;
  postCount: number;
}

interface Author {
  name: string;
  avatar: string;
  bio: string;
  skills: string[];
  socialLinks: { platform: string; url: string; icon: React.ReactNode }[];
}

// ============ Mock Data ============
const mockTags: Tag[] = [
  { id: '1', name: 'React', postCount: 5 },
  { id: '2', name: 'TypeScript', postCount: 3 },
  { id: '3', name: 'JavaScript', postCount: 4 },
  { id: '4', name: 'CSS', postCount: 2 },
  { id: '5', name: 'Node.js', postCount: 3 },
];

const mockPosts: Post[] = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Bài viết ${i + 1}: Hướng dẫn ${['React', 'TypeScript', 'Node.js'][i % 3]} từ cơ bản đến nâng cao`,
  slug: `bai-viet-${i + 1}`,
  content: `Đây là nội dung chi tiết của bài viết ${i + 1}.\n\nBài viết này sẽ hướng dẫn bạn từng bước để làm chủ công nghệ một cách hiệu quả nhất.\n\nChúng ta sẽ tìm hiểu về:\n- Khái niệm cơ bản\n- Các tính năng nâng cao\n- Best practices\n- Ví dụ thực tế\n\nHy vọng bài viết sẽ hữu ích cho bạn!`,
  excerpt: `Đây là tóm tắt ngắn gọn về bài viết ${i + 1}, giới thiệu những điểm chính sẽ được đề cập...`,
  coverImage: `https://picsum.photos/300/200?random=${i}`,
  tags: [mockTags[i % 3], mockTags[(i + 1) % 3]],
  status: i % 3 === 0 ? 'draft' : 'published',
  viewCount: Math.floor(Math.random() * 1000),
  createdAt: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
  author: 'Nguyễn Văn A',
}));

const mockAuthor: Author = {
  name: 'Nguyễn Văn A',
  avatar: 'https://picsum.photos/200/200?random=100',
  bio: 'Frontend Developer với 5 năm kinh nghiệm trong lĩnh vực phát triển web. Đam mê chia sẻ kiến thức và xây dựng cộng đồng.',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Docker'],
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com', icon: <GithubOutlined /> },
    { platform: 'Twitter', url: 'https://twitter.com', icon: <TwitterOutlined /> },
    { platform: 'LinkedIn', url: 'https://linkedin.com', icon: <LinkedinOutlined /> },
  ],
};

// ============ Utility Functions ============
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ============ Main App Component ============
const BlogApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'post' | 'about' | 'admin-posts' | 'admin-tags'>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [currentPagination, setCurrentPagination] = useState({ page: 1, pageSize: 9 });
  const [loading, setLoading] = useState(false);

  // Admin states
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postForm] = Form.useForm();
  const [postSearchText, setPostSearchText] = useState('');
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

  // Tag states
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagForm] = Form.useForm();

  // ============ Filter and Search Logic ============
  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => p.status === 'published');

    if (selectedTag) {
      result = result.filter(p => p.tags.some(t => t.id === selectedTag));
    }

    if (searchKeyword) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    return result;
  }, [posts, selectedTag, searchKeyword]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPagination.page - 1) * currentPagination.pageSize;
    const end = start + currentPagination.pageSize;
    return filteredPosts.slice(start, end);
  }, [filteredPosts, currentPagination]);

  const relatedPosts = useMemo(() => {
    if (!selectedPost) return [];
    const postTags = selectedPost.tags.map(t => t.id);
    return posts
      .filter(p => p.id !== selectedPost.id && p.status === 'published')
      .filter(p => p.tags.some(t => postTags.includes(t.id)))
      .slice(0, 3);
  }, [selectedPost, posts]);

  // ============ Handlers ============
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchKeyword(value);
      setCurrentPagination(prev => ({ ...prev, page: 1 }));
    }, 300),
    []
  );

  const handleViewPost = (post: Post) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id ? { ...p, viewCount: p.viewCount + 1 } : p
      )
    );
    setSelectedPost(post);
    setCurrentPage('post');
  };

  const handleSavePost = async (values: any) => {
    const postData: Post = {
      ...values,
      id: editingPost?.id || Date.now().toString(),
      tags: tags.filter(t => values.tags.includes(t.id)),
      viewCount: editingPost?.viewCount || 0,
      createdAt: editingPost?.createdAt || new Date().toISOString().split('T')[0],
      author: mockAuthor.name,
      excerpt: values.content.substring(0, 150) + '...',
    };

    if (editingPost) {
      setPosts(prev => prev.map(p => p.id === editingPost.id ? postData : p));
      message.success('Cập nhật bài viết thành công');
    } else {
      setPosts(prev => [postData, ...prev]);
      message.success('Thêm bài viết mới thành công');
    }

    setPostModalVisible(false);
    setEditingPost(null);
    postForm.resetFields();
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    message.success('Xóa bài viết thành công');
  };

  const handleSaveTag = async (values: any) => {
    if (editingTag) {
      setTags(prev =>
        prev.map(t =>
          t.id === editingTag.id
            ? { ...t, name: values.name }
            : t
        )
      );
      message.success('Cập nhật thẻ thành công');
    } else {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: values.name,
        postCount: 0,
      };
      setTags(prev => [...prev, newTag]);
      message.success('Thêm thẻ mới thành công');
    }

    setTagModalVisible(false);
    setEditingTag(null);
    tagForm.resetFields();
  };

  const handleDeleteTag = (id: string) => {
    const tagInUse = posts.some(p => p.tags.some(t => t.id === id));
    if (tagInUse) {
      message.error('Không thể xóa thẻ đang được sử dụng');
      return;
    }
    setTags(prev => prev.filter(t => t.id !== id));
    message.success('Xóa thẻ thành công');
  };

  // Update tag post counts
  useEffect(() => {
    const updatedTags = tags.map(tag => ({
      ...tag,
      postCount: posts.filter(p => p.tags.some(t => t.id === tag.id)).length,
    }));
    setTags(updatedTags);
  }, [posts]);

  // ============ Components ============
  const BlogCard: React.FC<{ post: Post }> = ({ post }) => (
    <Card
      hoverable
      cover={
        <img
          alt={post.title}
          src={post.coverImage}
          style={{ height: 200, objectFit: 'cover' }}
        />
      }
      actions={[
        <EyeOutlined key="view" onClick={() => handleViewPost(post)} />,
        <EditOutlined key="edit" onClick={() => {
          setEditingPost(post);
          postForm.setFieldsValue({
            ...post,
            tags: post.tags.map(t => t.id),
          });
          setPostModalVisible(true);
        }} />,
      ]}
    >
      <Card.Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{post.title}</span>
            {post.status === 'draft' && <Tag color="orange">Nháp</Tag>}
          </div>
        }
        description={
          <>
            <Paragraph ellipsis={{ rows: 2 }}>{post.excerpt}</Paragraph>
            <div style={{ marginTop: 12 }}>
              {post.tags.map(tag => (
                <Tag
                  key={tag.id}
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTag(tag.id);
                  }}
                >
                  {tag.name}
                </Tag>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c' }}>
              <span>{post.author}</span> • <span>{post.createdAt}</span> • <span>{post.viewCount} lượt xem</span>
            </div>
          </>
        }
      />
    </Card>
  );

  const RelatedPosts: React.FC<{ posts: Post[] }> = ({ posts }) => (
    <div>
      <Title level={4}>Bài viết liên quan</Title>
      <List
        dataSource={posts}
        renderItem={(post: Post) => (
          <List.Item
            style={{ cursor: 'pointer', padding: '12px 0' }}
            onClick={() => handleViewPost(post)}
          >
            <List.Item.Meta
              avatar={<Avatar shape="square" size={64} src={post.coverImage} />}
              title={post.title}
              description={`${post.viewCount} lượt xem • ${post.createdAt}`}
            />
          </List.Item>
        )}
      />
    </div>
  );

  // ============ Page Renderers ============
  const renderHomePage = () => (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Bài viết mới nhất</Title>
        <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
          <Input
            size="large"
            placeholder="Tìm kiếm bài viết..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
          <div>
            <Tag
              style={{ cursor: 'pointer' }}
              color={!selectedTag ? 'blue' : undefined}
              onClick={() => setSelectedTag('')}
            >
              Tất cả
            </Tag>
            {tags.map(tag => (
              <Tag
                key={tag.id}
                style={{ cursor: 'pointer' }}
                color={selectedTag === tag.id ? 'blue' : undefined}
                onClick={() => setSelectedTag(tag.id)}
              >
                {tag.name} ({tag.postCount})
              </Tag>
            ))}
          </div>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : paginatedPosts.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {paginatedPosts.map(post => (
              <Col xs={24} sm={12} md={8} key={post.id}>
                <BlogCard post={post} />
              </Col>
            ))}
          </Row>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Pagination
              current={currentPagination.page}
              pageSize={currentPagination.pageSize}
              total={filteredPosts.length}
              onChange={(page) => setCurrentPagination(prev => ({ ...prev, page }))}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <Empty description="Không tìm thấy bài viết nào" />
      )}
    </>
  );

  const renderPostDetailPage = () => {
    if (!selectedPost) return null;

    return (
      <>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => setCurrentPage('home')}
          style={{ marginBottom: 16 }}
        >
          Quay lại danh sách
        </Button>

        <Card>
          <Title level={1}>{selectedPost.title}</Title>
          
          <Space split={<Divider type="vertical" />} style={{ marginBottom: 16 }}>
            <span><UserOutlined /> {selectedPost.author}</span>
            <span>{selectedPost.createdAt}</span>
            <span><EyeOutlined /> {selectedPost.viewCount} lượt xem</span>
          </Space>

          <div style={{ marginBottom: 16 }}>
            {selectedPost.tags.map(tag => (
              <Tag key={tag.id} color="blue">{tag.name}</Tag>
            ))}
          </div>

          <img
            src={selectedPost.coverImage}
            alt={selectedPost.title}
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', marginBottom: 24, borderRadius: 8 }}
          />

          <div style={{ 
            fontSize: 16, 
            lineHeight: 1.8, 
            whiteSpace: 'pre-wrap',
            marginBottom: 24 
          }}>
            {selectedPost.content}
          </div>

          <Divider />

          <RelatedPosts posts={relatedPosts} />
        </Card>
      </>
    );
  };

  const renderAboutPage = () => (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar size={150} src={mockAuthor.avatar} />
        <Title level={2} style={{ marginTop: 16 }}>{mockAuthor.name}</Title>
      </div>

      <Descriptions column={1} bordered>
        <Descriptions.Item label="Giới thiệu">{mockAuthor.bio}</Descriptions.Item>
        <Descriptions.Item label="Kỹ năng">
          {mockAuthor.skills.map(skill => (
            <Tag key={skill} color="blue">{skill}</Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="Liên kết">
          <Space>
            {mockAuthor.socialLinks.map(link => (
              <Button
                key={link.platform}
                type="link"
                icon={link.icon}
                href={link.url}
                target="_blank"
              >
                {link.platform}
              </Button>
            ))}
          </Space>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Row gutter={16}>
        <Col span={8}>
          <Statistic title="Bài viết" value={posts.filter(p => p.status === 'published').length} />
        </Col>
        <Col span={8}>
          <Statistic title="Lượt xem" value={posts.reduce((sum, p) => sum + p.viewCount, 0)} />
        </Col>
        <Col span={8}>
          <Statistic title="Thẻ" value={tags.length} />
        </Col>
      </Row>
    </Card>
  );

  const renderAdminPostsPage = () => {
    const filteredAdminPosts = posts.filter(p => {
      const matchSearch = !postSearchText || p.title.toLowerCase().includes(postSearchText.toLowerCase());
      const matchStatus = postStatusFilter === 'all' || p.status === postStatusFilter;
      return matchSearch && matchStatus;
    });

    const columns = [
      {
        title: 'Tiêu đề',
        dataIndex: 'title',
        key: 'title',
        render: (text: string, record: Post) => (
          <a onClick={() => handleViewPost(record)}>{text}</a>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'published' ? 'green' : 'orange'}>
            {status === 'published' ? 'Đã đăng' : 'Nháp'}
          </Tag>
        ),
      },
      {
        title: 'Thẻ',
        dataIndex: 'tags',
        key: 'tags',
        render: (tags: Tag[]) => tags.map(tag => <Tag key={tag.id}>{tag.name}</Tag>),
      },
      {
        title: 'Lượt xem',
        dataIndex: 'viewCount',
        key: 'viewCount',
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
      },
      {
        title: 'Thao tác',
        key: 'action',
        render: (_: any, record: Post) => (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingPost(record);
                postForm.setFieldsValue({
                  ...record,
                  tags: record.tags.map(t => t.id),
                });
                setPostModalVisible(true);
              }}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Bạn có chắc muốn xóa bài viết này?"
              onConfirm={() => handleDeletePost(record.id)}
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
      <>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="Tìm kiếm theo tiêu đề"
              prefix={<SearchOutlined />}
              onChange={(e) => setPostSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              value={postStatusFilter}
              onChange={setPostStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="published">Đã đăng</Option>
              <Option value="draft">Nháp</Option>
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingPost(null);
              postForm.resetFields();
              setPostModalVisible(true);
            }}
          >
            Thêm bài viết
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAdminPosts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingPost ? 'Sửa bài viết' : 'Thêm bài viết mới'}
          visible={postModalVisible}
          onCancel={() => {
            setPostModalVisible(false);
            setEditingPost(null);
          }}
          onOk={() => postForm.submit()}
          width={800}
        >
          <Form
            form={postForm}
            layout="vertical"
            onFinish={handleSavePost}
          >
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="slug"
              label="Slug"
              rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="content"
              label="Nội dung"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
            >
              <TextArea rows={10} />
            </Form.Item>

            <Form.Item
              name="coverImage"
              label="Ảnh đại diện (URL)"
              rules={[{ required: true, message: 'Vui lòng nhập URL ảnh' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="tags"
              label="Thẻ"
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 thẻ' }]}
            >
              <Select mode="multiple" placeholder="Chọn thẻ">
                {tags.map(tag => (
                  <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select>
                <Option value="draft">Nháp</Option>
                <Option value="published">Đã đăng</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  };

  const renderAdminTagsPage = () => {
    const columns = [
      {
        title: 'Tên thẻ',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Số bài viết',
        dataIndex: 'postCount',
        key: 'postCount',
      },
      {
        title: 'Thao tác',
        key: 'action',
        render: (_: any, record: Tag) => (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingTag(record);
                tagForm.setFieldsValue({ name: record.name });
                setTagModalVisible(true);
              }}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Bạn có chắc muốn xóa thẻ này?"
              onConfirm={() => handleDeleteTag(record.id)}
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
      <>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTag(null);
              tagForm.resetFields();
              setTagModalVisible(true);
            }}
          >
            Thêm thẻ
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingTag ? 'Sửa thẻ' : 'Thêm thẻ mới'}
          visible={tagModalVisible}
          onCancel={() => {
            setTagModalVisible(false);
            setEditingTag(null);
          }}
          onOk={() => tagForm.submit()}
        >
          <Form
            form={tagForm}
            layout="vertical"
            onFinish={handleSaveTag}
          >
            <Form.Item
              name="name"
              label="Tên thẻ"
              rules={[{ required: true, message: 'Vui lòng nhập tên thẻ' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  };

  // ============ Main Layout ============
  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return renderHomePage();
      case 'post':
        return renderPostDetailPage();
      case 'about':
        return renderAboutPage();
      case 'admin-posts':
        return renderAdminPostsPage();
      case 'admin-tags':
        return renderAdminTagsPage();
      default:
        return renderHomePage();
    }
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: 'Trang chủ' },
    { key: 'about', icon: <UserOutlined />, label: 'Giới thiệu' },
    {
      key: 'admin',
      icon: <FileTextOutlined />,
      label: 'Quản lý',
      children: [
        { key: 'admin-posts', label: 'Bài viết' },
        { key: 'admin-tags', label: 'Thẻ' },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', display: 'flex', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginRight: 40 }}>
          Blog Cá Nhân
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key as any)}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>

      <Content style={{ padding: '0 50px', marginTop: 64 }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
          {currentPage === 'post' && <Breadcrumb.Item>Chi tiết bài viết</Breadcrumb.Item>}
          {currentPage === 'about' && <Breadcrumb.Item>Giới thiệu</Breadcrumb.Item>}
          {currentPage === 'admin-posts' && <Breadcrumb.Item>Quản lý bài viết</Breadcrumb.Item>}
          {currentPage === 'admin-tags' && <Breadcrumb.Item>Quản lý thẻ</Breadcrumb.Item>}
        </Breadcrumb>

        <div style={{ background: '#fff', padding: 24, minHeight: 380, borderRadius: 8 }}>
          {renderContent()}
        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        Blog Cá Nhân ©{new Date().getFullYear()} - Created with Ant Design
      </Footer>
    </Layout>
  );
};

export default BlogApp;