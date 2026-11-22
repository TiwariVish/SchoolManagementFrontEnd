import React from 'react';
import { Avatar, Dropdown, Space, Divider } from 'antd';
import { SettingOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AccountMenu = () => {
    const navigate = useNavigate();
    const { currentRole, currentUser } = useSelector(state => state.user);

    const items = [
        {
            key: '1',
            icon: <UserOutlined />,
            label: (
                <Link to={`/${currentRole}/profile`}>
                    Profile
                </Link>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
        {
            key: '3',
            icon: <LogoutOutlined />,
            label: (
                <Link to="/logout">
                    Logout
                </Link>
            ),
        },
    ];

    return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer' }}>
                <Space>
                    <Avatar 
                        size={36} 
                        style={{ backgroundColor: 'var(--color-primary)', verticalAlign: 'middle', fontSize: '16px' }}
                    >
                        {String(currentUser?.name || "U").charAt(0).toUpperCase()}
                    </Avatar>
                </Space>
            </a>
        </Dropdown>
    );
}

export default AccountMenu;