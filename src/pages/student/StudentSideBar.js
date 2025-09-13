import { Menu } from 'antd';
import {
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  NotificationOutlined,
  BookOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const StudentSideBar = () => {
  const location = useLocation();

  return (
    <Menu
      mode="inline"
      theme="dark"  // 👈 dark theme matches Sider background
      selectedKeys={[location.pathname]}
      style={{ height: '100%', borderRight: 0 }}
    >
      <Menu.Item key="/" icon={<HomeOutlined />}>
        <Link to="/">Home</Link>
      </Menu.Item>
      <Menu.Item key="/Student/subjects" icon={<BookOutlined />}>
        <Link to="/Student/subjects">Subjects</Link>
      </Menu.Item>
      <Menu.Item key="/Student/attendance" icon={<ProfileOutlined />}>
        <Link to="/Student/attendance">Attendance</Link>
      </Menu.Item>
      <Menu.Item key="/Student/complain" icon={<NotificationOutlined />}>
        <Link to="/Student/complain">Complain</Link>
      </Menu.Item>

      <Menu.Divider />

      <Menu.ItemGroup key="user" title="User">
        <Menu.Item key="/Student/profile" icon={<UserOutlined />}>
          <Link to="/Student/profile">Profile</Link>
        </Menu.Item>
        <Menu.Item key="/logout" icon={<LogoutOutlined />}>
          <Link to="/logout">Logout</Link>
        </Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  );
};

export default StudentSideBar;
