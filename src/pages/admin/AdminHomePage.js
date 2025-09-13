import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Card, Statistic, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import { getAllSclasses } from "../../redux/sclassRelated/sclassHandle";
import { getAllStudents } from "../../redux/studentRelated/studentHandle";
import { getAllTeachers } from "../../redux/teacherRelated/teacherHandle";
import SeeNotice from "../../components/SeeNotice";

const { Title } = Typography;

const AdminHomePage = () => {
  const dispatch = useDispatch();
  const { studentsList } = useSelector((state) => state.student);
  const { sclassesList } = useSelector((state) => state.sclass);
  const { teachersList } = useSelector((state) => state.teacher);
  const { currentUser } = useSelector((state) => state.user);

  const adminID = currentUser._id;

  useEffect(() => {
    dispatch(getAllStudents(adminID));
    dispatch(getAllSclasses(adminID, "Sclass"));
    dispatch(getAllTeachers(adminID));
  }, [adminID, dispatch]);

  const numberOfStudents = studentsList?.length || 0;
  const numberOfClasses = sclassesList?.length || 0;
  const numberOfTeachers = teachersList?.length || 0;

  const formatter = (value) => <CountUp end={value} separator="," />;

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📊 School Admin Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered hoverable>
            <Statistic
              title="Total Students"
              value={numberOfStudents}
              valueRender={() => formatter(numberOfStudents)}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered hoverable>
            <Statistic
              title="Total Classes"
              value={numberOfClasses}
              valueRender={() => formatter(numberOfClasses)}
              prefix={<BookOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered hoverable>
            <Statistic
              title="Total Teachers"
              value={numberOfTeachers}
              valueRender={() => formatter(numberOfTeachers)}
              prefix={<TeamOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered hoverable>
            <Statistic
              title="Fees Collection"
              value={23000}
              precision={2}
              valueRender={() => <CountUp end={23000} prefix="$" />}
              prefix={<DollarOutlined style={{ color: "#eb2f96" }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <span>
                <NotificationOutlined /> Notices
              </span>
            }
            bordered
          >
            <SeeNotice />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminHomePage;
