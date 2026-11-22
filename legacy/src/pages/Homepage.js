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
          padding: "80px 10%",
          background: "var(--color-light-bg)",
        }}
      >
        <Row gutter={[48, 48]} align="middle">
          {/* Left Content */}
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Title level={1} style={{ fontSize: "3.5rem", color: "var(--text-dark)", lineHeight: 1.2, margin: 0 }}>
                Manage your school <span style={{ color: "var(--color-primary)" }}>effortlessly</span>
              </Title>
              <Paragraph style={{ fontSize: "1.2rem", color: "var(--text-light)", lineHeight: 1.6 }}>
                Streamline school management, organize classes, and manage
                students and faculty. Track attendance, evaluate performance,
                and communicate with parents seamlessly.
              </Paragraph>

              <Space size="middle" style={{ marginTop: 24 }}>
                <Link to="/choose">
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      height: "50px",
                      padding: "0 40px",
                      fontSize: "1.1rem",
                      fontWeight: 500,
                    }}
                  >
                    Get Started / Login
                  </Button>
                </Link>
              </Space>

              <Paragraph style={{ marginTop: 16, fontSize: "1rem", color: "var(--text-light)" }}>
                Don’t have an account?{" "}
                <Link to="/Adminregister" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                  Register your school
                </Link>
              </Paragraph>
            </Space>
          </Col>

          {/* Right Image */}
          <Col xs={24} md={12}>
            <div style={{
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}>
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Students walking on campus" 
                style={{ width: "100%", display: "block" }} 
              />
            </div>
          </Col>
        </Row>

        <Row gutter={[32, 32]} style={{ marginTop: 100 }}>
          <Col xs={24} sm={12} md={6}>
            <FeatureCard
              icon={<BookOutlined style={{ fontSize: "2.5rem", color: "var(--color-primary)" }} />}
              title="Class Management"
              text="Easily create and manage classes with assigned teachers and students."
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <FeatureCard
              icon={<TeamOutlined style={{ fontSize: "2.5rem", color: "var(--color-primary)" }} />}
              title="Faculty & Students"
              text="Add and manage faculty, students, and their academic records."
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <FeatureCard
              icon={<ScheduleOutlined style={{ fontSize: "2.5rem", color: "var(--color-primary)" }} />}
              title="Attendance & Schedule"
              text="Track attendance, assign homework, and maintain school timetables."
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <FeatureCard
              icon={<UserOutlined style={{ fontSize: "2.5rem", color: "var(--color-primary)" }} />}
              title="Parent Portal"
              text="Parents can access student performance, marks, and feedback."
            />
          </Col>
        </Row>
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "var(--text-dark)",
          color: "#fff",
          padding: "60px 20px",
        }}
      >
        <Title level={4} style={{ color: "#fff", marginBottom: 20 }}>
          School Management System
        </Title>
        <Paragraph style={{ color: "#94a3b8" }}>
          © {new Date().getFullYear()} All Rights Reserved | Powered by Ant Design
        </Paragraph>
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
