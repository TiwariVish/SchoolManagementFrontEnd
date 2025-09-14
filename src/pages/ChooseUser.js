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
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f9f9ff 0%, #f3e8ff 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Content style={{ flex: 1, padding: "3rem 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <Title level={1} style={{ color: "#4b0082" }}>
            Welcome to School Management System
          </Title>
          <Paragraph style={{ maxWidth: 700, margin: "0 auto", fontSize: "16px" }}>
            A modern platform to streamline school management, organize classes, 
            and manage students and faculty. Easily track attendance, assess performance, 
            and provide feedback. Access records, view marks, and communicate effortlessly.
          </Paragraph>
        </div>

   
        <Row gutter={[24, 24]} justify="center">
 
          <Col xs={24} sm={12} md={8}>
            <CardOption
              icon={<UserOutlined style={{ fontSize: 40, color: "#7f56da" }} />}
              title="Admin"
              text="Login as an administrator to manage dashboards, data, and school operations."
              onClick={() => navigateHandler("Admin")}
            />
          </Col>

 
          <Col xs={24} sm={12} md={8}>
            <CardOption
              icon={<ReadOutlined style={{ fontSize: 40, color: "#7f56da" }} />}
              title="Student"
              text="Login as a student to explore classes, view results, and track progress."
              onClick={() => navigateHandler("Student")}
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <CardOption
              icon={<TeamOutlined style={{ fontSize: 40, color: "#7f56da" }} />}
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
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            color: "#fff",
          }}
        >
          <Spin size="large" />
          <Paragraph style={{ color: "#fff", marginTop: 10 }}>
            Please Wait...
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

   
      <Footer style={{ textAlign: "center", background: "#7f56da", color: "#fff" }}>
        © {new Date().getFullYear()} School Management System | Designed for modern education
      </Footer>
    </Layout>
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
      borderRadius: "12px",
      backgroundColor: "#fff",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
      height: "100%",
    }}
    bodyStyle={{ padding: "2rem" }}
  >
    <div style={{ marginBottom: 16 }}>{icon}</div>
    <Title level={3} style={{ color: "#4b0082" }}>
      {title}
    </Title>
    <Paragraph style={{ color: "#555" }}>{text}</Paragraph>
  </Card>
);
