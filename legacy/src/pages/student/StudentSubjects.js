import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import CustomBarChart from '../../components/CustomBarChart';
import { Table, Typography, Progress, Spin, Card, Divider } from 'antd';

const { Title, Text } = Typography;

const StudentSubjects = () => {
  const dispatch = useDispatch();
  const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
  const { userDetails, currentUser, loading } = useSelector((state) => state.user);

  const [subjectMarks, setSubjectMarks] = useState([]);

 
  useEffect(() => {
    if (currentUser?._id && currentUser?.sclassName?._id) {
      dispatch(getUserDetails(currentUser._id, "Student"));
      dispatch(getSubjectList(currentUser.sclassName._id, "ClassSubjects"));
    }
  }, [dispatch, currentUser?._id, currentUser?.sclassName?._id]);


  useEffect(() => {
    if (userDetails) {
      setSubjectMarks(userDetails.examResult || []);
    }
  }, [userDetails]);

  const getProgressColor = (marks) => {
    if (marks >= 85) return '#52c41a'; 
    if (marks >= 60) return '#faad14'; 
    return '#f5222d'; 
  };

  const columns = [
    {
      title: 'Subject Name',
      dataIndex: ['subName', 'subName'],
      key: 'subject',
    },
    {
      title: 'Marks Obtained',
      dataIndex: 'marksObtained',
      key: 'marks',
      render: (marks) => marks || 0,
    },
    {
      title: 'Progress',
      dataIndex: 'marksObtained',
      key: 'progress',
      render: (marks) => (
        <Progress
          percent={marks || 0}
          strokeColor={getProgressColor(marks)}
          size="small"
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f0f2f5' }}>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <Spin size="large" />
        </div>
      ) : subjectMarks && subjectMarks.length > 0 ? (
        <>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
            Subject Performance Overview
          </Title>

          <Table
            columns={columns}
            dataSource={subjectMarks}
            rowKey={(record, index) => index}
            pagination={false}
          />

          <Divider style={{ margin: '40px 0' }} />

          <Card>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
              Marks Chart
            </Title>
            <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
          </Card>
        </>
      ) : (
        <Card style={{ textAlign: 'center' }}>
          <Title level={4}>Class Details</Title>
          <Divider />
          <Text style={{ fontSize: 16 }}>
            You are currently in Class: <b>{sclassDetails?.sclassName || 'N/A'}</b>
          </Text>
          <Divider />
          <Text style={{ fontSize: 16 }}>Subjects:</Text>
          <ul style={{ textAlign: 'left', marginLeft: 50 }}>
            {subjectsList?.map((subject, idx) => (
              <li key={idx}>
                {subject.subName} ({subject.subCode})
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default StudentSubjects;
