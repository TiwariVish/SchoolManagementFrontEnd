import React from "react";
import {
  Menu,
  Layout,
} from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  NotificationOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const { Sider } = Layout;

const TeacherSideBar = ({ collapsed }) => {
  const { currentUser } = useSelector((state) => state.user);
  const sclassName = currentUser?.teachSclass?.sclassName || "Class";

  const location = useLocation();

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={220}
      theme="dark"
      style={{
        background: "#001529",
        height: "100vh",
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
          <Link to="/Teacher/class">Class {sclassName}</Link>
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
  );
};

export default TeacherSideBar;
