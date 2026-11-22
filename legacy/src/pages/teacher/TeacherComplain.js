import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title } = Typography;

const TeacherComplain = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Empty 
          description={
            <span>
              <Title level={4}>Complaints Module</Title>
              This section is currently under construction.
            </span>
          }
        />
      </Card>
    </div>
  );
};

export default TeacherComplain;