import React from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Card,
  Layout,
  Space,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ScheduleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Students from "../assets/students.svg";

const { Title, Paragraph } = Typography;
const { Footer, Content } = Layout;

const Homepage = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content
        style={{
          padding: "40px 80px",
          background: "linear-gradient(135deg, #f9f9ff 0%, #f3e8ff 100%)",
        }}
      >
        <Row gutter={[32, 32]} align="middle">
          {/* Left Image */}
          <Col xs={24} md={12}>
            <img src={Students} alt="students" style={{ width: "100%" }} />
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Title level={1} style={{ marginBottom: 0, color: "#2c2c2c" }}>
                Welcome to <br /> School Management System
              </Title>
              <Paragraph style={{ fontSize: "1.1rem", color: "#444" }}>
                Streamline school management, organize classes, and manage
                students and faculty. Track attendance, evaluate performance,
                and communicate with parents effortlessly.
              </Paragraph>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Link to="/choose">
                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{
                      backgroundColor: "#7f56da",
                      borderColor: "#7f56da",
                    }}
                  >
                    Login
                  </Button>
                </Link>
                {/* <Link to="/chooseasguest">
                  <Button type="default" size="large" block>
                    Login as Guest
                  </Button>
                </Link> */}
              </Space>

              <Paragraph style={{ marginTop: 16, fontSize: "1rem" }}>
                Don’t have an account?{" "}
                <Link to="/Adminregister" style={{ color: "#550080" }}>
                  Sign up
                </Link>
              </Paragraph>
            </Space>
          </Col>
        </Row>

     
        <Row gutter={[24, 24]} style={{ marginTop: 60 }}>
          <Col xs={24} sm={12} md={6}>
            <FeatureCard
              icon={<BookOutlined style={{ fontSize: "2rem", color: "#7f56da" }} />}
              title="Class Management"
              text="Easily create and manage classes with assigned teachers and students."
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <FeatureCard
              icon={<TeamOutlined style={{ fontSize: "2rem", color: "#7f56da" }} />}
              title="Faculty & Students"
              text="Add and manage faculty, students, and their academic records."
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <FeatureCard
              icon={<ScheduleOutlined style={{ fontSize: "2rem", color: "#7f56da" }} />}
              title="Attendance & Schedule"
              text="Track attendance, assign homework, and maintain school timetables."
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <FeatureCard
              icon={<UserOutlined style={{ fontSize: "2rem", color: "#7f56da" }} />}
              title="Parent Portal"
              text="Parents can access student performance, marks, and feedback."
            />
          </Col>
        </Row>
      </Content>


      <Footer
        style={{
          textAlign: "center",
          background: "#7f56da",
          color: "#fff",
          padding: "40px 20px",
        }}
      >
        <Title level={4} style={{ color: "#fff", marginBottom: 10 }}>
          School Management System
        </Title>
        <Paragraph style={{ color: "#f0f0f0" }}>
          © {new Date().getFullYear()} All Rights Reserved | Powered by Ant
          Design
        </Paragraph>
        <Space size="large">
          <Link to="/about" style={{ color: "#fff" }}>
            About Us
          </Link>
          <Link to="/contact" style={{ color: "#fff" }}>
            Contact
          </Link>
          <Link to="/help" style={{ color: "#fff" }}>
            Help
          </Link>
        </Space>
      </Footer>
    </Layout>
  );
};

export default Homepage;

const FeatureCard = ({ icon, title, text }) => (
  <Card
    hoverable
    bordered={false}
    style={{
      borderRadius: "12px",
      textAlign: "center",
      minHeight: "220px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}
  >
    <div style={{ marginBottom: 16 }}>{icon}</div>
    <Title level={4}>{title}</Title>
    <Paragraph>{text}</Paragraph>
  </Card>
);
