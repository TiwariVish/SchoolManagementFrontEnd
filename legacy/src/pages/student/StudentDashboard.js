import { useState } from 'react';
import { Layout, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Navigate, Route, Routes } from 'react-router-dom';

import StudentSideBar from './StudentSideBar';
import StudentHomePage from './StudentHomePage';
import StudentProfile from './StudentProfile';
import StudentSubjects from './StudentSubjects';
import ViewStdAttendance from './ViewStdAttendance';
import StudentComplain from './StudentComplain';
import Logout from '../Logout';
import AccountMenu from '../../components/AccountMenu';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const StudentDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        theme="dark"   
        style={{
          background: '#001529', 
        }}
      >
        <div style={{ padding: 16, textAlign: 'center', color: '#fff', fontWeight: 600 }}>
          {collapsed ? "" : ""}
        </div>
        <StudentSideBar />
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            background: '#1677ff',   
            color: '#fff',
          }}
        >
          <div
            style={{ fontSize: 20, cursor: 'pointer', marginRight: 16, color: '#fff' }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Title level={4} style={{ margin: 0, flexGrow: 1, color: '#fff' }}>
            Student Dashboard
          </Title>
          <AccountMenu />
        </Header>

        {/* Content */}
        <Content style={{ margin: '16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/" element={<StudentHomePage />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/Student/dashboard" element={<StudentHomePage />} />
            <Route path="/Student/profile" element={<StudentProfile />} />
            <Route path="/Student/subjects" element={<StudentSubjects />} />
            <Route path="/Student/attendance" element={<ViewStdAttendance />} />
            <Route path="/Student/complain" element={<StudentComplain />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentDashboard;
