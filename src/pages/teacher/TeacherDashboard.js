import React, { useState } from "react";
import { Layout, Typography, Menu } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  TeamOutlined,
  NotificationOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Navigate, Route, Routes, Link, useLocation } from "react-router-dom";

import TeacherHomePage from "./TeacherHomePage";
import TeacherProfile from "./TeacherProfile";
import TeacherComplain from "./TeacherComplain";
import TeacherClassDetails from "./TeacherClassDetails";
import TeacherViewStudent from "./TeacherViewStudent";
import StudentAttendance from "../admin/studentRelated/StudentAttendance";
import StudentExamMarks from "../admin/studentRelated/StudentExamMarks";
import Logout from "../Logout";
import AccountMenu from "../../components/AccountMenu";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const TeacherDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        theme="dark"
        style={{
          background: "#001529",
        }}
      >

        <div
          style={{
            padding: 16,
            textAlign: "center",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {collapsed ? "TD" : "Teacher Dashboard"}
        </div>

  
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0 }}
        >
          <Menu.Item key="/" icon={<HomeOutlined />}>
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="/Teacher/class" icon={<TeamOutlined />}>
            <Link to="/Teacher/class">My Class</Link>
          </Menu.Item>
          <Menu.Item key="/Teacher/complain" icon={<NotificationOutlined />}>
            <Link to="/Teacher/complain">Complain</Link>
          </Menu.Item>
          <Menu.Item key="/Teacher/profile" icon={<UserOutlined />}>
            <Link to="/Teacher/profile">Profile</Link>
          </Menu.Item>
          <Menu.Item key="/logout" icon={<LogoutOutlined />}>
            <Link to="/logout">Logout</Link>
          </Menu.Item>
        </Menu>
      </Sider>


      <Layout>
  
        <Header
          style={{
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            background: "#1677ff",
            color: "#fff",
          }}
        >
     
          <div
            style={{
              fontSize: 20,
              cursor: "pointer",
              marginRight: 16,
              color: "#fff",
            }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

    
          <Title
            level={4}
            style={{ margin: 0, flexGrow: 1, color: "#fff" }}
          >
            Teacher Dashboard
          </Title>

     
          <AccountMenu />
        </Header>


        <Content
          style={{
            margin: "16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <Routes>
            <Route path="/" element={<TeacherHomePage />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/Teacher/dashboard" element={<TeacherHomePage />} />
            <Route path="/Teacher/profile" element={<TeacherProfile />} />
            <Route path="/Teacher/complain" element={<TeacherComplain />} />
            <Route path="/Teacher/class" element={<TeacherClassDetails />} />
            <Route
              path="/Teacher/class/student/:id"
              element={<TeacherViewStudent />}
            />
            <Route
              path="/Teacher/class/student/attendance/:studentID/:subjectID"
              element={<StudentAttendance situation="Subject" />}
            />
            <Route
              path="/Teacher/class/student/marks/:studentID/:subjectID"
              element={<StudentExamMarks situation="Subject" />}
            />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherDashboard;
