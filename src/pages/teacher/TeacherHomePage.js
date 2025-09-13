import React, { useEffect } from "react";
import { Row, Col, Card, Typography } from "antd";
import SeeNotice from "../../components/SeeNotice";
import CountUp from "react-countup";
import Students from "../../assets/img1.png";
import Lessons from "../../assets/subjects.svg";
import Tests from "../../assets/assignment.svg";
import Time from "../../assets/time.svg";
import { getClassStudents, getSubjectDetails } from "../../redux/sclassRelated/sclassHandle";
import { useDispatch, useSelector } from "react-redux";

const { Title, Text } = Typography;

const TeacherHomePage = () => {
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);

  const classID = currentUser?.teachSclass?._id;
  const subjectID = currentUser?.teachSubject?._id;

  useEffect(() => {
    if (subjectID) dispatch(getSubjectDetails(subjectID, "Subject"));
    if (classID) dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  const numberOfStudents = sclassStudents?.length || 0;
  const numberOfSessions = subjectDetails?.sessions || 0;

  const cards = [
    {
      title: "Class Students",
      value: numberOfStudents,
      img: Students,
      duration: 2.5,
    },
    {
      title: "Total Lessons",
      value: numberOfSessions,
      img: Lessons,
      duration: 5,
    },
    {
      title: "Tests Taken",
      value: 24,
      img: Tests,
      duration: 4,
    },
    {
      title: "Total Hours",
      value: 30,
      img: Time,
      duration: 4,
      suffix: " hrs",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        {cards.map((card, index) => (
          <Col xs={24} sm={12} md={12} lg={6} key={index}>
            <Card
              bordered={false}
              style={{
                textAlign: "center",
                borderRadius: 12,
                height: 200,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <img src={card.img} alt={card.title} style={{ width: 50, marginBottom: 12 }} />
              <Title level={5}>{card.title}</Title>
              <Text style={{ fontSize: "1.4rem", color: "green", fontWeight: "bold" }}>
                <CountUp
                  start={0}
                  end={card.value}
                  duration={card.duration}
                  suffix={card.suffix || ""}
                />
              </Text>
            </Card>
          </Col>
        ))}

 
        <Col span={24}>
          <Card
            title="Notices"
            bordered={false}
            style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            <SeeNotice />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherHomePage;
