import { useMemo, useState } from 'react';
import { useModel } from '@umijs/max';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Space,
} from 'antd';

const { Search } = Input;

const mockData = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
  { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
  { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
  { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
];

const ProductPage = () => {
  const [products, setProducts] = useState(mockData);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState('');

  // ===== Search realtime =====
  const filteredProducts = useMemo(() => {
    return products.filter((item) =>
      item.name.toLowerCase().includes(keyword.toLowerCase()),
    );
  }, [products, keyword]);

  // ===== Add =====
  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const newProduct = { id: products.length + 1, ...values };
      setProducts([...products, newProduct]);
      message.success('Thêm sản phẩm thành công');
      setOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Thêm sản phẩm thất bại');
    }
  };

  // ===== Delete =====
  const handleDelete = (id) => {
    setProducts(products.filter(product => product.id !== id));
    message.success('Xóa sản phẩm thành công');
  };

  const columns = [
    {
      title: 'STT',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      render: (value) =>
        value.toLocaleString('vi-VN') + ' ₫',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xóa?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm theo tên sản phẩm..."
          allowClear
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 300 }}
        />

        <Button type="primary" onClick={() => setOpen(true)}>
          Thêm sản phẩm
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredProducts}
      />

      <Modal
        title="Thêm sản phẩm"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleAdd}
        okText="Thêm"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[
              { required: true, message: 'Vui lòng nhập tên sản phẩm' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              { type: 'number', min: 1, message: 'Giá phải là số dương' },
            ]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải là số nguyên dương' },
            ]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductPage;
