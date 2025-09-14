import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Layout,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Checkbox,
  Spin,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
  ToolOutlined,
  UserOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { loginUser } from "../redux/userRelated/userHandle";
import Popup from "../components/Popup";

import loginBackground from "../assets/image/bg-image.jpg";

const { Title, Text } = Typography;
const { Content } = Layout;

const LoginPage = ({ role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, currentUser, response, error, currentRole } = useSelector(
    (state) => state.user
  );

  const [loading, setLoading] = useState(false);
  const [guestLoader, setGuestLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const handleFinish = (values) => {
    setLoading(true);
    if (role === "Student") {
      const { rollNumber, studentName, password } = values;
      dispatch(loginUser({ rollNum: rollNumber, studentName, password }, role));
    } else {
      const { email, password } = values;
      dispatch(loginUser({ email, password }, role));
    }
  };

  const guestModeHandler = () => {
    const password = "zxc";
    setGuestLoader(true);

    if (role === "Admin") {
      dispatch(loginUser({ email: "yogendra@12", password }, role));
    } else if (role === "Student") {
      dispatch(
        loginUser(
          { rollNum: "1", studentName: "Dipesh Awasthi", password },
          role
        )
      );
    } else if (role === "Teacher") {
      dispatch(loginUser({ email: "tony@12", password }, role));
    }
  };

  useEffect(() => {
    if (status === "success" || currentUser !== null) {
      setLoading(false);
      setGuestLoader(false);
      if (currentRole === "Admin") navigate("/Admin/dashboard");
      else if (currentRole === "Student") navigate("/Student/dashboard");
      else if (currentRole === "Teacher") navigate("/Teacher/dashboard");
    } else if (status === "failed") {
      setMessage(response);
      setShowPopup(true);
      setLoading(false);
      setGuestLoader(false);
    } else if (status === "error") {
      setMessage("Network Error");
      setShowPopup(true);
      setLoading(false);
      setGuestLoader(false);
    }
  }, [status, currentRole, navigate, error, response, currentUser]);

  return (
    <Wrapper>
      <Overlay />
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          zIndex: 1,
          position: "relative",
        }}
      >
        <Card
          bordered={false}
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 14,
            background: "rgba(20,20,30,0.92)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 25px rgba(127,86,218,0.45)",
            padding: "2rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <ToolOutlined style={{ fontSize: 42, color: "#7f56da" }} />
            <Title
              level={3}
              style={{ color: "#eaeaea", margin: "12px 0 0 0" }}
            >
              {role} Login
            </Title>
            <Text style={{ color: "#bbb" }}>
              Welcome back! Please enter your details
            </Text>
          </div>

          <Form layout="vertical" onFinish={handleFinish}>
            {role === "Student" ? (
              <>
                <Form.Item
                  name="rollNumber"
                  rules={[{ required: true, message: "Roll number required" }]}
                >
                  <Input
                    prefix={<NumberOutlined />}
                    placeholder="Enter Roll Number"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="studentName"
                  rules={[{ required: true, message: "Name required" }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter your Name"
                    size="large"
                  />
                </Form.Item>
              </>
            ) : (
              <Form.Item
                name="email"
                rules={[{ required: true, message: "Email required" }]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>
            )}

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password required" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <Checkbox style={{ color: "#ccc" }}>Remember me</Checkbox>
              <StyledLink to="#">Forgot password?</StyledLink>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{
                  background: "linear-gradient(90deg,#7f56da,#4c2a99)",
                  borderRadius: 8,
                  border: "none",
                }}
              >
                Login
              </Button>
            </Form.Item>

            <Form.Item>
              {/* <Button
                block
                size="large"
                onClick={guestModeHandler}
                loading={guestLoader}
                style={{
                  borderColor: "#7f56da",
                  color: "#7f56da",
                  borderRadius: 8,
                }}
              >
                Login as Guest
              </Button> */}
            </Form.Item>

            {role === "Admin" && (
              <Text style={{ color: "#aaa" }}>
                Don’t have an account?{" "}
                <StyledLink to="/Adminregister">Sign up</StyledLink>
              </Text>
            )}
          </Form>
        </Card>
      </Content>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Wrapper>
  );
};

export default LoginPage;

/* Styles */
const Wrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f9f9ff 0%, #f3e8ff 100%);
  background-image: url(${loginBackground});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const StyledLink = styled(Link)`
  color: #7f56da;
  float: right;
  text-decoration: none;
`;
