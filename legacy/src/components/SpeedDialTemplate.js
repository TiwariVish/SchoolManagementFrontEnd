import React from 'react';
import { FloatButton } from 'antd';
import { ControlOutlined } from '@ant-design/icons';

const SpeedDialTemplate = ({ actions }) => {
    return (
        <FloatButton.Group
            trigger="click"
            type="primary"
            style={{ right: 24, bottom: 24 }}
            icon={<ControlOutlined />}
        >
            {actions.map((action) => (
                <FloatButton
                    key={action.name}
                    icon={action.icon}
                    tooltip={action.name}
                    onClick={action.action}
                />
            ))}
        </FloatButton.Group>
    );
};

export default SpeedDialTemplate;