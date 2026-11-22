import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Typography, Spin, Modal, Layout } from "antd";
import { UserOutlined, TeamOutlined, ReadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/userRelated/userHandle";

const { Title, Paragraph } = Typography;
const { Content, Footer } = Layout;

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";

  const { status, currentUser, currentRole } = useSelector(
    (state) => state.user
  );

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "Admin") {
      if (visitor === "guest") {
        const email = "yogendra@12";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate("/Adminlogin");
      }
    } else if (user === "Student") {
      if (visitor === "guest") {
        const rollNum = "1";
        const studentName = "Dipesh Awasthi";
        const fields = { rollNum, studentName, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate("/Studentlogin");
      }
    } else if (user === "Teacher") {
      if (visitor === "guest") {
        const email = "tony@12";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate("/Teacherlogin");
      }
    }
  };

  useEffect(() => {
    if (status === "success" || currentUser !== null) {
      if (currentRole === "Admin") {
        navigate("/Admin/dashboard");
      } else if (currentRole === "Student") {
        navigate("/Student/dashboard");
      } else if (currentRole === "Teacher") {
        navigate("/Teacher/dashboard");
      }
    } else if (status === "error") {
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <div className="auth-bg">
      <Content style={{ width: "100%", padding: "4rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <Title level={1} style={{ color: "var(--text-dark)", fontSize: "3rem" }}>
            Choose Your Role
          </Title>
          <Paragraph style={{ maxWidth: 700, margin: "0 auto", fontSize: "1.1rem", color: "var(--text-light)" }}>
            Select how you want to log in to the School Management System. 
            Access dashboards tailored to administrators, teachers, and students.
          </Paragraph>
        </div>

        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <CardOption
              icon={<UserOutlined style={{ fontSize: 50, color: "var(--color-primary)" }} />}
              title="Admin"
              text="Login as an administrator to manage dashboards, data, and school operations."
              onClick={() => navigateHandler("Admin")}
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <CardOption
              icon={<ReadOutlined style={{ fontSize: 50, color: "var(--color-primary)" }} />}
              title="Student"
              text="Login as a student to explore classes, view results, and track progress."
              onClick={() => navigateHandler("Student")}
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <CardOption
              icon={<TeamOutlined style={{ fontSize: 50, color: "var(--color-primary)" }} />}
              title="Teacher"
              text="Login as a teacher to manage courses, create assignments, and guide students."
              onClick={() => navigateHandler("Teacher")}
            />
          </Col>
        </Row>
      </Content>

      {loader && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <Spin size="large" />
          <Paragraph style={{ color: "var(--text-dark)", marginTop: 16, fontSize: "1.1rem", fontWeight: 500 }}>
            Logging in...
          </Paragraph>
        </div>
      )}

      <Modal
        open={showPopup}
        onCancel={() => setShowPopup(false)}
        onOk={() => setShowPopup(false)}
        title="Error"
        centered
      >
        <Paragraph>{message}</Paragraph>
      </Modal>
    </div>
  );
};

export default ChooseUser;

// Reusable Card for each role
const CardOption = ({ icon, title, text, onClick }) => (
  <Card
    hoverable
    onClick={onClick}
    style={{
      textAlign: "center",
      borderRadius: "20px",
      backgroundColor: "#fff",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      height: "100%",
      border: "none"
    }}
    bodyStyle={{ padding: "3rem 2rem" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-10px)";
      e.currentTarget.style.boxShadow = "0 20px 40px rgba(79, 70, 229, 0.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)";
    }}
  >
    <div style={{ marginBottom: 24, background: "var(--color-light-bg)", display: "inline-block", padding: "20px", borderRadius: "50%" }}>{icon}</div>
    <Title level={3} style={{ color: "var(--text-dark)", fontWeight: 600 }}>
      {title}
    </Title>
    <Paragraph style={{ color: "var(--text-light)", fontSize: "1.05rem" }}>{text}</Paragraph>
  </Card>
);
