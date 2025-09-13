import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Card, Typography, Row, Col, Divider, Space } from 'antd';

const { Title, Text } = Typography;

const StudentProfile = () => {
  const { currentUser, response, error } = useSelector((state) => state.user);

  if (response) console.log(response);
  if (error) console.log(error);

  const sclassName = currentUser?.sclassName;
  const studentSchool = currentUser?.school;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: 20 }}>
      {/* Profile Header */}
      <Card bordered={false} style={{ textAlign: 'center' }}>
        <Avatar 
          size={150} 
          style={{ backgroundColor: '#1677ff', fontSize: 48, marginBottom: 16 }}
        >
          {String(currentUser?.name).charAt(0)}
        </Avatar>
        <Title level={3}>{currentUser?.name}</Title>
        <Text type="secondary">Roll No: {currentUser?.rollNum}</Text>
        <br />
        <Text type="secondary">Class: {sclassName?.sclassName}</Text>
        <br />
        <Text type="secondary">School: {studentSchool?.schoolName}</Text>
      </Card>

      {/* Personal Information */}
      <Card title="Personal Information" bordered>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Text strong>Date of Birth: </Text>
            <Text>January 1, 2000</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Gender: </Text>
            <Text>Male</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Email: </Text>
            <Text>john.doe@example.com</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Phone: </Text>
            <Text>(123) 456-7890</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Address: </Text>
            <Text>123 Main Street, City, Country</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Emergency Contact: </Text>
            <Text>(987) 654-3210</Text>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default StudentProfile;
