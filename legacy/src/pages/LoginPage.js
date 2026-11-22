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

import { loginUser } from "../redux/userRelated/userHandle";
import Popup from "../components/Popup";


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
    <div className="auth-bg">
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
          zIndex: 1,
          position: "relative",
          padding: "20px"
        }}
      >
        <div className="auth-card" style={{ width: "100%", maxWidth: 440, padding: "3rem" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ 
              background: "var(--color-light-bg)", 
              width: "80px", 
              height: "80px", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 20px" 
            }}>
              <ToolOutlined style={{ fontSize: 36, color: "var(--color-primary)" }} />
            </div>
            <Title
              level={2}
              style={{ color: "var(--text-dark)", margin: "0 0 8px 0", fontWeight: 600 }}
            >
              {role} Login
            </Title>
            <Text style={{ color: "var(--text-light)", fontSize: "1.05rem" }}>
              Welcome back! Please enter your details
            </Text>
          </div>

          <Form layout="vertical" onFinish={handleFinish} size="large">
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
              <Checkbox style={{ color: "var(--text-light)" }}>Remember me</Checkbox>
              <Link to="#" style={{ color: "var(--color-primary)", float: "right", fontWeight: 500 }}>Forgot password?</Link>
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
              <Text style={{ color: "var(--text-light)" }}>
                Don’t have an account?{" "}
                <Link to="/Adminregister" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Sign up</Link>
              </Text>
            )}
          </Form>
        </div>
      </Content>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
};

export default LoginPage;
