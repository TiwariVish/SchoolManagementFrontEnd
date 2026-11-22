import React from "react";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  NotificationOutlined,
  TeamOutlined,
  FileTextOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;

const SideBar = () => {
  const location = useLocation();

  const items = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: "/Admin/classes",
      icon: <BookOutlined />,
      label: <Link to="/Admin/classes">Classes</Link>,
    },
    {
      key: "/Admin/subjects",
      icon: <FileTextOutlined />,
      label: <Link to="/Admin/subjects">Subjects</Link>,
    },
    {
      key: "/Admin/teachers",
      icon: <TeamOutlined />,
      label: <Link to="/Admin/teachers">Teachers</Link>,
    },
    {
      key: "/Admin/students",
      icon: <UserOutlined />,
      label: <Link to="/Admin/students">Students</Link>,
    },
    {
      key: "/Admin/notices",
      icon: <NotificationOutlined />,
      label: <Link to="/Admin/notices">Notices</Link>,
    },
    {
      key: "/Admin/complains",
      icon: <ExclamationCircleOutlined />,
      label: <Link to="/Admin/complains">Complains</Link>,
    },
    {
      type: "group",
      label: "User",
      children: [
        {
          key: "/Admin/profile",
          icon: <ProfileOutlined />,
          label: <Link to="/Admin/profile">Profile</Link>,
        },
        {
          key: "/logout",
          icon: <LogoutOutlined />,
          label: <Link to="/logout">Logout</Link>,
        },
      ],
    },
  ];

  return (
    <Sider collapsible>
      <div
        style={{
          height: 64,
          margin: 16,
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: 8,
        }}
      />
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[location.pathname]}
        items={items}
      />
    </Sider>
  );
};

export default SideBar;
