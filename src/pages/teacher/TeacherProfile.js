import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Card, Typography, Row, Col, Divider, Space } from 'antd';
import { MailOutlined, BookOutlined, HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TeacherProfile = () => {
  const { currentUser, response, error } = useSelector((state) => state.user);

  if (response) console.log(response);
  if (error) console.log(error);

  const teachSclass = currentUser?.teachSclass;
  const teachSubject = currentUser?.teachSubject;
  const teachSchool = currentUser?.school;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: 20 }}>
      <Card bordered={false} style={{ textAlign: 'center' }}>
        <Avatar
          size={150}
          style={{ backgroundColor: '#1890ff', fontSize: 48, marginBottom: 16 }}
        >
          {String(currentUser?.name || 'T').charAt(0)}
        </Avatar>
        <Title level={3}>{currentUser?.name}</Title>
        <Text type="secondary">Email: {currentUser?.email}</Text>
        <br />
        <Text type="secondary">Class: {teachSclass?.sclassName}</Text>
        <br />
        <Text type="secondary">School: {teachSchool?.schoolName}</Text>
      </Card>


      <Card title="Teaching Details" bordered>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Text strong><BookOutlined /> Subject: </Text>
            <Text>{teachSubject?.subName || 'N/A'}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong><HomeOutlined /> School: </Text>
            <Text>{teachSchool?.schoolName || 'N/A'}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Email: </Text>
            <Text>{currentUser?.email}</Text>
          </Col>
   
        </Row>
      </Card>
    </Space>
  );
};

export default TeacherProfile;
