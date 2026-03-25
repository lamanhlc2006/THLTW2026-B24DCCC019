// pages/QuanLi/index.tsx
import React from 'react';
import { Tabs } from 'antd';
import DiplomaBookManagement from './QuanLySoVanBang';
import GraduationDecisionManagement from './QuyetDinhTotNghiep';
import TemplateFieldManagement from './CauHinhBieuMauPhuLucVanBang';
import DiplomaInfoManagement from './ThongTinVanBang';
import DiplomaSearch from './TraCuuVanBang';

const { TabPane } = Tabs;

const QuanLi: React.FC = () => {
  return (
    <div>
      <h1>Quản Lý Văn Bằng</h1>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Quản Lý Sổ Văn Bằng" key="1">
          <DiplomaBookManagement />
        </TabPane>
        <TabPane tab="Quyết Định Tốt Nghiệp" key="2">
          <GraduationDecisionManagement />
        </TabPane>
        <TabPane tab="Cấu Hình Biểu Mẫu Phụ Lục Văn Bằng" key="3">
          <TemplateFieldManagement />
        </TabPane>
        <TabPane tab="Thông Tin Văn Bằng" key="4">
          <DiplomaInfoManagement />
        </TabPane>
        <TabPane tab="Tra Cứu Văn Bằng" key="5">
          <DiplomaSearch />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default QuanLi;